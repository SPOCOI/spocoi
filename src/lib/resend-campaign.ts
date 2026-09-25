import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

/** Separate Resend account/domain (mail.spocoi.com) from the transactional
 * sender (spocoi.com), so a cold-outreach campaign never risks the
 * deliverability of waitlist/account emails. */
export function getCampaignResend(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_CAMPAIGN_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_CAMPAIGN_API_KEY — check .env.local.");
    client = new Resend(apiKey);
  }
  return client;
}

export const CAMPAIGN_FROM_ADDRESS =
  process.env.CAMPAIGN_FROM_EMAIL ?? "spocoi <hello@mail.spocoi.com>";

export const CAMPAIGN_REPLY_TO = "hello@spocoi.com";
