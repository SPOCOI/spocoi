-- Admin-granted subscriptions (gifts / comped access) alongside real Stripe
-- subscriptions. Adds provenance + optional expiry to the existing table,
-- plus two security-definer lookup functions so a service-role server
-- action can resolve an email to a user id and list active grants without
-- exposing the auth.users table directly.

alter table public.subscriptions
  add column if not exists source text not null default 'stripe' check (source in ('stripe', 'admin')),
  add column if not exists granted_by text,
  add column if not exists expires_at timestamptz;

create or replace function public.admin_lookup_user_id_by_email(lookup_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where email = lookup_email limit 1;
$$;

revoke all on function public.admin_lookup_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.admin_lookup_user_id_by_email(text) to service_role;

create or replace function public.admin_list_grants()
returns table (
  email text,
  tier text,
  region text,
  status text,
  granted_by text,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select u.email, s.tier, s.region, s.status, s.granted_by, s.expires_at
  from public.subscriptions s
  join auth.users u on u.id = s.user_id
  where s.source = 'admin'
  order by s.expires_at nulls last;
$$;

revoke all on function public.admin_list_grants() from public, anon, authenticated;
grant execute on function public.admin_list_grants() to service_role;

-- Daily sweep: admin grants past their expiry drop back to free automatically.
select cron.schedule(
  'expire-admin-grants',
  '30 3 * * *',
  $$
  with expired as (
    update public.subscriptions
    set status = 'canceled'
    where source = 'admin' and expires_at is not null and expires_at < now() and status = 'active'
    returning user_id
  )
  update public.profiles set tier = 'free' where id in (select user_id from expired);
  $$
);
