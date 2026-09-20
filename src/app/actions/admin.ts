"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Region } from "@/lib/region";

export type AdminTier = "simplu" | "plus" | "avansat";

export type AdminGrantResult =
  | { status: "ok" }
  | { status: "not-authorized" }
  | { status: "user-not-found" }
  | { status: "error"; message?: string };

export type AdminGrant = {
  email: string;
  tier: string;
  region: string;
  status: string;
  grantedBy: string | null;
  expiresAt: string | null;
};

async function requireAdminEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email;
  if (!email) return null;

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase()) ? email : null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await requireAdminEmail()) !== null;
}

export async function grantTier(
  targetEmail: string,
  tier: AdminTier,
  region: Region,
  expiresAt: string | null,
): Promise<AdminGrantResult> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return { status: "not-authorized" };

  const { data: userId, error: lookupError } = await supabaseAdmin().rpc(
    "admin_lookup_user_id_by_email",
    { lookup_email: targetEmail.trim().toLowerCase() },
  );
  if (lookupError || !userId) return { status: "user-not-found" };

  const { error: subError } = await supabaseAdmin()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        tier,
        region,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        status: "active",
        current_period_end: null,
        source: "admin",
        granted_by: adminEmail,
        expires_at: expiresAt,
      },
      { onConflict: "user_id" },
    );
  if (subError) return { status: "error", message: subError.message };

  const { error: profileError } = await supabaseAdmin()
    .from("profiles")
    .update({ tier })
    .eq("id", userId);
  if (profileError) return { status: "error", message: profileError.message };

  return { status: "ok" };
}

export async function revokeGrant(targetEmail: string): Promise<AdminGrantResult> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return { status: "not-authorized" };

  const { data: userId, error: lookupError } = await supabaseAdmin().rpc(
    "admin_lookup_user_id_by_email",
    { lookup_email: targetEmail.trim().toLowerCase() },
  );
  if (lookupError || !userId) return { status: "user-not-found" };

  const { error: subError } = await supabaseAdmin()
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("user_id", userId);
  if (subError) return { status: "error", message: subError.message };

  const { error: profileError } = await supabaseAdmin()
    .from("profiles")
    .update({ tier: "free" })
    .eq("id", userId);
  if (profileError) return { status: "error", message: profileError.message };

  return { status: "ok" };
}

export async function listGrants(): Promise<AdminGrant[] | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  const { data, error } = await supabaseAdmin().rpc("admin_list_grants");
  if (error || !data) return [];

  return (
    data as Array<{
      email: string;
      tier: string;
      region: string;
      status: string;
      granted_by: string | null;
      expires_at: string | null;
    }>
  ).map((row) => ({
    email: row.email,
    tier: row.tier,
    region: row.region,
    status: row.status,
    grantedBy: row.granted_by,
    expiresAt: row.expires_at,
  }));
}
