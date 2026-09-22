import "server-only";
import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type RateLimitKind = "signup" | "waitlist" | "pricing_test";

/**
 * Sliding-window caps, not a lifetime total — a shared home/office network
 * shouldn't be permanently blocked, but rapid farming should. Signup is
 * the real cost surface (each account is fresh free-tier AI usage);
 * waitlist just risks a polluted table, hence the looser cap.
 */
const LIMITS: Record<RateLimitKind, { windowMs: number; max: number }> = {
  signup: { windowMs: 24 * 60 * 60 * 1000, max: 3 },
  waitlist: { windowMs: 60 * 60 * 1000, max: 5 },
  pricing_test: { windowMs: 60 * 60 * 1000, max: 3 },
};

const DEVICE_COOKIE_NAME = "spocoi-device";
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Anonymous random id, not a fingerprint — set once, read on later visits.
 * Never exposed to client-side JS (httpOnly), never used for anything but
 * this rate limit. */
export async function getOrCreateDeviceId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(DEVICE_COOKIE_NAME)?.value;
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  store.set(DEVICE_COOKIE_NAME, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DEVICE_COOKIE_MAX_AGE,
    path: "/",
  });
  return deviceId;
}

/** Vercel sets x-real-ip (and typically x-forwarded-for) in
 * production/preview — neither is present in local dev, in which case we
 * fall back to the device signal alone. Read directly rather than via
 * @vercel/functions' ipAddress(): its `"headers" in input` duck-typing
 * doesn't recognize Next's ReadonlyHeaders proxy from next/headers. */
export async function getClientIp(): Promise<string | undefined> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
}

export async function isRateLimited(kind: RateLimitKind, ip: string | undefined, deviceId: string): Promise<boolean> {
  const { windowMs, max } = LIMITS[kind];
  const since = new Date(Date.now() - windowMs).toISOString();
  const admin = supabaseAdmin();

  if (ip) {
    const { count } = await admin
      .from("rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("kind", kind)
      .eq("ip", ip)
      .gte("created_at", since);
    if ((count ?? 0) >= max) return true;
  }

  const { count: deviceCount } = await admin
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("kind", kind)
    .eq("device_id", deviceId)
    .gte("created_at", since);

  return (deviceCount ?? 0) >= max;
}

/** Call only after the gated action actually succeeds — we're counting
 * accounts/signups created, not attempts (a rejected duplicate email,
 * for instance, never reaches this). */
export async function recordRateLimitEvent(
  kind: RateLimitKind,
  ip: string | undefined,
  deviceId: string,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("rate_limit_events")
    .insert({ kind, ip: ip ?? null, device_id: deviceId });
  if (error) console.error("recordRateLimitEvent failed:", error);
}
