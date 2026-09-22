import type { PricingTestResponse } from "@/app/actions/admin";

function average(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function AdminPricingTest({ responses }: { responses: PricingTestResponse[] }) {
  const avgBargain = average(responses.map((r) => r.bargain));
  const avgExpensive = average(responses.map((r) => r.expensive));
  const avgTooCheap = average(responses.map((r) => r.tooCheap));
  const avgTooExpensive = average(responses.map((r) => r.tooExpensive));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Test preț AVANSAT ({responses.length} răspunsuri)
      </p>

      {responses.length === 0 ? (
        <p className="text-sm text-ink-faint">
          Niciun răspuns încă. Trimite tu linkul{" "}
          <code className="text-xs">/pret-test</code> către grupul mic pe care vrei să-l testezi.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="text-xs text-ink-faint">Prea ieftin (medie)</p>
              <p className="text-lg font-semibold text-ink">
                {avgTooCheap ? `$${avgTooCheap.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="text-xs text-ink-faint">Afacere bună (medie)</p>
              <p className="text-lg font-semibold text-ink">
                {avgBargain ? `$${avgBargain.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="text-xs text-ink-faint">Începe să fie scump (medie)</p>
              <p className="text-lg font-semibold text-ink">
                {avgExpensive ? `$${avgExpensive.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="text-xs text-ink-faint">Prea scump (medie)</p>
              <p className="text-lg font-semibold text-ink">
                {avgTooExpensive ? `$${avgTooExpensive.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-ink-faint">
            Zona optimă e de obicei între media &quot;afacere bună&quot; și media &quot;începe să
            fie scump&quot;.
          </p>

          <div className="mt-4 space-y-2">
            {responses.map((r, i) => (
              <div key={i} className="rounded-lg border border-line px-3 py-2 text-xs">
                <p className="text-ink-soft">
                  {r.region} · ieftin ${r.tooCheap ?? "—"} · afacere ${r.bargain ?? "—"} · scump $
                  {r.expensive ?? "—"} · prea scump ${r.tooExpensive ?? "—"}
                  {r.email ? ` · ${r.email}` : ""}
                </p>
                {r.feedback && <p className="mt-1 text-ink">{r.feedback}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
