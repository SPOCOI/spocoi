import type { Metadata } from "next";
import { SignupForm } from "@/components/SignupForm";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  return { title: getDictionary(locale).auth.signUpMetaTitle };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  return <SignupForm locale={locale} />;
}
