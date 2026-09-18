"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCheckoutSession } from "@/app/actions/billing";
import { localizedHref, type Locale } from "@/i18n/config";
import type { PaidTier } from "@/lib/stripe";

export function PricingCheckoutButton({
  tier,
  locale,
  label,
  redirectingLabel,
  errorLabel,
  className,
}: {
  tier: PaidTier;
  locale: Locale;
  label: string;
  redirectingLabel: string;
  errorLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleClick() {
    setStatus("loading");
    const result = await createCheckoutSession(tier, locale);

    if (result.status === "ok") {
      window.location.href = result.url;
      return;
    }

    if (result.message === "not-authenticated") {
      router.push(localizedHref("/signup", locale));
      return;
    }

    setStatus("error");
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={status === "loading"} className={className}>
        {status === "loading" ? redirectingLabel : label}
      </button>
      {status === "error" && <p className="mt-2 text-xs text-red-600">{errorLabel}</p>}
    </div>
  );
}
