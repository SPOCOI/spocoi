import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/// Passwordless login for existing users only — shouldCreateUser: false
/// keeps this from becoming a silent signup path that bypasses the age
/// attestation and Art. 9(2)(a) consent required by /api/ios/auth/signup.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: unknown };
  if (typeof email !== "string") {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  // Same response whether or not the email has an account — otherwise this
  // endpoint becomes an account-enumeration oracle.
  if (error && error.status !== 400) {
    console.error("ios/auth/otp/request failed:", error);
  }

  return NextResponse.json({ status: "ok" });
}
