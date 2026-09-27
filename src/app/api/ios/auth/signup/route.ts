import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geolocation } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resolveRegion } from "@/lib/region";
import { getClientIp, getOrCreateDeviceId, isRateLimited, recordRateLimitEvent } from "@/lib/abuse-rate-limit";

// Same consent-policy version as the web signup (src/app/actions/auth.ts) —
// keep these in sync; bump both together when the wording changes.
const CONSENT_POLICY_VERSION = "2026-09-18";

// Terms page (src/app/[locale]/(marketing)/legal/terms) states 16 as the
// minimum age — kept in sync with that copy, not the old 13/18 contradiction
// from the lost prototype (see CLAUDE.md).
const MINIMUM_AGE = 16;

function computeAge(birthDate: Date, now: Date): number {
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { email, password, birthDate, specialCategoryConsent } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
    birthDate?: unknown;
    specialCategoryConsent?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string" || typeof birthDate !== "string") {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const parsedBirthDate = new Date(birthDate);
  if (Number.isNaN(parsedBirthDate.getTime())) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  // A real birth date replaces a bare self-attestation checkbox — but the
  // user still types it in, so it's still self-reported, not verified
  // against an ID. The Terms page carries the liability clause for that.
  if (computeAge(parsedBirthDate, new Date()) < MINIMUM_AGE || specialCategoryConsent !== true) {
    return NextResponse.json({ status: "consent-required" });
  }

  const ip = await getClientIp();
  const deviceId = await getOrCreateDeviceId();
  if (await isRateLimited("signup", ip, deviceId)) {
    return NextResponse.json({ status: "rate-limited" });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("ios/auth/signup: signUp failed:", error);
    return NextResponse.json({ status: "error", message: error.message });
  }

  await recordRateLimitEvent("signup", ip, deviceId);

  if (data.user) {
    const { error: consentError } = await supabaseAdmin().from("consents").insert([
      { user_id: data.user.id, consent_type: "age_attestation", policy_version: CONSENT_POLICY_VERSION },
      { user_id: data.user.id, consent_type: "special_category_data", policy_version: CONSENT_POLICY_VERSION },
    ]);
    if (consentError) console.error("ios/auth/signup: recording consent failed:", consentError);

    const { country } = geolocation(request);
    const region = resolveRegion(country);
    await supabaseAdmin()
      .from("profiles")
      .update({ region, birth_date: birthDate })
      .eq("id", data.user.id);
  }

  if (!data.session) {
    // "Confirm email" is on for this Supabase project — no session yet.
    return NextResponse.json({ status: "confirm-email" });
  }

  return NextResponse.json({
    status: "ok",
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
