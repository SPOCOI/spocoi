import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChatConversation } from "@/components/ChatConversation";
import { MoodProvider } from "@/components/MoodProvider";
import { MoodIndicator, MoodStatusLabel } from "@/components/MoodIndicator";
import { MoodCheckin } from "@/components/MoodCheckin";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";
import { getActiveConversation, listMessages } from "@/app/actions/conversations";
import { getMoodState, type MoodState } from "@/app/actions/mood";

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
  const tAccount = getDictionary(locale).account;

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
  const moodState: MoodState = (await getMoodState()) ?? {
    phase: 0,
    checkedInToday: true,
    trend: null,
  };

  return (
    <MoodProvider initialState={moodState}>
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
              <MoodIndicator
                statusListening={t.statusListening}
                trendBetter={t.moodTrendBetter}
                trendWorse={t.moodTrendWorse}
              />
              <span className="flex flex-col leading-none">
                <span className="text-sm font-semibold text-ink">{t.backLabel}</span>
                <MoodStatusLabel
                  statusListening={t.statusListening}
                  trendBetter={t.moodTrendBetter}
                  trendWorse={t.moodTrendWorse}
                />
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-ink-faint sm:inline">{user.email}</span>
              <Link
                href={localizedHref("/account", locale)}
                aria-label={tAccount.title}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft hover:text-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M4.5 20c1.2-3.8 4.3-6 7.5-6s6.3 2.2 7.5 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
              <form action={signOutWithLocale}>
                <button
                  type="submit"
                  aria-label={tAuth.signOutButton}
                  className="flex h-8 items-center justify-center rounded-full border border-line px-2 text-xs font-medium text-ink-soft hover:text-ink sm:px-3 sm:py-1.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 sm:hidden" aria-hidden="true">
                    <path
                      d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 16l4-4-4-4M20 12H9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="hidden sm:inline">{tAuth.signOutButton}</span>
                </button>
              </form>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-5 pt-4">
          <span className="inline-block w-fit rounded-full border border-line px-3 py-1 text-xs text-ink-faint">
            {t.previewBadge}
          </span>
          {!moodState.checkedInToday && (
            <MoodCheckin
              question={t.moodQuestion}
              worseLabel={t.moodWorse}
              sameLabel={t.moodSame}
              betterLabel={t.moodBetter}
              skipHint={t.moodSkip}
            />
          )}
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
    </MoodProvider>
  );
}
