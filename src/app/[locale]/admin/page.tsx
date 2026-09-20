import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { AdminGrantForm } from "@/components/AdminGrantForm";
import { isCurrentUserAdmin, listGrants } from "@/app/actions/admin";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Admin — spocoi",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect(localizedHref("/login", locale));
  }

  const grants = (await listGrants()) ?? [];

  return (
    <div className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-xl">
        <Link
          href={localizedHref("/account", locale)}
          className="mb-6 inline-flex items-center gap-2 text-xs text-ink-faint hover:text-ink"
        >
          <LogoMark className="h-4 w-4" />
          Înapoi la cont
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-ink">Panou admin</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Acordă sau retrage acces la un tier plătit, fără să treci prin Stripe. Folosește pentru cadouri,
          testare internă sau parteneriate.
        </p>

        <div className="mt-6">
          <AdminGrantForm initialGrants={grants} />
        </div>
      </div>
    </div>
  );
}
