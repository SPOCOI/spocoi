import { notFound } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { isLocale, type Locale } from "@/i18n/config";

export default async function MarketingLayout({
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
    <div className="flex min-h-screen flex-col">
      <NavBar locale={typedLocale} />
      <main className="flex-1">{children}</main>
      <Footer locale={typedLocale} />
    </div>
  );
}
