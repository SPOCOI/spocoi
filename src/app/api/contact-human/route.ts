import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";
import { getClientIp, getOrCreateDeviceId, isRateLimited, recordRateLimitEvent } from "@/lib/abuse-rate-limit";

// Support chat widget's "Vorbește cu un om" — a real human handoff instead
// of a mailto: link that silently does nothing without a configured mail
// client. Sends straight to the team inbox with reply-to set to the
// visitor's own email, so replying is just hitting "Reply" — no new
// dashboard or ticket system.
const TO_ADDRESS = "hello@spocoi.com";
const FROM_ADDRESS = process.env.WAITLIST_FROM_EMAIL ?? "spocoi <hello@spocoi.com>";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { email, message } = (body ?? {}) as { email?: unknown; message?: unknown };
  if (typeof email !== "string" || typeof message !== "string") {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();
  if (!isValidEmail(trimmedEmail) || trimmedMessage.length === 0 || trimmedMessage.length > 4000) {
    return NextResponse.json({ status: "invalid" });
  }

  const ip = await getClientIp();
  const deviceId = await getOrCreateDeviceId();
  if (await isRateLimited("contact", ip, deviceId)) {
    return NextResponse.json({ status: "rate-limited" });
  }

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: trimmedEmail,
      subject: `Mesaj din widget-ul de suport — ${trimmedEmail}`,
      text: trimmedMessage,
    });
  } catch (error) {
    console.error("contact-human: send failed:", error);
    return NextResponse.json({ status: "error" });
  }

  await recordRateLimitEvent("contact", ip, deviceId);
  return NextResponse.json({ status: "ok" });
}
