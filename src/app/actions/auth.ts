"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { localizedHref, type Locale } from "@/i18n/config";
import { REGION_HEADER, resolveRegion } from "@/lib/region";
import { getClientIp, getOrCreateDeviceId, isRateLimited, recordRateLimitEvent } from "@/lib/abuse-rate-limit";

export type AuthResult =
  | { status: "ok" | "confirm-email" | "error" | "rate-limited"; message?: string }
  | { status: "consent-required" };

// Bump this when the Privacy Policy or the wording of the consent
// checkboxes changes in a way that affects what the user agreed to —
// existing consent records stay pinned to the version they actually saw.
const CONSENT_POLICY_VERSION = "2026-09-18";

async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${h.get("host")}`;
}

export async function signUp(
  email: string,
  password: string,
  locale: Locale,
  ageConfirmed: boolean,
  specialCategoryConsent: boolean,
): Promise<AuthResult> {
  // Both checkboxes are required, not just accepted-by-default: age
  // attestation (we have no other age check) and explicit Art. 9(2)(a)
  // consent to process health-adjacent data (mood, memory entries,
  // conversation content) — see NEXT_STEPS.md / the September 2026 GDPR
  // review. Re-validated server-side; the client disables submit on this
  // too, but that's only a UX nicety.
  if (!ageConfirmed || !specialCategoryConsent) {
    return { status: "consent-required" };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();

  const ip = await getClientIp();
  const deviceId = await getOrCreateDeviceId();
  if (await isRateLimited("signup", ip, deviceId)) {
    return { status: "rate-limited" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(localizedHref("/chat", locale))}`,
    },
  });

  if (error) {
    console.error("signUp failed:", error);
    return { status: "error", message: error.message };
  }

  await recordRateLimitEvent("signup", ip, deviceId);

  if (data.user) {
    const { error: consentError } = await supabaseAdmin().from("consents").insert([
      { user_id: data.user.id, consent_type: "age_attestation", policy_version: CONSENT_POLICY_VERSION },
      { user_id: data.user.id, consent_type: "special_category_data", policy_version: CONSENT_POLICY_VERSION },
    ]);
    if (consentError) console.error("recording consent failed:", consentError);
  }

  // With "Confirm email" off (current dev setting), signUp already returns
  // an active session — no confirmation step needed. With it on (required
  // before real launch), data.session is null until the user clicks the
  // emailed link, which lands on /auth/confirm. In that case the profile
  // keeps region unset until the user's first session — a gap worth
  // closing later (e.g. by setting it from /auth/confirm too).
  if (data.session && data.user) {
    const h = await headers();
    const region = h.get(REGION_HEADER) ?? resolveRegion(undefined);
    await supabase.from("profiles").update({ region }).eq("id", data.user.id);
  }

  return data.session ? { status: "ok" } : { status: "confirm-email" };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("signIn failed:", error);
    return { status: "error", message: error.message };
  }
  return { status: "ok" };
}

export async function signOut(locale: Locale) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(localizedHref("/", locale));
}
