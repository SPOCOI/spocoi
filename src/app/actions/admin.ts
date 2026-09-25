"use server";

import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";
import { priceTable } from "@/lib/pricing";
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

export type OverviewStats = {
  totalUsers: number;
  newToday: number;
  newThisWeek: number;
  tierCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  mrrEstimate: number;
};

export async function getOverviewStats(): Promise<OverviewStats | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  const { data, error } = await supabaseAdmin().rpc("admin_overview_stats");
  if (error || !data) return null;

  const raw = data as {
    totalUsers: number;
    newToday: number;
    newThisWeek: number;
    tierRegionCounts: Array<{ tier: string; region: string; count: number }>;
  };

  const tierCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};
  let mrrEstimate = 0;

  for (const row of raw.tierRegionCounts) {
    tierCounts[row.tier] = (tierCounts[row.tier] ?? 0) + row.count;
    regionCounts[row.region] = (regionCounts[row.region] ?? 0) + row.count;
    const priceByRegion = priceTable[row.tier];
    if (priceByRegion && row.region in priceByRegion) {
      mrrEstimate += priceByRegion[row.region as Region] * row.count;
    }
  }

  return {
    totalUsers: raw.totalUsers,
    newToday: raw.newToday,
    newThisWeek: raw.newThisWeek,
    tierCounts,
    regionCounts,
    mrrEstimate,
  };
}

export type ActivityStats = {
  totalConversations: number;
  totalMessages: number;
  dau: number;
  wau: number;
  voiceMinutesLast30d: number;
};

export async function getActivityStats(): Promise<ActivityStats | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  const { data, error } = await supabaseAdmin().rpc("admin_conversation_activity");
  if (error || !data) return null;

  return data as ActivityStats;
}

export type StripeEventSummary = {
  id: string;
  type: string;
  created: number;
  description: string;
};

const RELEVANT_STRIPE_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
]);

function describeStripeEvent(event: Stripe.Event): string {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email ?? session.customer_details?.email ?? "email necunoscut";
      const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
      return `Plată nouă — ${email} (${amount} ${session.currency?.toUpperCase() ?? ""})`;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      return `Abonament actualizat — status ${subscription.status}`;
    }
    case "customer.subscription.deleted":
      return "Abonament anulat";
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      return `Plată eșuată — ${invoice.customer_email ?? "email necunoscut"}`;
    }
    default:
      return event.type;
  }
}

export async function getRecentStripeEvents(): Promise<StripeEventSummary[] | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  try {
    const events = await getStripe().events.list({ limit: 30 });
    return events.data
      .filter((event) => RELEVANT_STRIPE_EVENT_TYPES.has(event.type))
      .slice(0, 10)
      .map((event) => ({
        id: event.id,
        type: event.type,
        created: event.created,
        description: describeStripeEvent(event),
      }));
  } catch {
    return [];
  }
}

export type DailyTrends = {
  signups: number[];
  messages: number[];
};

export async function getDailyTrends(): Promise<DailyTrends | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  const { data, error } = await supabaseAdmin().rpc("admin_daily_trends");
  if (error || !data) return null;

  return data as DailyTrends;
}

export type AdminUserDetail = {
  conversations: number;
  messages: number;
  lastActivity: string | null;
  subscriptionSource: string | null;
  subscriptionStatus: string | null;
  grantedBy: string | null;
  expiresAt: string | null;
};

export async function getUserDetail(email: string): Promise<AdminUserDetail | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  const { data, error } = await supabaseAdmin().rpc("admin_user_detail", {
    target_email: email.trim().toLowerCase(),
  });
  if (error || !data) return null;

  return data as AdminUserDetail;
}

export type AdminUserRow = {
  email: string;
  tier: string;
  region: string | null;
  displayName: string | null;
  createdAt: string;
  subscriptionStatus: string | null;
};

export async function listUsers(filters: {
  search?: string;
  tier?: string;
  region?: string;
  limit?: number;
  offset?: number;
}): Promise<{ users: AdminUserRow[]; total: number } | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  const search = filters.search?.trim() || null;
  const tierFilter = filters.tier || null;
  const regionFilter = filters.region || null;
  const limitN = filters.limit ?? 50;
  const offsetN = filters.offset ?? 0;

  const [rowsResult, countResult] = await Promise.all([
    supabaseAdmin().rpc("admin_list_users", {
      search,
      tier_filter: tierFilter,
      region_filter: regionFilter,
      limit_n: limitN,
      offset_n: offsetN,
    }),
    supabaseAdmin().rpc("admin_count_users", {
      search,
      tier_filter: tierFilter,
      region_filter: regionFilter,
    }),
  ]);

  if (rowsResult.error || countResult.error || !rowsResult.data) return null;

  const rows = rowsResult.data as Array<{
    email: string;
    tier: string;
    region: string | null;
    display_name: string | null;
    created_at: string;
    subscription_status: string | null;
  }>;

  return {
    users: rows.map((row) => ({
      email: row.email,
      tier: row.tier,
      region: row.region,
      displayName: row.display_name,
      createdAt: row.created_at,
      subscriptionStatus: row.subscription_status,
    })),
    total: countResult.data ?? 0,
  };
}

export type PricingTestResponse = {
  region: string;
  tooCheap: number | null;
  bargain: number | null;
  expensive: number | null;
  tooExpensive: number | null;
  feedback: string | null;
  email: string | null;
  createdAt: string;
};

export async function getPricingTestResults(): Promise<PricingTestResponse[] | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  const { data, error } = await supabaseAdmin().rpc("admin_pricing_test_results");
  if (error || !data) return [];

  return (
    data as Array<{
      region: string;
      too_cheap: number | null;
      bargain: number | null;
      expensive: number | null;
      too_expensive: number | null;
      feedback: string | null;
      email: string | null;
      created_at: string;
    }>
  ).map((row) => ({
    region: row.region,
    tooCheap: row.too_cheap,
    bargain: row.bargain,
    expensive: row.expensive,
    tooExpensive: row.too_expensive,
    feedback: row.feedback,
    email: row.email,
    createdAt: row.created_at,
  }));
}

export type CampaignStats = {
  total: number;
  pending: number;
  sent: number;
  unsubscribed: number;
  failed: number;
};

export async function getCampaignStats(): Promise<CampaignStats | null> {
  const adminEmail = await requireAdminEmail();
  if (!adminEmail) return null;

  const { data, error } = await supabaseAdmin().rpc("admin_campaign_stats");
  if (error || !data) return null;

  return data as CampaignStats;
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
