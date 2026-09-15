import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Tier = "free" | "simplu" | "plus" | "avansat";
export type UsageKind = "reply" | "memory_extraction";

/**
 * $ per 1M tokens — matches CLAUDE.md's documented pricing. Only Haiku is
 * wired up today (every paid tier + memory extraction); add a row here
 * whenever a second model actually gets used (e.g. the FREE-tier
 * GPT-4o-mini routing described in CLAUDE.md, not yet implemented).
 */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
};

/**
 * Sliding daily budget, not a lifetime total — resets at UTC midnight,
 * same convention as the per-tier daily message cap in rate-limit.ts.
 * Two thresholds, decided in chat: a soft one that only degrades FREE
 * (protects the revenue-generating tiers from a FREE-tier cost spike)
 * and a hard one, well above it, that stops everyone — a safety net for
 * a bug or attack that runs up cost regardless of tier. Conservative
 * pre-launch defaults (chosen with near-zero real traffic) — revisit
 * once there's real usage data to calibrate against.
 */
const FREE_DAILY_CAP_USD = 5;
const TOTAL_DAILY_CAP_USD = 25;

function computeCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING[model];
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export async function recordUsage(
  kind: UsageKind,
  tier: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  const cost_usd = computeCost(model, inputTokens, outputTokens);
  const { error } = await supabaseAdmin().from("ai_usage_events").insert({
    kind,
    tier,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd,
  });
  if (error) console.error("recordUsage failed:", error);
}

function todayStartUtc(): string {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

async function sumCostSince(since: string, tier?: Tier): Promise<number> {
  const admin = supabaseAdmin();
  let query = admin.from("ai_usage_events").select("cost_usd").gte("created_at", since);
  if (tier) query = query.eq("tier", tier);

  const { data, error } = await query;
  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + Number(row.cost_usd), 0);
}

export async function isPlatformCapExceeded(tier: string): Promise<boolean> {
  const since = todayStartUtc();

  const totalToday = await sumCostSince(since);
  if (totalToday >= TOTAL_DAILY_CAP_USD) return true;

  if (tier === "free") {
    const freeToday = await sumCostSince(since, "free");
    if (freeToday >= FREE_DAILY_CAP_USD) return true;
  }

  return false;
}
