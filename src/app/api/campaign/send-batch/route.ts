import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCampaignResend, CAMPAIGN_FROM_ADDRESS, CAMPAIGN_REPLY_TO } from "@/lib/resend-campaign";
import { buildCampaignHtml, CAMPAIGN_SUBJECT } from "@/lib/campaign-email";

/** Daily send volume ramps up gradually so a brand-new sending domain
 * (mail.spocoi.com, zero prior reputation) can build trust with mailbox
 * providers before reaching full volume — jumping straight to a large batch
 * gets a much larger share flagged as spam. Index = days since the first
 * successful send; the last value repeats once the ramp is exhausted. */
const WARMUP_SCHEDULE = [20, 20, 40, 40, 70, 70, 100, 100, 150];

async function resolveBatchSize(db: ReturnType<typeof supabaseAdmin>): Promise<number> {
  const { data: firstSent } = await db
    .from("campaign_recipients")
    .select("sent_at")
    .eq("status", "sent")
    .order("sent_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstSent?.sent_at) return WARMUP_SCHEDULE[0];

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(firstSent.sent_at).getTime()) / (24 * 60 * 60 * 1000)
  );
  const dayIndex = Math.min(daysSinceStart, WARMUP_SCHEDULE.length - 1);
  return WARMUP_SCHEDULE[dayIndex];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const batchSize = await resolveBatchSize(db);
  const { data: recipients, error } = await db
    .from("campaign_recipients")
    .select("id, email, unsubscribe_token")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error("send-batch: failed to load recipients:", error);
    return NextResponse.json({ error: "db-error" }, { status: 500 });
  }

  if (!recipients || recipients.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, done: true });
  }

  const resend = getCampaignResend();
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      await resend.emails.send({
        from: CAMPAIGN_FROM_ADDRESS,
        to: recipient.email,
        replyTo: CAMPAIGN_REPLY_TO,
        subject: CAMPAIGN_SUBJECT,
        html: buildCampaignHtml(recipient.unsubscribe_token),
      });
      await db
        .from("campaign_recipients")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", recipient.id);
      sent++;
    } catch (sendError) {
      console.error(`send-batch: failed to send to ${recipient.email}:`, sendError);
      await db.from("campaign_recipients").update({ status: "failed" }).eq("id", recipient.id);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, done: false, batchSize });
}
