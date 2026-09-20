"use client";

import { useState, useTransition } from "react";
import { grantTier, revokeGrant, listGrants, type AdminTier, type AdminGrant } from "@/app/actions/admin";
import type { Region } from "@/lib/region";

export function AdminGrantForm({ initialGrants }: { initialGrants: AdminGrant[] }) {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<AdminTier>("plus");
  const [region, setRegion] = useState<Region>("MD");
  const [expiresAt, setExpiresAt] = useState("");
  const [grants, setGrants] = useState(initialGrants);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const fresh = await listGrants();
      if (fresh) setGrants(fresh);
    });
  }

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await grantTier(email, tier, region, expiresAt ? new Date(expiresAt).toISOString() : null);
      if (result.status === "ok") {
        setMessage(`${email} a primit acum tier-ul ${tier.toUpperCase()}.`);
        setEmail("");
        setExpiresAt("");
        refresh();
      } else if (result.status === "user-not-found") {
        setMessage(`Niciun cont găsit cu emailul ${email}.`);
      } else if (result.status === "not-authorized") {
        setMessage("Nu ai acces la acest panou.");
      } else {
        setMessage(`Eroare: ${result.message ?? "necunoscută"}.`);
      }
    });
  }

  async function handleRevoke(targetEmail: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await revokeGrant(targetEmail);
      if (result.status === "ok") {
        setMessage(`Acces retras pentru ${targetEmail}.`);
        refresh();
      } else {
        setMessage(`Eroare la retragere: ${"message" in result ? result.message : result.status}.`);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleGrant} className="rounded-2xl border border-line bg-surface p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-deep">
          Acordă acces
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-ink-faint">Email utilizator</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@exemplu.com"
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as AdminTier)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="simplu">SIMPLU</option>
              <option value="plus">PLUS</option>
              <option value="avansat">AVANSAT</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-faint">Regiune</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="MD">Moldova</option>
              <option value="RO">România</option>
              <option value="UE">Restul UE</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-ink-faint">
              Expiră la (opțional — necompletat = permanent)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 sm:w-auto"
        >
          {isPending ? "Se procesează..." : "Acordă tier"}
        </button>
        {message && <p className="mt-3 text-sm text-ink-soft">{message}</p>}
      </form>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-deep">
          Acordate manual ({grants.length})
        </p>
        {grants.length === 0 ? (
          <p className="text-sm text-ink-faint">Niciun acces acordat manual momentan.</p>
        ) : (
          <div className="space-y-2">
            {grants.map((grant) => (
              <div
                key={grant.email}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{grant.email}</p>
                  <p className="text-xs text-ink-faint">
                    {grant.tier.toUpperCase()} · {grant.region} · {grant.status}
                    {grant.expiresAt
                      ? ` · expiră ${new Date(grant.expiresAt).toLocaleDateString("ro-RO")}`
                      : " · permanent"}
                    {grant.grantedBy ? ` · de la ${grant.grantedBy}` : ""}
                  </p>
                </div>
                {grant.status === "active" && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(grant.email)}
                    disabled={isPending}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-ink-faint disabled:opacity-60"
                  >
                    Retrage
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
