import "server-only";
import type { createClient } from "@/lib/supabase/server";

type Tier = "free" | "simplu" | "plus" | "avansat";

/**
 * Daily text-message caps, per tier. FREE matches the usage assumption
 * already baked into the financial model's cost estimate ("30 msg/day x 5
 * days active" — see CLAUDE.md / SPOCOI_Financial_Model_UPDATED.xlsx), so
 * enforcing it here doesn't invent a new number, just makes the existing
 * assumption real. Paid-tier numbers are provisional placeholders — nobody
 * is actually on a paid tier yet (no Stripe), revisit these once real
 * subscriptions exist to differentiate.
 */
const DAILY_MESSAGE_CAP: Record<Tier, number> = {
  free: 30,
  simplu: 150,
  plus: 400,
  avansat: 1000,
};

/** Pure abuse prevention — applies to every tier, not a cost/business lever. */
const BURST_WINDOW_SECONDS = 60;
const BURST_MAX_MESSAGES = 10;

export type RateLimitResult =
  | { limited: false }
  | { limited: true; reason: "burst" | "daily" };

export async function checkRateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  tier: string,
): Promise<RateLimitResult> {
  const burstSince = new Date(Date.now() - BURST_WINDOW_SECONDS * 1000).toISOString();
  const { count: burstCount } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", burstSince);

  if ((burstCount ?? 0) >= BURST_MAX_MESSAGES) {
    return { limited: true, reason: "burst" };
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { count: dailyCount } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", todayStart.toISOString());

  const cap = DAILY_MESSAGE_CAP[tier as Tier] ?? DAILY_MESSAGE_CAP.free;
  if ((dailyCount ?? 0) >= cap) {
    return { limited: true, reason: "daily" };
  }

  return { limited: false };
}
