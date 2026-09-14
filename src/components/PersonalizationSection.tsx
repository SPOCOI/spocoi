"use client";

import { useState } from "react";
import { setPersonalizationEnabled, deleteMemoryEntry } from "@/app/actions/account";
import type { MemoryEntry } from "@/app/actions/memory";

export function PersonalizationSection({
  initialEnabled,
  initialEntries,
  title,
  body,
  memoryListLabel,
  emptyState,
  disabledState,
}: {
  initialEnabled: boolean;
  initialEntries: MemoryEntry[];
  title: string;
  body: string;
  memoryListLabel: string;
  emptyState: string;
  disabledState: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [entries, setEntries] = useState(initialEntries);

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    await setPersonalizationEnabled(next);
  }

  async function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await deleteMemoryEntry(id);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{body}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggle}
          className="relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors"
          style={{ background: enabled ? "var(--color-brand)" : "var(--color-line)" }}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
            style={{ transform: enabled ? "translateX(19px)" : "translateX(3px)" }}
          />
        </button>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          {memoryListLabel}
        </p>
        {!enabled ? (
          <p className="text-xs text-ink-faint">{disabledState}</p>
        ) : entries.length === 0 ? (
          <p className="text-xs text-ink-faint">{emptyState}</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 border-b border-line pb-2.5 last:border-0 last:pb-0"
              >
                <div>
                  <span className="mb-1 inline-block rounded-md bg-brand-pale px-2 py-0.5 text-[10.5px] font-semibold text-brand-deep">
                    {entry.category}
                  </span>
                  <p className="text-sm text-ink">{entry.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  aria-label="delete"
                  className="mt-0.5 shrink-0 text-ink-faint hover:text-ink"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
