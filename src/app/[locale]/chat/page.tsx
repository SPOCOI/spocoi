import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatConversation } from "@/components/ChatConversation";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { getActiveConversation, listMessages } from "@/app/actions/conversations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).chat;
  return { title: t.metaTitle, robots: { index: false, follow: false } };
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).chat;
  const tAuth = getDictionary(locale).auth;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(localizedHref("/login", locale));
  }

  const signOutWithLocale = signOut.bind(null, locale);
  const conversationId = await getActiveConversation();
  const messages = await listMessages(conversationId);

  return (
    <div
      className="chat-shell flex min-h-screen flex-col"
      style={{ background: "var(--chat-bg)" }}
    >
      <header
        className="sticky top-0 z-10 border-b border-line/60 backdrop-blur"
        style={{ background: "color-mix(in srgb, var(--chat-bg) 88%, transparent)" }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href={localizedHref("/", locale)} className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <span className="absolute inset-0 animate-pulse rounded-full bg-brand/25" />
              <LogoMark className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-ink">{t.backLabel}</span>
              <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {t.statusListening}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-faint sm:inline">{user.email}</span>
            <form action={signOutWithLocale}>
              <button
                type="submit"
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-ink"
              >
                {tAuth.signOutButton}
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 pt-4">
        <span className="inline-block rounded-full border border-line px-3 py-1 text-xs text-ink-faint">
          {t.previewBadge}
        </span>
      </div>

      <ChatConversation
        conversationId={conversationId}
        initialMessages={messages}
        locale={locale}
        emptyState={t.emptyState}
        inputPlaceholder={t.inputPlaceholder}
        sendLabel={t.sendLabel}
        micLabel={t.micLabel}
        rateLimitedBurst={t.rateLimitedBurst}
        rateLimitedDaily={t.rateLimitedDaily}
      />
    </div>
  );
}
