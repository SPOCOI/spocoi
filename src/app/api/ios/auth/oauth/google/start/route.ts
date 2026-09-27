import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/// Starts Google sign-in for the native app: the client opens the returned
/// URL in an ASWebAuthenticationSession, which redirects to spocoi:// with
/// the session tokens directly in the URL fragment (implicit flow — chosen
/// over Supabase's default PKCE because the code verifier PKCE needs would
/// have to survive across this stateless request/redirect boundary, which
/// a plain fetch-per-request backend can't give it).
/// Requires the Google provider configured in the Supabase dashboard
/// (OAuth Client ID + secret from Google Cloud Console) — see the setup
/// note left for Daniel alongside this route.
export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: "spocoi://auth-callback", skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    return NextResponse.json({ status: "error", message: error?.message ?? "unknown" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", url: data.url });
}
