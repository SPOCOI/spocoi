import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ResendWebhookEvent = {
  type: string;
  data: { email_id: string };
};

const STATUS_BY_EVENT: Record<string, string> = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

const TIMESTAMP_COLUMN_BY_EVENT: Record<string, string> = {
  "email.delivered": "delivered_at",
  "email.opened": "opened_at",
  "email.clicked": "clicked_at",
  "email.bounced": "bounced_at",
};

// Resend never downgrades a shown status once a recipient engaged further —
// a later "delivered" retry must not overwrite an already-recorded "clicked".
const STATUS_RANK = ["sent", "delivered", "opened", "clicked", "bounced", "complained"];

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook-not-configured" }, { status: 500 });
  }

  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "missing-signature-headers" }, { status: 400 });
  }

  try {
    const webhook = new Webhook(secret);
    // verify() only validates the signature (throws if invalid) — it does not
    // return the parsed body, so we still parse `payload` ourselves below.
    webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return NextResponse.json({ error: "invalid-signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as ResendWebhookEvent;

  const newStatus = STATUS_BY_EVENT[event.type];
  if (!newStatus) {
    return NextResponse.json({ ignored: event.type });
  }

  const db = supabaseAdmin();
  const { data: recipient } = await db
    .from("campaign_recipients")
    .select("id, delivery_status")
    .eq("resend_email_id", event.data.email_id)
    .maybeSingle();

  if (!recipient) {
    return NextResponse.json({ ignored: "unknown-email-id" });
  }

  const currentRank = STATUS_RANK.indexOf(recipient.delivery_status ?? "sent");
  const newRank = STATUS_RANK.indexOf(newStatus);
  if (newRank < currentRank) {
    return NextResponse.json({ ignored: "stale-status" });
  }

  const timestampColumn = TIMESTAMP_COLUMN_BY_EVENT[event.type];
  await db
    .from("campaign_recipients")
    .update({
      delivery_status: newStatus,
      ...(timestampColumn ? { [timestampColumn]: new Date().toISOString() } : {}),
    })
    .eq("id", recipient.id);

  return NextResponse.json({ ok: true });
}
