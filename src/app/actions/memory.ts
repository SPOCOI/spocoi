"use server";

import { createClient } from "@/lib/supabase/server";

export type MemoryEntry = {
  id: string;
  category: string;
  content: string;
  created_at: string;
};

export async function listMemoryEntries(): Promise<MemoryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("memory_entries")
    .select("id, category, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listMemoryEntries failed:", error);
    return [];
  }

  return data as MemoryEntry[];
}
