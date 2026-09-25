import type { CampaignStats } from "@/app/actions/admin";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export function AdminCampaignStats({ stats }: { stats: CampaignStats | null }) {
  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Campanie email
      </p>
      <p className="mb-4 text-xs text-ink-faint">
        Trimitere eșalonată din mail.spocoi.com — deschideri/click-uri se văd în{" "}
        <a
          href="https://resend.com/emails"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-ink"
        >
          dashboard-ul Resend
        </a>
        .
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total contacte" value={stats.total} />
        <StatCard label="În așteptare" value={stats.pending} />
        <StatCard label="Trimise" value={stats.sent} />
        <StatCard label="Dezabonați" value={stats.unsubscribed} />
        <StatCard label="Eșuate" value={stats.failed} />
      </div>
    </div>
  );
}
