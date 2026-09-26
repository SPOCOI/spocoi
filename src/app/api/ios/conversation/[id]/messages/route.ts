import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { getMobileUser } from "@/lib/supabase/mobile";
import { generateAssistantReply } from "@/lib/ai/reply";
import type { ChatMessage } from "@/app/actions/conversations";
import { runMemoryExtraction } from "@/lib/ai/memory-extraction";
import { containsCrisisSignal, buildCrisisReply } from "@/lib/crisis-detection";
import { checkRateLimit } from "@/lib/rate-limit";
import { isPlatformCapExceeded } from "@/lib/ai/usage-cap";
import { resolveRegion, type Region } from "@/lib/region";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

// Same message-history window sent to the model as the web app
// (src/app/actions/conversations.ts) — see the comment there for why this
// is deliberately smaller than what the UI shows.
const AI_CONTEXT_MESSAGE_LIMIT = 20;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id: conversationId } = await params;

  const { data, error } = await auth.supabase
    .from("messages")
    .select("id, role, modality, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("ios/conversation/[id]/messages GET failed:", error);
    return NextResponse.json({ error: "db-error" }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { user, supabase } = auth;
  const { id: conversationId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { content, locale: rawLocale } = (body ?? {}) as { content?: unknown; locale?: unknown };
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }
  const trimmed = content.trim();
  const locale: Locale = typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : defaultLocale;

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, region, personalization_enabled")
    .eq("id", user.id)
    .single();
  const tier = profile?.tier ?? "free";
  const region = (profile?.region as Region | null) ?? resolveRegion(undefined);

  let memoryEntries: { category: string; content: string }[] = [];
  if (profile?.personalization_enabled) {
    const { data } = await supabase
      .from("memory_entries")
      .select("category, content")
      .eq("user_id", user.id)
      .order("last_confirmed_at", { ascending: false })
      .limit(20);
    memoryEntries = data ?? [];
  }

  const rateLimit = await checkRateLimit(supabase, user.id, tier);
  if (rateLimit.limited) {
    return NextResponse.json({ status: "rate-limited", reason: rateLimit.reason });
  }
  if (await isPlatformCapExceeded(tier)) {
    return NextResponse.json({ status: "rate-limited", reason: "platform" });
  }

  const { data: userMessage, error: insertError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, user_id: user.id, role: "user", modality: "text", content: trimmed })
    .select("id, role, modality, content, created_at")
    .single();

  if (insertError) {
    console.error("ios/conversation/[id]/messages POST (user insert) failed:", insertError);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  let replyText: string;
  if (containsCrisisSignal(trimmed)) {
    replyText = buildCrisisReply(region, locale);
  } else {
    const { data: recent } = await supabase
      .from("messages")
      .select("id, role, modality, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(AI_CONTEXT_MESSAGE_LIMIT);
    const history = ((recent as ChatMessage[]) ?? []).reverse();

    try {
      replyText = await generateAssistantReply(history, locale, tier, memoryEntries);
    } catch (err) {
      console.error("ios/conversation/[id]/messages: generateAssistantReply failed:", err);
      replyText =
        locale === "en"
          ? "I'm having trouble connecting right now — please try again in a moment."
          : "Am o problemă de conexiune chiar acum — te rog încearcă din nou peste puțin timp.";
    }
  }

  const { data: assistantMessage, error: replyError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, user_id: user.id, role: "assistant", modality: "text", content: replyText })
    .select("id, role, modality, content, created_at")
    .single();

  if (replyError) {
    console.error("ios/conversation/[id]/messages POST (assistant insert) failed:", replyError);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  waitUntil(runMemoryExtraction(user.id, conversationId));

  return NextResponse.json({ status: "ok", userMessage, assistantMessage });
}
