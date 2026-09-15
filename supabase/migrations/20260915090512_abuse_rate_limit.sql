-- IP/device rate limiting for unauthenticated surfaces (signup, waitlist) —
-- closes the gap where the per-account message cap (rate-limit.ts) could be
-- bypassed by just creating more accounts. One generic table for every
-- "kind" of gated action, rather than a new table per endpoint.
create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('signup', 'waitlist')),
  ip text,
  device_id text,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_kind_ip_idx
  on public.rate_limit_events(kind, ip, created_at);
create index if not exists rate_limit_events_kind_device_idx
  on public.rate_limit_events(kind, device_id, created_at);

alter table public.rate_limit_events enable row level security;

-- No policies — same as waitlist_signups: zero access through the public
-- key, written only from server actions via the service role.
