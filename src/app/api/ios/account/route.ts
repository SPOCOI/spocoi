import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/supabase/mobile";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Mirrors the web /account page + src/app/actions/account.ts, re-expressed
// against the JWT-scoped client (those actions hard-code the cookie-based
// one internally).

export async function GET(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, personalization_enabled, tier")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("ios/account GET failed:", error);
    return NextResponse.json({ error: "db-error" }, { status: 500 });
  }

  // Same rule as the web page: no portrait is shown (or built) unless the
  // user opted in to personalization.
  let memoryEntries: { id: string; category: string; content: string; created_at: string }[] = [];
  if (profile.personalization_enabled) {
    const { data, error: memoryError } = await supabase
      .from("memory_entries")
      .select("id, category, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (memoryError) console.error("ios/account GET (memory) failed:", memoryError);
    memoryEntries = data ?? [];
  }

  return NextResponse.json({
    email: user.email ?? null,
    displayName: profile.display_name ?? null,
    tier: profile.tier,
    personalizationEnabled: profile.personalization_enabled,
    memoryEntries,
  });
}

/** Partial update: `displayName` and/or `personalizationEnabled`. */
export async function PATCH(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { displayName, personalizationEnabled } = (body ?? {}) as {
    displayName?: unknown;
    personalizationEnabled?: unknown;
  };

  const update: { display_name?: string | null; personalization_enabled?: boolean } = {};
  if (typeof displayName === "string") {
    const trimmed = displayName.trim().slice(0, 80);
    update.display_name = trimmed || null;
  }
  if (typeof personalizationEnabled === "boolean") {
    update.personalization_enabled = personalizationEnabled;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) {
    console.error("ios/account PATCH failed:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}

/** Permanently deletes the account — cascades through every table via ON
 * DELETE CASCADE, same as deleteAccount() on the web. Needs the
 * service-role client: a user can't delete their own auth.users row.
 * Also required by App Store Review Guideline 5.1.1(v) for any app that
 * lets users create an account. */
export async function DELETE(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin().auth.admin.deleteUser(auth.user.id);
  if (error) {
    console.error("ios/account DELETE failed:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
