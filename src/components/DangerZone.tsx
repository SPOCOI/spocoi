"use client";

import { useState } from "react";
import { resetConversationHistory, deleteAccount } from "@/app/actions/account";
import type { Locale } from "@/i18n/config";

export function DangerZone({
  locale,
  zoneLabel,
  resetLabel,
  resetButton,
  resetConfirm,
  resetDone,
  deleteLabel,
  deleteButton,
  deleteConfirm,
}: {
  locale: Locale;
  zoneLabel: string;
  resetLabel: string;
  resetButton: string;
  resetConfirm: string;
  resetDone: string;
  deleteLabel: string;
  deleteButton: string;
  deleteConfirm: string;
}) {
  const [resetStatus, setResetStatus] = useState<"idle" | "done">("idle");
  const [deleting, setDeleting] = useState(false);

  async function handleReset() {
    if (!window.confirm(resetConfirm)) return;
    await resetConversationHistory();
    setResetStatus("done");
  }

  async function handleDelete() {
    if (!window.confirm(deleteConfirm)) return;
    setDeleting(true);
    await deleteAccount(locale);
  }

  return (
    <div className="rounded-2xl border border-red-300 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-600">
        {zoneLabel}
      </p>
      <div className="flex items-center justify-between gap-3 pb-3">
        <span className="text-sm text-ink">{resetLabel}</span>
        {resetStatus === "done" ? (
          <span className="text-xs text-ink-faint">{resetDone}</span>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            className="shrink-0 rounded-full border border-red-500 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            {resetButton}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-sm text-ink">{deleteLabel}</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 rounded-full bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleteButton}
        </button>
      </div>
    </div>
  );
}
