import "server-only";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMobileUser } from "@/lib/supabase/mobile";
import { summarizeConversation } from "@/lib/ai/recap";
import { isPlatformCapExceeded } from "@/lib/ai/usage-cap";

// Mirrors src/app/actions/recap.ts — re-expressed against the JWT-scoped
// client since that file hard-codes the cookie-based one internally.
const MAX_MESSAGES_FOR_RECAP = 60;

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function loadOrCreateRecap(supabase: SupabaseClient, userId: string) {
  const yesterday = isoDateDaysAgo(1);

  const { data: existing } = await supabase
    .from("daily_recaps")
    .select("id, topic, summary, dismissed_at")
    .eq("user_id", userId)
    .eq("recap_date", yesterday)
    .maybeSingle();

  if (existing) {
    return existing.dismissed_at ? null : { id: existing.id, topic: existing.topic, summary: existing.summary };
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("user_id", userId)
    .eq("modality", "text")
    .gte("created_at", `${yesterday}T00:00:00Z`)
    .lt("created_at", `${isoDateDaysAgo(0)}T00:00:00Z`)
    .order("created_at", { ascending: true })
    .limit(MAX_MESSAGES_FOR_RECAP);

  if (!messages || messages.length === 0) return null;

  const { data: profile } = await supabase.from("profiles").select("tier").eq("id", userId).single();
  const tier = profile?.tier ?? "free";
  if (await isPlatformCapExceeded(tier)) return null;

  // No locale switch in the iOS app yet — matches SendMessageBody(locale: "ro") in ChatView.swift.
  const result = await summarizeConversation(messages, "ro", tier);
  if (!result) return null;

  const { data: inserted, error } = await supabase
    .from("daily_recaps")
    .insert({ user_id: userId, recap_date: yesterday, topic: result.topic, summary: result.summary })
    .select("id, topic, summary")
    .single();

  if (error) {
    console.error("ios/recap/daily GET (insert) failed:", error);
    return null;
  }

  return inserted;
}

export async function GET(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const recap = await loadOrCreateRecap(auth.supabase, auth.user.id);
  return NextResponse.json({ recap });
}

export async function POST(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { id } = (body ?? {}) as { id?: unknown };
  if (typeof id !== "string" || !id) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  await auth.supabase
    .from("daily_recaps")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  return NextResponse.json({ status: "ok" });
}
