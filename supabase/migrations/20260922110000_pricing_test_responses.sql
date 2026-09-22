-- Van Westendorp-style soft pricing test for the AVANSAT tier, sent
-- manually to a small group (not linked from the public site). No auth
-- required to respond — same "insert-only via service role" pattern as
-- waitlist_signups.

create table if not exists public.pricing_test_responses (
  id uuid primary key default gen_random_uuid(),
  tier text not null default 'avansat',
  region text not null check (region in ('MD', 'RO', 'UE')),
  too_cheap numeric(10, 2),
  bargain numeric(10, 2),
  expensive numeric(10, 2),
  too_expensive numeric(10, 2),
  feedback text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.pricing_test_responses enable row level security;

-- No policies: zero access through the public key, same as
-- waitlist_signups — writes happen exclusively via the server action's
-- service-role client.

alter table public.rate_limit_events drop constraint rate_limit_events_kind_check;
alter table public.rate_limit_events add constraint rate_limit_events_kind_check
  check (kind in ('signup', 'waitlist', 'pricing_test'));

create or replace function public.admin_pricing_test_results()
returns json
language sql
security definer
set search_path = public
as $$
  select coalesce(json_agg(row_to_json(r) order by r.created_at desc), '[]'::json)
  from (
    select region, too_cheap, bargain, expensive, too_expensive, feedback, email, created_at
    from public.pricing_test_responses
  ) r;
$$;

revoke all on function public.admin_pricing_test_results() from public, anon, authenticated;
grant execute on function public.admin_pricing_test_results() to service_role;
