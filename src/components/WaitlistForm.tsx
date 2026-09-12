"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">(
    "idle",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("submitting");

    // TODO(backend): momentan nu există niciun API/Supabase conectat.
    // Când se conectează, aici va veni apelul real de forma:
    //   await supabase.from("waitlist").insert({ email });
    // și tratarea erorilor înainte de a marca formularul ca "done".
    setTimeout(() => {
      setStatus("done");
    }, 400);
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="font-semibold">Mulțumim, te contactăm la lansare.</p>
        <p className="mt-1.5 text-sm text-ink-soft">
          Ai fost adăugat pe waitlist la adresa {email}.
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
        Adresa ta de email
      </label>
      <input
        id="waitlist-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="adresa-ta@email.com"
        className="w-full rounded-full border border-line bg-paper px-5 py-3.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand sm:flex-1"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full shrink-0 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] disabled:opacity-60 disabled:hover:scale-100 sm:w-auto"
      >
        {status === "submitting" ? "Se trimite..." : "Rezervă-ți locul"}
      </button>
    </form>
  );
}
