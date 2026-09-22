-- Admin dashboard: 7-day trend sparklines + per-user detail on demand.
-- Same security-definer + service_role-only pattern as the rest of the
-- admin read functions.

create or replace function public.admin_daily_trends()
returns json
language sql
security definer
set search_path = public
as $$
  with days as (
    select generate_series(current_date - interval '6 days', current_date, interval '1 day')::date as d
  ),
  signups as (
    select date_trunc('day', created_at)::date as d, count(*) as c
    from public.profiles
    group by 1
  ),
  msgs as (
    select date_trunc('day', created_at)::date as d, count(*) as c
    from public.messages
    group by 1
  )
  select json_build_object(
    'signups', (
      select coalesce(json_agg(coalesce(s.c, 0) order by days.d), '[]'::json)
      from days left join signups s on s.d = days.d
    ),
    'messages', (
      select coalesce(json_agg(coalesce(m.c, 0) order by days.d), '[]'::json)
      from days left join msgs m on m.d = days.d
    )
  );
$$;

revoke all on function public.admin_daily_trends() from public, anon, authenticated;
grant execute on function public.admin_daily_trends() to service_role;

create or replace function public.admin_user_detail(target_email text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'conversations', (
      select count(*) from public.conversations c join auth.users u on u.id = c.user_id where u.email = target_email
    ),
    'messages', (
      select count(*) from public.messages m join auth.users u on u.id = m.user_id where u.email = target_email
    ),
    'lastActivity', (
      select max(m.created_at) from public.messages m join auth.users u on u.id = m.user_id where u.email = target_email
    ),
    'subscriptionSource', (
      select s.source from public.subscriptions s join auth.users u on u.id = s.user_id where u.email = target_email
    ),
    'subscriptionStatus', (
      select s.status from public.subscriptions s join auth.users u on u.id = s.user_id where u.email = target_email
    ),
    'grantedBy', (
      select s.granted_by from public.subscriptions s join auth.users u on u.id = s.user_id where u.email = target_email
    ),
    'expiresAt', (
      select s.expires_at from public.subscriptions s join auth.users u on u.id = s.user_id where u.email = target_email
    )
  );
$$;

revoke all on function public.admin_user_detail(text) from public, anon, authenticated;
grant execute on function public.admin_user_detail(text) to service_role;
