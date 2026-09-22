import type { OverviewStats, ActivityStats, DailyTrends } from "@/app/actions/admin";
import { Sparkline } from "@/components/Sparkline";
import { TierBadge } from "@/components/TierBadge";

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string | number;
  trend?: number[];
}) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
      {trend && <Sparkline values={trend} />}
    </div>
  );
}

export function AdminOverview({
  overview,
  activity,
  trends,
}: {
  overview: OverviewStats;
  activity: ActivityStats;
  trends: DailyTrends | null;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Prezentare generală
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Utilizatori total" value={overview.totalUsers} />
        <StatCard label="Înscrieri azi" value={overview.newToday} />
        <StatCard label="Înscrieri (7 zile)" value={overview.newThisWeek} trend={trends?.signups} />
        <StatCard label="MRR estimat" value={`$${overview.mrrEstimate.toFixed(2)}`} />
        <StatCard label="Conversații total" value={activity.totalConversations} />
        <StatCard label="Mesaje (7 zile)" value={activity.totalMessages} trend={trends?.messages} />
        <StatCard label="Activi azi (DAU)" value={activity.dau} />
        <StatCard label="Activi săpt. asta (WAU)" value={activity.wau} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-ink-faint">Distribuție pe tier</p>
          <div className="space-y-1.5">
            {Object.entries(overview.tierCounts).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between text-sm">
                <TierBadge tier={tier} />
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
