"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { listUsers, getUserDetail, type AdminUserRow, type AdminUserDetail } from "@/app/actions/admin";
import { TierBadge } from "@/components/TierBadge";

const PAGE_SIZE = 20;

function UserDetailRow({ email }: { email: string }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUserDetail(email).then((result) => {
      if (!cancelled) {
        setDetail(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (loading) {
    return <p className="px-3 py-3 text-xs text-ink-faint">Se încarcă...</p>;
  }
  if (!detail) {
    return <p className="px-3 py-3 text-xs text-ink-faint">Nu s-au putut încărca detaliile.</p>;
  }

  const source =
    detail.subscriptionSource === "admin"
      ? `Acordat manual${detail.grantedBy ? ` de ${detail.grantedBy}` : ""}${
          detail.expiresAt
            ? ` · expiră ${new Date(detail.expiresAt).toLocaleDateString("ro-RO")}`
            : " · permanent"
        }`
      : detail.subscriptionSource === "stripe"
        ? `Stripe${detail.subscriptionStatus ? ` · ${detail.subscriptionStatus}` : ""}`
        : "FREE";

  return (
    <div className="grid grid-cols-2 gap-3 px-3 py-3 text-xs sm:grid-cols-4">
      <div>
        <p className="text-ink-faint">Conversații</p>
        <p className="text-ink">{detail.conversations}</p>
      </div>
      <div>
        <p className="text-ink-faint">Mesaje</p>
        <p className="text-ink">{detail.messages}</p>
      </div>
      <div>
        <p className="text-ink-faint">Ultima activitate</p>
        <p className="text-ink">
          {detail.lastActivity ? new Date(detail.lastActivity).toLocaleDateString("ro-RO") : "—"}
        </p>
      </div>
      <div>
        <p className="text-ink-faint">Sursă abonament</p>
        <p className="text-ink">{source}</p>
      </div>
    </div>
  );
}

export function AdminUserTable({
  initialUsers,
  initialTotal,
}: {
  initialUsers: AdminUserRow[];
  initialTotal: number;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await listUsers({
        search,
        tier: tier || undefined,
        region: region || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (result) {
        setUsers(result.users);
        setTotal(result.total);
      }
    });
  }, [search, tier, region, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-brand-deep">
        Utilizatori ({total})
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          placeholder="Caută după email"
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={tier}
          onChange={(e) => {
            setPage(0);
            setTier(e.target.value);
          }}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Toate tier-urile</option>
          <option value="free">FREE</option>
          <option value="simplu">SIMPLU</option>
          <option value="plus">PLUS</option>
          <option value="avansat">AVANSAT</option>
        </select>
        <select
          value={region}
          onChange={(e) => {
            setPage(0);
            setRegion(e.target.value);
          }}
          className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="">Toate regiunile</option>
          <option value="MD">Moldova</option>
          <option value="RO">România</option>
          <option value="UE">Restul UE</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-ink-faint">
              <th className="pb-2 pr-3 font-medium">Email</th>
              <th className="pb-2 pr-3 font-medium">Tier</th>
              <th className="pb-2 pr-3 font-medium">Regiune</th>
              <th className="pb-2 pr-3 font-medium">Înscris</th>
            </tr>
          </thead>
          <tbody className={isPending ? "opacity-50" : ""}>
            {users.map((user) => (
              <Fragment key={user.email}>
                <tr
                  onClick={() => setExpanded(expanded === user.email ? null : user.email)}
                  className="cursor-pointer border-b border-line/50 hover:bg-paper"
                >
                  <td className="py-2 pr-3 text-ink">{user.displayName || user.email}</td>
                  <td className="py-2 pr-3">
                    <TierBadge tier={user.tier} />
                  </td>
                  <td className="py-2 pr-3 text-ink-soft">{user.region ?? "—"}</td>
                  <td className="py-2 pr-3 text-ink-soft">
                    {new Date(user.createdAt).toLocaleDateString("ro-RO")}
                  </td>
                </tr>
                {expanded === user.email && (
                  <tr className="border-b border-line/50 bg-paper">
                    <td colSpan={4}>
                      <UserDetailRow email={user.email} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-ink-faint">
                  Niciun utilizator găsit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-full border border-line px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-ink-faint">
            Pagina {page + 1} din {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="rounded-full border border-line px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Următor
          </button>
        </div>
      )}
    </div>
  );
}
