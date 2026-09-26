import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/supabase/mobile";

// Mirrors resetConversationHistory() in src/app/actions/account.ts — deletes
// every message and conversation, not the account. The next
// conversation/active call starts a fresh conversation.
export async function DELETE(request: NextRequest) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { user, supabase } = auth;

  const { error: messagesError } = await supabase.from("messages").delete().eq("user_id", user.id);
  if (messagesError) {
    console.error("ios/account/history DELETE (messages) failed:", messagesError);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  const { error: conversationsError } = await supabase.from("conversations").delete().eq("user_id", user.id);
  if (conversationsError) {
    console.error("ios/account/history DELETE (conversations) failed:", conversationsError);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
