import "server-only";
import Stripe from "stripe";
import type { Region } from "@/lib/region";

export type PaidTier = "simplu" | "plus" | "avansat";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("Missing STRIPE_SECRET_KEY — check .env.local.");
    client = new Stripe(apiKey);
  }
  return client;
}

/**
 * Price ids come from env, not a hardcoded table — they differ between
 * Stripe test and live mode, and get created once in the Stripe
 * dashboard (or via the seed script), not from application code.
 */
const PRICE_ENV_VAR: Record<PaidTier, Record<Region, string>> = {
  simplu: { MD: "STRIPE_PRICE_SIMPLU_MD", RO: "STRIPE_PRICE_SIMPLU_RO", UE: "STRIPE_PRICE_SIMPLU_UE" },
  plus: { MD: "STRIPE_PRICE_PLUS_MD", RO: "STRIPE_PRICE_PLUS_RO", UE: "STRIPE_PRICE_PLUS_UE" },
  avansat: { MD: "STRIPE_PRICE_AVANSAT_MD", RO: "STRIPE_PRICE_AVANSAT_RO", UE: "STRIPE_PRICE_AVANSAT_UE" },
};

export function getPriceId(tier: PaidTier, region: Region): string {
  const envVar = PRICE_ENV_VAR[tier][region];
  const priceId = process.env[envVar];
  if (!priceId) throw new Error(`Missing ${envVar} — check .env.local.`);
  return priceId;
}
