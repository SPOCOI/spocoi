import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/supabase/mobile";

// Mirrors getActiveConversation() in src/app/actions/conversations.ts, but
// that function hard-codes the cookie-based client internally — can't be
// called as-is with a JWT-authenticated client, so the query logic is
// duplicated here against the mobile-authenticated client instead.
export async function GET(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return NextResponse.json({ conversationId: existing.id });

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (!error) return NextResponse.json({ conversationId: created.id });

  if (error.code === "23505") {
    const { data: winner, error: refetchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .is("ended_at", null)
      .single();
    if (!refetchError && winner) return NextResponse.json({ conversationId: winner.id });
  }

  console.error("ios/conversation/active failed:", error);
  return NextResponse.json({ error: "db-error" }, { status: 500 });
}
