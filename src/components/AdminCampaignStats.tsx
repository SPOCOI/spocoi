"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { CampaignStats, CampaignDayStats, CampaignRecipientRow } from "@/app/actions/admin";
import { getCampaignRecipientsForDay } from "@/app/actions/admin";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

const STATUS_FILTERS = [
  { key: "all", label: "Toate" },
  { key: "delivered", label: "Livrate" },
  { key: "opened", label: "Deschise" },
  { key: "clicked", label: "Click" },
  { key: "bounced", label: "Bounce" },
  { key: "complained", label: "Spam" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["key"];

// A recipient's delivery_status only ever holds their LATEST event (e.g. "clicked"
// implies delivered+opened already happened) — filtering by an earlier stage in
// this chain must therefore match every status that supersedes it.
const STATUS_INCLUDES: Record<Exclude<StatusFilter, "all">, string[]> = {
  delivered: ["delivered", "opened", "clicked"],
  opened: ["opened", "clicked"],
  clicked: ["clicked"],
  bounced: ["bounced"],
  complained: ["complained"],
};

function statusBadgeClass(status: string | null): string {
  switch (status) {
    case "clicked":
      return "bg-brand/20 text-brand-deep";
    case "opened":
      return "bg-blue-100 text-blue-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    case "bounced":
    case "complained":
      return "bg-red-100 text-red-700";
    default:
      return "bg-line text-ink-faint";
  }
}

function statusLabel(status: string | null): string {
  switch (status) {
    case "clicked":
      return "Click";
    case "opened":
      return "Deschis";
    case "delivered":
      return "Livrat";
    case "bounced":
      return "Bounce";
    case "complained":
      return "Spam";
    case "sent":
      return "Trimis";
    default:
      return "—";
  }
}

export function AdminCampaignStats({
  stats,
  dailyStats,
}: {
  stats: CampaignStats | null;
  dailyStats: CampaignDayStats[] | null;
}) {
  const days = dailyStats ?? [];
  const [selectedDay, setSelectedDay] = useState<string | null>(days[0]?.day ?? null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [recipients, setRecipients] = useState<CampaignRecipientRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedDayStats = days.find((d) => d.day === selectedDay) ?? null;

  useEffect(() => {
    if (selectedDay) loadDay(selectedDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadDay(day: string) {
    setSelectedDay(day);
    setLoaded(false);
    startTransition(async () => {
      const rows = await getCampaignRecipientsForDay(day);
      setRecipients(rows ?? []);
      setLoaded(true);
    });
  }

  const filteredRecipients = useMemo(() => {
    if (statusFilter === "all") return recipients;
    const allowed = STATUS_INCLUDES[statusFilter];
    return recipients.filter((r) => r.deliveryStatus && allowed.includes(r.deliveryStatus));
  }, [recipients, statusFilter]);

  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Campanie email
      </p>
      <p className="mb-4 text-xs text-ink-faint">
        Trimitere eșalonată din mail.spocoi.com — vezi și{" "}
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

      {days.length > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">
              Detalii pe zi
            </p>
            <select
              value={selectedDay ?? ""}
              onChange={(e) => loadDay(e.target.value)}
              className="rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink"
            >
              {days.map((d) => (
                <option key={d.day} value={d.day}>
                  {d.day}
                </option>
              ))}
            </select>
          </div>

          {selectedDayStats && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              <StatCard label="Trimise" value={selectedDayStats.sent} />
              <StatCard label="Livrate" value={selectedDayStats.delivered} />
              <StatCard label="Deschise" value={selectedDayStats.opened} />
              <StatCard label="Click" value={selectedDayStats.clicked} />
              <StatCard label="Bounce" value={selectedDayStats.bounced} />
              <StatCard label="Spam" value={selectedDayStats.complained} />
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusFilter(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === f.key
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink-faint hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-line">
            {!loaded || isPending ? (
              <p className="p-4 text-sm text-ink-faint">Se încarcă...</p>
            ) : filteredRecipients.length === 0 ? (
              <p className="p-4 text-sm text-ink-faint">Niciun rezultat pentru acest filtru.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-ink-faint">
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Trimis la</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipients.map((r) => (
                    <tr key={r.email} className="border-b border-line last:border-0">
                      <td className="px-3 py-2 text-ink">{r.email}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(r.deliveryStatus)}`}
                        >
                          {statusLabel(r.deliveryStatus)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-ink-faint">
                        {r.sentAt ? new Date(r.sentAt).toLocaleString("ro-RO") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
