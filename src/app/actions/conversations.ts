"use server";

import { createClient } from "@/lib/supabase/server";

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

export type SendMessageResult =
  | { status: "ok"; message: ChatMessage }
  | { status: "error" };

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<SendMessageResult> {
  const trimmed = content.trim();
  if (!trimmed) return { status: "error" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" };

  const { data, error } = await supabase
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

  if (error) {
    console.error("sendMessage failed:", error);
    return { status: "error" };
  }

  return { status: "ok", message: data as ChatMessage };
}
