import "server-only";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMobileUser } from "@/lib/supabase/mobile";

// Mirrors src/app/actions/mood.ts — re-expressed against the JWT-scoped
// client since that file hard-codes the cookie-based one internally.
type MoodState = { phase: number; checkedInToday: boolean; trend: string | null };

async function loadMoodState(supabase: SupabaseClient, userId: string): Promise<MoodState> {
  const { data: profile } = await supabase.from("profiles").select("mood_phase").eq("id", userId).single();
  const { data: latest } = await supabase
    .from("mood_checkins")
    .select("day, value")
    .eq("user_id", userId)
    .order("day", { ascending: false })
    .limit(1)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  return {
    phase: profile?.mood_phase ?? 0,
    checkedInToday: latest?.day === today,
    trend: latest?.value ?? null,
  };
}

export async function GET(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const state = await loadMoodState(auth.supabase, auth.user.id);
  return NextResponse.json(state);
}

export async function POST(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { value } = (body ?? {}) as { value?: unknown };
  if (value !== "worse" && value !== "same" && value !== "better") {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("mood_checkins").insert({ user_id: user.id, value });

  // Unique(user_id, day) rejects a second check-in the same day — treat as
  // a no-op, same as the web action.
  if (insertError && insertError.code !== "23505") {
    console.error("ios/mood POST failed:", insertError);
    return NextResponse.json(await loadMoodState(supabase, user.id));
  }

  if (!insertError && value !== "same") {
    const { data: profile } = await supabase.from("profiles").select("mood_phase").eq("id", user.id).single();
    const current = profile?.mood_phase ?? 0;
    const next = value === "better" ? Math.min(current + 1, 6) : Math.max(current - 1, 0);
    await supabase.from("profiles").update({ mood_phase: next }).eq("id", user.id);
  }

  return NextResponse.json(await loadMoodState(supabase, user.id));
}
