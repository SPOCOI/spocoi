"use client";

import { useState } from "react";
import { createPortalSession } from "@/app/actions/billing";
import type { Locale } from "@/i18n/config";

export function ManageSubscriptionButton({
  locale,
  label,
  errorLabel,
}: {
  locale: Locale;
  label: string;
  errorLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleClick() {
    setStatus("loading");
    const result = await createPortalSession(locale);
    if (result.status === "ok") {
      window.location.href = result.url;
      return;
    }
    setStatus("error");
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink hover:border-ink-faint disabled:opacity-60"
      >
        {label}
      </button>
      {status === "error" && <p className="mt-1.5 text-xs text-red-600">{errorLabel}</p>}
    </div>
  );
}
