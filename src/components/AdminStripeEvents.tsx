import type { StripeEventSummary } from "@/app/actions/admin";

export function AdminStripeEvents({ events }: { events: StripeEventSummary[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Evenimente Stripe recente
      </p>
      {events.length === 0 ? (
        <p className="text-sm text-ink-faint">Niciun eveniment recent.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="rounded-lg border border-line px-3 py-2 text-sm">
              <p className="text-ink">{event.description}</p>
              <p className="text-xs text-ink-faint">
                {new Date(event.created * 1000).toLocaleString("ro-RO")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
