import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { recordUsage } from "@/lib/ai/usage-cap";
import type { Locale } from "@/i18n/config";

const MODEL = "claude-haiku-4-5-20251001";

/**
 * Fixed taxonomy, mirrors the memory-extraction categories in spirit but
 * kept separate — a recap classifies a whole day's conversation, not a
 * single durable fact. Must match daily_recaps' check constraint.
 */
export const RECAP_TOPICS = ["mood", "stress", "advice", "support", "altele"] as const;
export type RecapTopic = (typeof RECAP_TOPICS)[number];

function isRecapTopic(value: unknown): value is RecapTopic {
  return typeof value === "string" && (RECAP_TOPICS as readonly string[]).includes(value);
}

let client: Anthropic | null = null;
function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY — check .env.local.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT_RO = `Rezumi o conversație dintre o persoană și un AI de suport emoțional.

Scrie UN rând, scurt și cald, ca o invitație să continue conversația — nu un raport despre ce a spus persoana. Ton matur, natural, nu clinic. Niciodată nu recita cuvânt cu cuvânt ce a spus.

Clasifică și conversația într-un topic: mood (stare emoțională generală), stress (stres, presiune, anxietate), advice (persoana cerea un sfat/perspectivă), support (avea nevoie doar să vorbească, să fie ascultată), altele.

Răspunde DOAR cu un JSON, fără text în jur: {"summary":"...","topic":"..."}`;

const SYSTEM_PROMPT_EN = `You summarize a conversation between a person and an emotional-support AI.

Write ONE short, warm line, phrased as an invitation to continue the conversation — not a report of what the person said. Mature, natural tone, never clinical. Never recite what they said verbatim.

Also classify the conversation into a topic: mood (general emotional state), stress (stress, pressure, anxiety), advice (the person wanted advice/perspective), support (they just needed to talk, to be heard), altele (other).

Respond ONLY with JSON, no surrounding text: {"summary":"...","topic":"..."}`;

export type ConversationSummary = { summary: string; topic: RecapTopic };

function parseSummary(raw: string): ConversationSummary | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const obj = parsed as Record<string, unknown>;
  if (typeof obj.summary !== "string" || !obj.summary.trim() || !isRecapTopic(obj.topic)) {
    return null;
  }
  return { summary: obj.summary.trim(), topic: obj.topic };
}

/**
 * Shared by the daily recap (persisted) and the on-demand "summarize this
 * conversation" quick action — same call, different caller decides what to
 * do with the result. Returns null on any failure (malformed output, empty
 * transcript) — callers treat that as "nothing to show," never an error.
 */
export async function summarizeConversation(
  transcriptLines: { role: "user" | "assistant"; content: string }[],
  locale: Locale,
  tier: string,
): Promise<ConversationSummary | null> {
  if (transcriptLines.length === 0) return null;

  const transcript = transcriptLines
    .map((m) => `${m.role === "user" ? "Persoana" : "AI"}: ${m.content}`)
    .join("\n");

  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: locale === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_RO,
    messages: [{ role: "user", content: transcript }],
  });

  await recordUsage("recap", tier, MODEL, response.usage.input_tokens, response.usage.output_tokens);

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? parseSummary(textBlock.text) : null;
}
