"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedHref, type Locale } from "@/i18n/config";
import { signIn } from "@/app/actions/auth";

export function LoginForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).auth;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    const result = await signIn(email, password);

    if (result.status === "ok") {
      router.push(localizedHref("/chat", locale));
      router.refresh();
    } else {
      setStatus("error");
    }
  }

  const errorMessage =
    status === "error" ? t.errorInvalidCredentials : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-7">
      <h1 className="text-xl font-semibold tracking-tight">{t.signInTitle}</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-ink-soft">
            {t.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-ink-soft">
            {t.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-1 w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
        >
          {status === "submitting" ? t.signingIn : t.signInButton}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-faint">
        {t.noAccount}{" "}
        <Link href={localizedHref("/signup", locale)} className="font-medium text-ink underline">
          {t.signUpLink}
        </Link>
      </p>
    </div>
  );
}
