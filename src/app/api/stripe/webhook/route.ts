import "server-only";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** The only writer of the `subscriptions` table and of `profiles.tier` —
 * intentionally: a user must never be able to grant themselves a paid
 * tier by editing client state, only Stripe confirming real payment can. */

function tierFromMetadata(metadata: Stripe.Metadata | null | undefined): string {
  const tier = metadata?.tier;
  return tier === "simplu" || tier === "plus" || tier === "avansat" ? tier : "free";
}

/** current_period_end moved from the subscription itself to its first
 * item in this Stripe API version — a single-price subscription (our
 * case) has exactly one. */
function currentPeriodEndOf(subscription: Stripe.Subscription): string | null {
  const seconds = subscription.items.data[0]?.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function upsertSubscription(params: {
  userId: string;
  tier: string;
  region: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodEnd: string | null;
}) {
  const admin = supabaseAdmin();
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: params.userId,
      tier: params.tier,
      region: params.region,
      stripe_customer_id: params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      status: params.status,
      current_period_end: params.currentPeriodEnd,
    },
    { onConflict: "user_id" },
  );
  if (error) console.error("stripe webhook: upsertSubscription failed:", error);

  const { error: profileError } = await admin
    .from("profiles")
    .update({ tier: params.tier })
    .eq("id", params.userId);
  if (profileError) console.error("stripe webhook: profiles tier update failed:", profileError);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("stripe webhook: signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ?? session.client_reference_id;
        const region = session.metadata?.region ?? "UE";
        const tier = tierFromMetadata(session.metadata);
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (!userId || !customerId) {
          console.error("stripe webhook: checkout.session.completed missing user_id or customer", session.id);
          break;
        }

        let currentPeriodEnd: string | null = null;
        if (subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          currentPeriodEnd = currentPeriodEndOf(subscription);
        }

        await upsertSubscription({
          userId,
          tier,
          region,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId ?? null,
          status: "active",
          currentPeriodEnd,
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const region = subscription.metadata?.region ?? "UE";
        const tier = subscription.status === "active" || subscription.status === "trialing"
          ? tierFromMetadata(subscription.metadata)
          : "free";
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        if (!userId) {
          console.error("stripe webhook: customer.subscription.updated missing user_id", subscription.id);
          break;
        }

        await upsertSubscription({
          userId,
          tier,
          region,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: currentPeriodEndOf(subscription),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const region = subscription.metadata?.region ?? "UE";
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

        if (!userId) {
          console.error("stripe webhook: customer.subscription.deleted missing user_id", subscription.id);
          break;
        }

        await upsertSubscription({
          userId,
          tier: "free",
          region,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          status: "canceled",
          currentPeriodEnd: null,
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`stripe webhook: failed handling ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
