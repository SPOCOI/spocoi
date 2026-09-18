"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getPriceId, type PaidTier } from "@/lib/stripe";
import { REGION_HEADER, resolveRegion } from "@/lib/region";
import { localizedHref, type Locale } from "@/i18n/config";

async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${h.get("host")}`;
}

/** Starts a Stripe-hosted Checkout session for a paid tier and returns
 * its URL — the client redirects the browser there. We don't create or
 * touch the `subscriptions` row here: that table is written exclusively
 * by the Stripe webhook once payment actually succeeds. */
export async function createCheckoutSession(
  tier: PaidTier,
  locale: Locale,
): Promise<{ status: "ok"; url: string } | { status: "error"; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { status: "error", message: "not-authenticated" };

  const h = await headers();
  const region = (h.get(REGION_HEADER) as ReturnType<typeof resolveRegion> | null) ?? resolveRegion(undefined);
  const origin = await siteOrigin();

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price: getPriceId(tier, region), quantity: 1 }],
      success_url: `${origin}${localizedHref("/account", locale)}?checkout=success`,
      cancel_url: `${origin}${localizedHref("/pricing", locale)}?checkout=cancelled`,
      metadata: { user_id: user.id, tier, region },
      subscription_data: { metadata: { user_id: user.id, tier, region } },
    });

    if (!session.url) return { status: "error", message: "no-url" };
    return { status: "ok", url: session.url };
  } catch (error) {
    console.error("createCheckoutSession failed:", error);
    return { status: "error" };
  }
}

/** Opens the Stripe-hosted billing portal (cancel, change payment
 * method, view invoices) for the signed-in user's existing subscription. */
export async function createPortalSession(
  locale: Locale,
): Promise<{ status: "ok"; url: string } | { status: "error"; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "not-authenticated" };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) return { status: "error", message: "no-subscription" };

  const origin = await siteOrigin();

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}${localizedHref("/account", locale)}`,
    });
    return { status: "ok", url: session.url };
  } catch (error) {
    console.error("createPortalSession failed:", error);
    return { status: "error" };
  }
}
