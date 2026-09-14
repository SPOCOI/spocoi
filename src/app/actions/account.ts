"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { localizedHref, type Locale } from "@/i18n/config";

export async function updateDisplayName(displayName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" as const };

  const trimmed = displayName.trim().slice(0, 80);
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed || null })
    .eq("id", user.id);

  return { status: error ? ("error" as const) : ("ok" as const) };
}

export async function setPersonalizationEnabled(enabled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" as const };

  const { error } = await supabase
    .from("profiles")
    .update({ personalization_enabled: enabled })
    .eq("id", user.id);

  return { status: error ? ("error" as const) : ("ok" as const) };
}

export async function deleteMemoryEntry(entryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" as const };

  const { error } = await supabase
    .from("memory_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  return { status: error ? ("error" as const) : ("ok" as const) };
}

/** Deletes every message and conversation for the user — a clean slate,
 * not the account itself. The next visit to /chat starts a fresh
 * conversation via getActiveConversation(). */
export async function resetConversationHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" as const };

  const { error: messagesError } = await supabase
    .from("messages")
    .delete()
    .eq("user_id", user.id);
  if (messagesError) {
    console.error("resetConversationHistory (messages) failed:", messagesError);
    return { status: "error" as const };
  }

  const { error: conversationsError } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", user.id);
  if (conversationsError) {
    console.error("resetConversationHistory (conversations) failed:", conversationsError);
    return { status: "error" as const };
  }

  return { status: "ok" as const };
}

/** Permanently deletes the account and everything tied to it (cascades
 * through every table via ON DELETE CASCADE). Needs the service-role
 * client — a user can't delete their own auth.users row otherwise. */
export async function deleteAccount(locale: Locale) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error" as const };

  const { error } = await supabaseAdmin().auth.admin.deleteUser(user.id);
  if (error) {
    console.error("deleteAccount failed:", error);
    return { status: "error" as const };
  }

  await supabase.auth.signOut();
  redirect(localizedHref("/", locale));
}
