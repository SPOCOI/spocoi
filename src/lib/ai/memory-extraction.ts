import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isPlatformCapExceeded, recordUsage } from "@/lib/ai/usage-cap";

const MODEL = "claude-haiku-4-5-20251001";

/**
 * Fixed taxonomy, decided in chat before building this — keeps entries
 * comparable for dedup and groupable in the /account UI. Must match the
 * `memory_entries_category_check` constraint in the DB.
 */
export const MEMORY_CATEGORIES = [
  "relatii",
  "job",
  "sanatate",
  "obiective",
  "stresori_recurenti",
  "preferinte",
  "altele",
] as const;
type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

function isMemoryCategory(value: unknown): value is MemoryCategory {
  return typeof value === "string" && (MEMORY_CATEGORIES as readonly string[]).includes(value);
}

/** Only run extraction once at least this many new user messages have
 * accumulated since the last pass — avoids an AI call after every "salut". */
const MIN_NEW_USER_MESSAGES = 6;

/** Bounds both cost and prompt size on a user's first-ever extraction,
 * when memory_last_extracted_at is null and there could be a long backlog. */
const MAX_MESSAGES_PER_RUN = 40;

/** Bounds a single extraction response — a runaway model output shouldn't
 * be able to mass-write the table. */
const MAX_OPS_PER_RUN = 20;

let client: Anthropic | null = null;
function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY — check .env.local.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

type ExistingEntry = { id: string; category: string; content: string };

type ExtractionOp =
  | { action: "add"; category: MemoryCategory; content: string }
  | { action: "update"; entryId: string; content: string }
  | { action: "remove"; entryId: string };

const EXTRACTION_SYSTEM_PROMPT = `Extragi fapte durabile despre o persoană dintr-o conversație cu un AI de suport emoțional, ca să construiești un portret pe termen lung.

O "fapte durabilă" e ceva care rămâne adevărat peste săptămâni/luni: relații (nume, rol), job, sănătate, obiective, stresori recurenți, preferințe. NU extrage stări trecătoare ("azi sunt obosit"), conținut al unei singure conversații fără valoare de durată, sau lucruri pe care persoana nu le-a spus explicit chiar ea.

Ți se dau faptele deja cunoscute (cu id) și mesajele noi din conversație. Răspunde DOAR cu un JSON — un array de operații, fără text în jur:
- {"action":"add","category":"...","content":"..."} — un fapt nou, care nu există deja
- {"action":"update","entryId":"...","content":"..."} — un fapt existent confirmat din nou sau completat cu detalii noi
- {"action":"remove","entryId":"...} — un fapt existent care nu mai e adevărat (persoana a spus explicit contrariul)

Categoria trebuie să fie una din: relatii, job, sanatate, obiective, stresori_recurenti, preferinte, altele.

Dacă nu sunt fapte durabile noi de reținut, răspunde cu "[]". Nu inventa niciodată un fapt care nu a fost spus explicit.`;

function buildUserPrompt(existing: ExistingEntry[], transcript: string): string {
  const existingBlock =
    existing.length > 0
      ? existing.map((e) => `- id=${e.id} [${e.category}] ${e.content}`).join("\n")
      : "(niciunul încă)";

  return `Fapte deja cunoscute:\n${existingBlock}\n\nMesaje noi din conversație:\n${transcript}`;
}

function parseOps(raw: string): ExtractionOp[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const ops: ExtractionOp[] = [];
  for (const item of parsed.slice(0, MAX_OPS_PER_RUN)) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;

    if (
      obj.action === "add" &&
      isMemoryCategory(obj.category) &&
      typeof obj.content === "string" &&
      obj.content.trim()
    ) {
      ops.push({ action: "add", category: obj.category, content: obj.content.trim() });
    } else if (
      obj.action === "update" &&
      typeof obj.entryId === "string" &&
      typeof obj.content === "string" &&
      obj.content.trim()
    ) {
      ops.push({ action: "update", entryId: obj.entryId, content: obj.content.trim() });
    } else if (obj.action === "remove" && typeof obj.entryId === "string") {
      ops.push({ action: "remove", entryId: obj.entryId });
    }
  }
  return ops;
}

/**
 * Fire-and-forget from sendMessage via waitUntil() — runs after the user
 * already has their reply, so it never adds perceived latency. Every
 * failure mode here is a silent no-op (logged, never thrown): a missed
 * or malformed extraction pass just means the portrait catches up next
 * time, which is a much smaller problem than crashing a background task.
 */
export async function runMemoryExtraction(userId: string, conversationId: string): Promise<void> {
  try {
    const admin = supabaseAdmin();

    const { data: profile } = await admin
      .from("profiles")
      .select("personalization_enabled, memory_last_extracted_at, tier")
      .eq("id", userId)
      .single();

    if (!profile?.personalization_enabled) return;

    const tier = profile.tier ?? "free";
    if (await isPlatformCapExceeded(tier)) return;

    let query = admin
      .from("messages")
      .select("role, modality, content, created_at")
      .eq("user_id", userId)
      .eq("modality", "text")
      .order("created_at", { ascending: false })
      .limit(MAX_MESSAGES_PER_RUN);

    if (profile.memory_last_extracted_at) {
      query = query.gt("created_at", profile.memory_last_extracted_at);
    }

    const { data: newMessages, error: messagesError } = await query;
    if (messagesError || !newMessages || newMessages.length === 0) return;

    const userMessageCount = newMessages.filter((m) => m.role === "user").length;
    if (userMessageCount < MIN_NEW_USER_MESSAGES) return;

    const ordered = [...newMessages].reverse();
    const newCheckpoint = ordered[ordered.length - 1].created_at;
    const transcript = ordered.map((m) => `${m.role === "user" ? "Persoana" : "AI"}: ${m.content}`).join("\n");

    const { data: existingEntries } = await admin
      .from("memory_entries")
      .select("id, category, content")
      .eq("user_id", userId);

    const anthropic = getClient();
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(existingEntries ?? [], transcript) }],
    });

    await recordUsage(
      "memory_extraction",
      tier,
      MODEL,
      response.usage.input_tokens,
      response.usage.output_tokens,
    );

    const textBlock = response.content.find((block) => block.type === "text");
    const ops = textBlock && textBlock.type === "text" ? parseOps(textBlock.text) : [];

    for (const op of ops) {
      if (op.action === "add") {
        await admin.from("memory_entries").insert({
          user_id: userId,
          category: op.category,
          content: op.content,
          source_conversation_id: conversationId,
        });
      } else if (op.action === "update") {
        await admin
          .from("memory_entries")
          .update({ content: op.content, last_confirmed_at: new Date().toISOString() })
          .eq("id", op.entryId)
          .eq("user_id", userId);
      } else if (op.action === "remove") {
        await admin.from("memory_entries").delete().eq("id", op.entryId).eq("user_id", userId);
      }
    }

    await admin.from("profiles").update({ memory_last_extracted_at: newCheckpoint }).eq("id", userId);
  } catch (err) {
    console.error("runMemoryExtraction failed:", err);
  }
}
