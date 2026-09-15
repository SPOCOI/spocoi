"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Region } from "@/lib/region";
import type { Locale } from "@/i18n/config";
import { getClientIp, getOrCreateDeviceId, isRateLimited, recordRateLimitEvent } from "@/lib/abuse-rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type JoinWaitlistResult = { status: "ok" | "already" | "error" };

export async function joinWaitlist(
  email: string,
  region: Region,
  locale: Locale,
): Promise<JoinWaitlistResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return { status: "error" };
  }

  const ip = await getClientIp();
  const deviceId = await getOrCreateDeviceId();
  if (await isRateLimited("waitlist", ip, deviceId)) {
    return { status: "error" };
  }

  const { error } = await supabaseAdmin()
    .from("waitlist_signups")
    .insert({ email: trimmed, region, locale });

  if (!error) {
    await recordRateLimitEvent("waitlist", ip, deviceId);
    return { status: "ok" };
  }

  // Postgres unique_violation — already signed up.
  if (error.code === "23505") return { status: "already" };

  console.error("joinWaitlist failed:", error);
  return { status: "error" };
}
