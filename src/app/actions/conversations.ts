"use server";

import { createClient } from "@/lib/supabase/server";
import { generateAssistantReply } from "@/lib/ai/reply";
import { containsCrisisSignal, buildCrisisReply } from "@/lib/crisis-detection";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveRegion, type Region } from "@/lib/region";
import type { Locale } from "@/i18n/config";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  modality: "text" | "voice";
  content: string;
  created_at: string;
};

/** Finds the user's open conversation, or starts a new one. */
export async function getActiveConversation(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (!error) return created.id as string;

  // A concurrent request already created the open conversation (the
  // conversations_one_open_per_user unique index rejected this insert) —
  // fetch the one that won instead of erroring out.
  if (error.code === "23505") {
    const { data: winner, error: refetchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .is("ended_at", null)
      .single();
    if (!refetchError && winner) return winner.id as string;
  }

  throw error;
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, modality, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as ChatMessage[];
}

// How much history gets sent to the AI per reply — deliberately NOT the
// same as what the UI shows (listMessages, above, returns everything).
// Without a cap, cost per message grows with every turn of a long
// conversation (the whole history gets re-sent as context each time),
// and a long-running conversation would eventually exceed the model's
// context window outright. Long-term memory across sessions is meant to
// live in memory_entries (the "portrait"), not in raw message history.
const AI_CONTEXT_MESSAGE_LIMIT = 20;

async function listRecentMessages(conversationId: string, limit: number): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, modality, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as ChatMessage[]).reverse();
}

export type SendMessageResult =
  | { status: "ok"; userMessage: ChatMessage; assistantMessage: ChatMessage }
  | { status: "rate-limited"; reason: "burst" | "daily" }
  | { status: "error" };

export async function sendMessage(
  conversationId: string,
  content: string,
  locale: Locale,
): Promise<SendMessageResult> {
  const trimmed = content.trim();
  if (!trimmed) return { status: "error" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, region")
    .eq("id", user.id)
    .single();
  const tier = profile?.tier ?? "free";
  const region = (profile?.region as Region | null) ?? resolveRegion(undefined);

  const rateLimit = await checkRateLimit(supabase, user.id, tier);
  if (rateLimit.limited) {
    return { status: "rate-limited", reason: rateLimit.reason };
  }

  const { data: userMessage, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      modality: "text",
      content: trimmed,
    })
    .select("id, role, modality, content, created_at")
    .single();

  if (insertError) {
    console.error("sendMessage (user insert) failed:", insertError);
    return { status: "error" };
  }

  const replyText = await getReplyText(conversationId, trimmed, region, locale);

  const { data: assistantMessage, error: replyError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "assistant",
      modality: "text",
      content: replyText,
    })
    .select("id, role, modality, content, created_at")
    .single();

  if (replyError) {
    console.error("sendMessage (assistant insert) failed:", replyError);
    return { status: "error" };
  }

  return {
    status: "ok",
    userMessage: userMessage as ChatMessage,
    assistantMessage: assistantMessage as ChatMessage,
  };
}

async function getReplyText(
  conversationId: string,
  latestUserText: string,
  region: Region,
  locale: Locale,
): Promise<string> {
  if (containsCrisisSignal(latestUserText)) {
    return buildCrisisReply(region, locale);
  }

  const history = await listRecentMessages(conversationId, AI_CONTEXT_MESSAGE_LIMIT);

  try {
    return await generateAssistantReply(history, locale);
  } catch (err) {
    console.error("generateAssistantReply failed:", err);
    return locale === "en"
      ? "I'm having trouble connecting right now — please try again in a moment."
      : "Am o problemă de conexiune chiar acum — te rog încearcă din nou peste puțin timp.";
  }
}
