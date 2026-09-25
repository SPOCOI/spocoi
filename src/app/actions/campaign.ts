"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type UnsubscribeResult = "ok" | "not-found" | "error";

export async function unsubscribeByToken(token: string): Promise<UnsubscribeResult> {
  const { data, error } = await supabaseAdmin()
    .from("campaign_recipients")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("unsubscribeByToken failed:", error);
    return "error";
  }
  return data ? "ok" : "not-found";
}
