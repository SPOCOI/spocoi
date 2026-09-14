"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { localizedHref, type Locale } from "@/i18n/config";
import { REGION_HEADER, resolveRegion } from "@/lib/region";

export type AuthResult = { status: "ok" | "confirm-email" | "error"; message?: string };

async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${h.get("host")}`;
}

export async function signUp(
  email: string,
  password: string,
  locale: Locale,
): Promise<AuthResult> {
  const supabase = await createClient();
  const origin = await siteOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(localizedHref("/chat", locale))}`,
    },
  });

  if (error) {
    console.error("signUp failed:", error);
    return { status: "error", message: error.message };
  }

  // With "Confirm email" off (current dev setting), signUp already returns
  // an active session — no confirmation step needed. With it on (required
  // before real launch), data.session is null until the user clicks the
  // emailed link, which lands on /auth/confirm. In that case the profile
  // keeps region unset until the user's first session — a gap worth
  // closing later (e.g. by setting it from /auth/confirm too).
  if (data.session && data.user) {
    const h = await headers();
    const region = h.get(REGION_HEADER) ?? resolveRegion(undefined);
    await supabase.from("profiles").update({ region }).eq("id", data.user.id);
  }

  return data.session ? { status: "ok" } : { status: "confirm-email" };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("signIn failed:", error);
    return { status: "error", message: error.message };
  }
  return { status: "ok" };
}

export async function signOut(locale: Locale) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(localizedHref("/", locale));
}
