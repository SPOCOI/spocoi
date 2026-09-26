import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/supabase/mobile";

// Mirrors deleteMemoryEntry() in src/app/actions/account.ts — one piece of
// the "ce știe spocoi despre mine" portrait, removed individually.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getMobileUser(request);
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  const { error } = await auth.supabase
    .from("memory_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("ios/account/memory DELETE failed:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" });
}
