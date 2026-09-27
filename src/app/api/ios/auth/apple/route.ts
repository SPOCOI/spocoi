import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/// Bridges a native "Sign in with Apple" credential to a Supabase session.
/// Requires the Apple provider to be configured in the Supabase dashboard
/// (Team ID, Key ID, private key, and the app's bundle id as an allowed
/// audience) — see the setup note left for Daniel alongside this route.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { identityToken, nonce } = (body ?? {}) as { identityToken?: unknown; nonce?: unknown };
  if (typeof identityToken !== "string" || typeof nonce !== "string") {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: identityToken,
    nonce,
  });

  if (error || !data.session) {
    return NextResponse.json({ status: "error", message: error?.message ?? "unknown" });
  }

  return NextResponse.json({
    status: "ok",
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
