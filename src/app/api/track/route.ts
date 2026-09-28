import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Own minimal pageview logger for the admin dashboard — Vercel Web Analytics
// (enabled separately) has no public query API, so its data can't be pulled
// into /admin. No cookies, no per-visitor id: just enough to aggregate.
function deviceFromUserAgent(userAgent: string | null): "mobile" | "tablet" | "desktop" {
  if (!userAgent) return "desktop";
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

function refererHost(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).host;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { path } = (body ?? {}) as { path?: unknown };
  if (typeof path !== "string" || !path) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const { country } = geolocation(request);
  const device = deviceFromUserAgent(request.headers.get("user-agent"));
  const referrer_host = refererHost(request.headers.get("referer"));

  await supabaseAdmin()
    .from("site_visits")
    .insert({ path, country: country ?? null, device, referrer_host });

  return NextResponse.json({ status: "ok" });
}
