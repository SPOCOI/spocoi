import type { Metadata } from "next";
import { LogoMark } from "@/components/Logo";
import { unsubscribeByToken } from "@/app/actions/campaign";

export const metadata: Metadata = {
  title: "Dezabonare — spocoi",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await unsubscribeByToken(token) : "not-found";

  return (
    <div className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-2 text-ink">
          <LogoMark className="h-5 w-5" />
          <span className="font-semibold">spocoi</span>
        </div>

        {result === "ok" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Te-am dezabonat.</h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Nu vei mai primi niciun email de la spocoi pe această adresă. Ne pare bine dacă ne
              vom întâlni altă dată.
            </p>
          </>
        )}

        {result === "not-found" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Link invalid.</h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Acest link de dezabonare nu (mai) e valabil. Dacă tot primești email-uri nedorite,
              scrie-ne la support@spocoi.com.
            </p>
          </>
        )}

        {result === "error" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">A apărut o eroare.</h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Nu am putut procesa cererea acum. Încearcă din nou în câteva minute sau scrie-ne la
              support@spocoi.com.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
