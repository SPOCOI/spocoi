import "server-only";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

/**
 * Auth for the iOS app's API routes (src/app/api/ios/**) — there's no cookie
 * session to read (native apps aren't browsers), so the client sends its
 * Supabase access token as `Authorization: Bearer <jwt>` instead. The
 * returned `supabase` client has that JWT set as its request header, so
 * every `.from(...)` query still goes through RLS as that user — same
 * security model as the cookie-based `createClient()` in
 * src/lib/supabase/server.ts, just a different transport for the token.
 */
export async function getMobileUser(
  request: NextRequest,
): Promise<{ user: User; supabase: SupabaseClient } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const jwt = authHeader.slice("Bearer ".length);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    },
  );

  const { data, error } = await supabase.auth.getUser(jwt);
  if (error || !data.user) return null;

  return { user: data.user, supabase };
}
