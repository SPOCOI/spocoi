"use client";

import { useState } from "react";

const TABS = [
  { key: "overview", label: "Prezentare generală" },
  { key: "users", label: "Utilizatori" },
  { key: "grants", label: "Acces manual" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AdminTabs({
  overview,
  users,
  grants,
}: {
  overview: React.ReactNode;
  users: React.ReactNode;
  grants: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-brand text-ink"
                : "border-transparent text-ink-faint hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab === "overview" && overview}
        {tab === "users" && users}
        {tab === "grants" && grants}
      </div>
    </div>
  );
}
