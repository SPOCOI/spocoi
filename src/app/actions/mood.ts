"use server";

import { createClient } from "@/lib/supabase/server";

export type MoodValue = "worse" | "same" | "better";

export type MoodState = {
  phase: number;
  checkedInToday: boolean;
  trend: MoodValue | null;
};

export async function getMoodState(): Promise<MoodState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("mood_phase")
    .eq("id", user.id)
    .single();

  const { data: latest } = await supabase
    .from("mood_checkins")
    .select("day, value")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(1)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);

  return {
    phase: profile?.mood_phase ?? 0,
    checkedInToday: latest?.day === today,
    trend: (latest?.value as MoodValue | undefined) ?? null,
  };
}

export async function submitMoodCheckin(value: MoodValue): Promise<MoodState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { error: insertError } = await supabase
    .from("mood_checkins")
    .insert({ user_id: user.id, value });

  // Unique(user_id, day) rejects a second check-in the same day — treat
  // that as a no-op rather than an error, and just return current state.
  if (insertError && insertError.code !== "23505") {
    console.error("submitMoodCheckin failed:", insertError);
    return getMoodState();
  }

  if (!insertError && value !== "same") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("mood_phase")
      .eq("id", user.id)
      .single();

    const current = profile?.mood_phase ?? 0;
    const next = value === "better" ? Math.min(current + 1, 6) : Math.max(current - 1, 0);

    await supabase.from("profiles").update({ mood_phase: next }).eq("id", user.id);
  }

  return getMoodState();
}
