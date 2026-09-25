import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { AdminGrantForm } from "@/components/AdminGrantForm";
import { AdminOverview } from "@/components/AdminOverview";
import { AdminStripeEvents } from "@/components/AdminStripeEvents";
import { AdminUserTable } from "@/components/AdminUserTable";
import { AdminTabs } from "@/components/AdminTabs";
import { AdminPricingTest } from "@/components/AdminPricingTest";
import { AdminCampaignStats } from "@/components/AdminCampaignStats";
import {
  isCurrentUserAdmin,
  listGrants,
  getOverviewStats,
  getActivityStats,
  getRecentStripeEvents,
  getDailyTrends,
  getPricingTestResults,
  getCampaignStats,
  getCampaignDailyStats,
  listUsers,
} from "@/app/actions/admin";
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

  const [
    grants,
    overview,
    activity,
    trends,
    stripeEvents,
    usersPage,
    pricingTest,
    campaignStats,
    campaignDailyStats,
  ] = await Promise.all([
    listGrants(),
    getOverviewStats(),
    getActivityStats(),
    getDailyTrends(),
    getRecentStripeEvents(),
    listUsers({ limit: 20, offset: 0 }),
    getPricingTestResults(),
    getCampaignStats(),
    getCampaignDailyStats(),
  ]);

  return (
    <div className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href={localizedHref("/account", locale)}
          className="mb-6 inline-flex items-center gap-2 text-xs text-ink-faint hover:text-ink"
        >
          <LogoMark className="h-4 w-4" />
          Înapoi la cont
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-ink">Panou admin</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Statistici, activitate, evenimente Stripe și acordare manuală de tier-uri.
        </p>

        <div className="mt-6">
          <AdminTabs
            overview={
              <>
                {overview && activity && (
                  <AdminOverview overview={overview} activity={activity} trends={trends} />
                )}
                <AdminStripeEvents events={stripeEvents ?? []} />
                <AdminPricingTest responses={pricingTest ?? []} />
              </>
            }
            users={
              <AdminUserTable
                initialUsers={usersPage?.users ?? []}
                initialTotal={usersPage?.total ?? 0}
              />
            }
            grants={<AdminGrantForm initialGrants={grants ?? []} />}
            campaign={<AdminCampaignStats stats={campaignStats} dailyStats={campaignDailyStats} />}
          />
        </div>
      </div>
    </div>
  );
}
