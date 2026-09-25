import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getCampaignResend, CAMPAIGN_FROM_ADDRESS, CAMPAIGN_REPLY_TO } from "@/lib/resend-campaign";
import { buildCampaignHtml, CAMPAIGN_SUBJECT } from "@/lib/campaign-email";

/** How many cold-outreach emails to send per invocation — paced daily via
 * Vercel Cron rather than all at once, to protect a brand-new sending
 * domain's reputation. */
const BATCH_SIZE = 150;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const { data: recipients, error } = await db
    .from("campaign_recipients")
    .select("id, email, unsubscribe_token")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

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

  return NextResponse.json({ sent, failed, done: false });
}
