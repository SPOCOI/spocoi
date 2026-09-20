import type { OverviewStats, ActivityStats } from "@/app/actions/admin";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

const TIER_LABELS: Record<string, string> = {
  free: "FREE",
  simplu: "SIMPLU",
  plus: "PLUS",
  avansat: "AVANSAT",
};

export function AdminOverview({
  overview,
  activity,
}: {
  overview: OverviewStats;
  activity: ActivityStats;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Prezentare generală
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Utilizatori total" value={overview.totalUsers} />
        <StatCard label="Înscrieri azi" value={overview.newToday} />
        <StatCard label="Înscrieri săpt. asta" value={overview.newThisWeek} />
        <StatCard label="MRR estimat" value={`$${overview.mrrEstimate.toFixed(2)}`} />
        <StatCard label="Conversații total" value={activity.totalConversations} />
        <StatCard label="Mesaje total" value={activity.totalMessages} />
        <StatCard label="Activi azi (DAU)" value={activity.dau} />
        <StatCard label="Activi săpt. asta (WAU)" value={activity.wau} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-ink-faint">Distribuție pe tier</p>
          <div className="space-y-1">
            {Object.entries(overview.tierCounts).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{TIER_LABELS[tier] ?? tier}</span>
                <span className="font-medium text-ink">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-ink-faint">Distribuție pe regiune</p>
          <div className="space-y-1">
            {Object.entries(overview.regionCounts).map(([region, count]) => (
              <div key={region} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{region}</span>
                <span className="font-medium text-ink">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-faint">
        Minute voce folosite (30 zile): {activity.voiceMinutesLast30d}
      </p>
    </div>
  );
}
