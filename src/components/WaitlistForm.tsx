"use client";

import { useState } from "react";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { Region } from "@/lib/region";
import { joinWaitlist } from "@/app/actions/waitlist";

export function WaitlistForm({ locale, region }: { locale: Locale; region: Region }) {
  const t = getDictionary(locale).waitlist;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "already" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("submitting");
    const result = await joinWaitlist(email, region, locale);

    if (result.status === "ok") setStatus("done");
    else if (result.status === "already") setStatus("already");
    else setStatus("error");
  }

  if (status === "done" || status === "already") {
    const isAlready = status === "already";
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="font-semibold">{isAlready ? t.alreadyTitle : t.successTitle}</p>
        <p className="mt-1.5 text-sm text-ink-soft">
          {isAlready ? t.alreadyBody(email) : t.successBody(email)}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <label htmlFor="waitlist-email" className="sr-only">
        {t.formPlaceholder}
      </label>
      <input
        id="waitlist-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.formPlaceholder}
        className="w-full rounded-full border border-line bg-paper px-5 py-3.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand sm:flex-1"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full shrink-0 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] disabled:opacity-60 disabled:hover:scale-100 sm:w-auto"
      >
        {status === "submitting" ? t.formSubmitting : t.formSubmit}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-600 sm:basis-full" role="alert">
          {t.errorBody}
        </p>
      )}
    </form>
  );
}
