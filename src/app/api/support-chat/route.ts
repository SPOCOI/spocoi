import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { generateSupportReply, type SupportChatMessage } from "@/lib/ai/support-chat";
import { isPlatformCapExceeded } from "@/lib/ai/usage-cap";

// Public, unauthenticated endpoint — bound the request shape tightly since
// there's no per-user rate limit here, only the shared platform cost cap.
const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1000;

function isValidHistory(value: unknown): value is SupportChatMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) return false;
  return value.every(
    (m) =>
      m &&
      typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length > 0 &&
      m.content.length <= MAX_MESSAGE_LENGTH,
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const { messages, locale: rawLocale } = (body ?? {}) as {
    messages?: unknown;
    locale?: unknown;
  };

  if (!isValidHistory(messages)) {
    return NextResponse.json({ error: "invalid-messages" }, { status: 400 });
  }

  const locale: Locale =
    typeof rawLocale === "string" && isLocale(rawLocale) ? rawLocale : defaultLocale;

  if (await isPlatformCapExceeded("support")) {
    return NextResponse.json({ error: "cap-exceeded" }, { status: 503 });
  }

  try {
    const reply = await generateSupportReply(messages, locale);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("support-chat: generation failed:", error);
    return NextResponse.json({ error: "generation-failed" }, { status: 500 });
  }
}
