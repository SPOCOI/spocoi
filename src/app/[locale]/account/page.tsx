import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DisplayNameForm } from "@/components/DisplayNameForm";
import { PersonalizationSection } from "@/components/PersonalizationSection";
import { DangerZone } from "@/components/DangerZone";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { listMemoryEntries } from "@/app/actions/memory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).account;
  return { title: t.metaTitle, robots: { index: false, follow: false } };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).account;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(localizedHref("/login", locale));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, personalization_enabled, tier")
    .eq("id", user.id)
    .single();

  const memoryEntries = profile?.personalization_enabled ? await listMemoryEntries() : [];

  return (
    <div className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-xl">
        <Link
          href={localizedHref("/chat", locale)}
          className="mb-6 inline-flex items-center gap-2 text-xs text-ink-faint hover:text-ink"
        >
          <LogoMark className="h-4 w-4" />
          {t.backLabel}
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t.title}</h1>
        <p className="mt-1 text-sm text-ink-faint">{user.email}</p>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            {t.basicInfoLabel}
          </p>
          <DisplayNameForm
            initialName={profile?.display_name ?? ""}
            label={t.displayNameLabel}
            placeholder={t.displayNamePlaceholder}
            saveLabel={t.saveLabel}
            savedLabel={t.savedLabel}
          />
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-deep">
            {t.preferencesLabel}
          </p>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-ink">{t.languageLabel}</span>
            <LanguageSwitch locale={locale} />
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-ink">{t.themeLabel}</span>
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <PersonalizationSection
            initialEnabled={profile?.personalization_enabled ?? false}
            initialEntries={memoryEntries}
            title={t.personalizationTitle}
            body={t.personalizationBody}
            memoryListLabel={t.memoryListLabel}
            emptyState={t.memoryEmptyState}
            disabledState={t.memoryDisabledState}
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-surface p-5">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              {t.subscriptionLabel}
            </p>
            <p className="text-sm font-semibold text-ink">
              {(profile?.tier ?? "free").toUpperCase()}
            </p>
          </div>
          <Link
            href={localizedHref("/pricing", locale)}
            className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-ink-faint"
          >
            {t.viewPlansLabel}
          </Link>
        </div>

        <div className="mt-4">
          <DangerZone
            locale={locale}
            zoneLabel={t.dangerZoneLabel}
            resetLabel={t.resetHistoryLabel}
            resetButton={t.resetHistoryButton}
            resetConfirm={t.resetHistoryConfirm}
            resetDone={t.resetHistoryDone}
            deleteLabel={t.deleteAccountLabel}
            deleteButton={t.deleteAccountButton}
            deleteConfirm={t.deleteAccountConfirm}
          />
        </div>
      </div>
    </div>
  );
}
