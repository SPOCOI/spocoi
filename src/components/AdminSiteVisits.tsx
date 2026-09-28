import type { SiteVisitStats, SiteVisitBreakdown } from "@/app/actions/admin";
import { Sparkline } from "@/components/Sparkline";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobil",
  desktop: "Desktop",
  tablet: "Tabletă",
  necunoscut: "Necunoscut",
};

export function AdminSiteVisits({
  stats,
  daily,
  breakdown,
}: {
  stats: SiteVisitStats | null;
  daily: number[] | null;
  breakdown: SiteVisitBreakdown | null;
}) {
  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Trafic site
      </p>
      <p className="mb-4 text-xs text-ink-faint">
        Contor propriu, fără cookie-uri — vezi și{" "}
        <a
          href="https://vercel.com/spocoi/spocoi/analytics"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-ink"
        >
          Vercel Analytics
        </a>{" "}
        pentru detalii suplimentare (bounce rate, browsere).
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Azi" value={stats.today} />
        <StatCard label="7 zile" value={stats.last7d} />
        <StatCard label="30 zile" value={stats.last30d} />
      </div>

      {daily && daily.length > 1 && (
        <div className="mt-4">
          <p className="mb-1 text-xs text-ink-faint">Ultimele 7 zile</p>
          <Sparkline values={daily} />
        </div>
      )}

      {breakdown && (
        <div className="mt-6 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
          <div>
            <p className="mb-2 text-xs text-ink-faint">Pagini populare (30 zile)</p>
            <div className="space-y-1.5">
              {breakdown.topPages.length === 0 && (
                <p className="text-sm text-ink-faint">Fără date încă.</p>
              )}
              {breakdown.topPages.map((row) => (
                <div key={row.path} className="flex items-center justify-between text-sm">
                  <span className="truncate text-ink-soft">{row.path}</span>
                  <span className="font-medium text-ink">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-ink-faint">Țări (30 zile)</p>
            <div className="space-y-1.5">
              {breakdown.topCountries.length === 0 && (
                <p className="text-sm text-ink-faint">Fără date încă.</p>
              )}
              {breakdown.topCountries.map((row) => (
                <div key={row.country} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{row.country}</span>
                  <span className="font-medium text-ink">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-ink-faint">Dispozitiv (30 zile)</p>
            <div className="space-y-1.5">
              {Object.entries(breakdown.deviceCounts).length === 0 && (
                <p className="text-sm text-ink-faint">Fără date încă.</p>
              )}
              {Object.entries(breakdown.deviceCounts).map(([device, count]) => (
                <div key={device} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{DEVICE_LABELS[device] ?? device}</span>
                  <span className="font-medium text-ink">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
