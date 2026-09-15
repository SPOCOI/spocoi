"use server";

import { createClient } from "@/lib/supabase/server";
import { summarizeConversation, type RecapTopic } from "@/lib/ai/recap";
import { isPlatformCapExceeded } from "@/lib/ai/usage-cap";
import type { Locale } from "@/i18n/config";

export type DailyRecap = { id: string; topic: RecapTopic; summary: string };

/** Bounds cost/prompt size for a single day's worth of messages. */
const MAX_MESSAGES_FOR_RECAP = 60;

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Lazy, cached generation: computed at most once per user per day, the
 * first time /chat loads that day — not a background job. Mutually
 * exclusive with the mood check-in card in the UI (never both the same
 * visit), which the caller (chat/page.tsx) enforces.
 */
export async function getOrCreateDailyRecap(locale: Locale): Promise<DailyRecap | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const yesterday = isoDateDaysAgo(1);

  const { data: existing } = await supabase
    .from("daily_recaps")
    .select("id, topic, summary, dismissed_at")
    .eq("user_id", user.id)
    .eq("recap_date", yesterday)
    .maybeSingle();

  if (existing) {
    return existing.dismissed_at ? null : { id: existing.id, topic: existing.topic, summary: existing.summary };
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("user_id", user.id)
    .eq("modality", "text")
    .gte("created_at", `${yesterday}T00:00:00Z`)
    .lt("created_at", `${isoDateDaysAgo(0)}T00:00:00Z`)
    .order("created_at", { ascending: true })
    .limit(MAX_MESSAGES_FOR_RECAP);

  if (!messages || messages.length === 0) return null;

  const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
  const tier = profile?.tier ?? "free";
  if (await isPlatformCapExceeded(tier)) return null;

  const result = await summarizeConversation(messages, locale, tier);
  if (!result) return null;

  const { data: inserted, error } = await supabase
    .from("daily_recaps")
    .insert({ user_id: user.id, recap_date: yesterday, topic: result.topic, summary: result.summary })
    .select("id, topic, summary")
    .single();

  if (error) {
    console.error("getOrCreateDailyRecap (insert) failed:", error);
    return null;
  }

  return inserted;
}

export async function dismissDailyRecap(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("daily_recaps")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
}

/** On-demand quick summary — reuses the same summarization call as the
 * daily recap, but nothing is persisted; the topic classification is
 * discarded since it has no use outside the daily recap card. */
export async function summarizeCurrentConversation(
  conversationId: string,
  locale: Locale,
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
  const tier = profile?.tier ?? "free";
  if (await isPlatformCapExceeded(tier)) return null;

  const { data: messages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .eq("modality", "text")
    .order("created_at", { ascending: false })
    .limit(MAX_MESSAGES_FOR_RECAP);

  if (!messages || messages.length === 0) return null;

  const result = await summarizeConversation([...messages].reverse(), locale, tier);
  return result?.summary ?? null;
}
