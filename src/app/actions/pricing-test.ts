"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Region } from "@/lib/region";
import { getClientIp, getOrCreateDeviceId, isRateLimited, recordRateLimitEvent } from "@/lib/abuse-rate-limit";

export type PricingTestResult = { status: "ok" | "error" };

export async function submitPricingTest(
  region: Region,
  tooCheap: number,
  bargain: number,
  expensive: number,
  tooExpensive: number,
  feedback: string,
  email: string,
): Promise<PricingTestResult> {
  const ip = await getClientIp();
  const deviceId = await getOrCreateDeviceId();
  if (await isRateLimited("pricing_test", ip, deviceId)) {
    return { status: "error" };
  }

  const { error } = await supabaseAdmin().from("pricing_test_responses").insert({
    tier: "avansat",
    region,
    too_cheap: tooCheap || null,
    bargain: bargain || null,
    expensive: expensive || null,
    too_expensive: tooExpensive || null,
    feedback: feedback.trim() || null,
    email: email.trim() || null,
  });

  if (error) {
    console.error("submitPricingTest failed:", error);
    return { status: "error" };
  }

  await recordRateLimitEvent("pricing_test", ip, deviceId);
  return { status: "ok" };
}
