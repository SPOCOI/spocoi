import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Not in the original route table, but required for the app to stay logged
// in past the access token's ~1h lifetime — without this, sign-in would
// silently stop working an hour after login with no way to recover short of
// logging in again.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { refresh_token } = (body ?? {}) as { refresh_token?: unknown };
  if (typeof refresh_token !== "string") {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase.auth.refreshSession({ refresh_token });

  if (error || !data.session) {
    return NextResponse.json({ status: "error", message: error?.message ?? "unknown" }, { status: 401 });
  }

  return NextResponse.json({
    status: "ok",
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
