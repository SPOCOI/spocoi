import type { Metadata } from "next";
import { LogoMark } from "@/components/Logo";
import { PricingTestForm } from "@/components/PricingTestForm";

export const metadata: Metadata = {
  title: "Test preț — spocoi",
  robots: { index: false, follow: false },
};

export default function PricingTestPage() {
  return (
    <div className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-2 text-ink">
          <LogoMark className="h-5 w-5" />
          <span className="font-semibold">spocoi</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Ne ajuți să stabilim prețul potrivit?
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Pregătim tier-ul AVANSAT pentru lansare și vrem să-l prețuim corect — nici prea scump,
          nici sub valoarea lui reală. Îți ia un minut, iar răspunsul tău contează direct.
        </p>

        <div className="mt-6">
          <PricingTestForm />
        </div>
      </div>
    </div>
  );
}
