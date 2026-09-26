import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SetHtmlLang } from "@/components/SetHtmlLang";
import { SupportChatWidget } from "@/components/SupportChatWidget";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://spocoi.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).home;

  // Site-wide fallback card (homepage title/description) for every page
  // under this layout that doesn't set its own openGraph/twitter block —
  // none currently do, so this is what every shared link actually shows.
  return {
    metadataBase: new URL(SITE_URL),
    title: t.metaTitle,
    description: t.metaDescription,
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: SITE_URL,
      siteName: "spocoi",
      locale: locale === "en" ? "en_US" : "ro_RO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t.metaTitle,
      description: t.metaDescription,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale: Locale = locale;

  return (
    <>
      <SetHtmlLang locale={typedLocale} />
      {children}
      <SupportChatWidget locale={typedLocale} />
    </>
  );
}
