-- Admin dashboard read functions: overview stats, conversation activity,
-- and a filterable user list. Same pattern as the admin_grants migration
-- — security-definer functions granted only to service_role, so the
-- admin panel's server actions can read across auth.users/profiles
-- without exposing that access to anon/authenticated.

create or replace function public.admin_overview_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'totalUsers', (select count(*) from public.profiles),
    'newToday', (select count(*) from public.profiles where created_at >= date_trunc('day', now())),
    'newThisWeek', (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    'tierRegionCounts', (
      select coalesce(json_agg(json_build_object('tier', tier, 'region', region, 'count', cnt)), '[]'::json)
      from (
        select tier, coalesce(region, 'necunoscut') as region, count(*) as cnt
        from public.profiles
        group by tier, region
      ) t
    )
  );
$$;

revoke all on function public.admin_overview_stats() from public, anon, authenticated;
grant execute on function public.admin_overview_stats() to service_role;

create or replace function public.admin_conversation_activity()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'totalConversations', (select count(*) from public.conversations),
    'totalMessages', (select count(*) from public.messages),
    'dau', (select count(distinct user_id) from public.messages where created_at >= now() - interval '1 day'),
    'wau', (select count(distinct user_id) from public.messages where created_at >= now() - interval '7 days'),
    'voiceMinutesLast30d', (
      select coalesce(round(sum(duration_seconds) / 60.0, 1), 0)
      from public.voice_sessions
      where started_at >= now() - interval '30 days'
    )
  );
$$;

revoke all on function public.admin_conversation_activity() from public, anon, authenticated;
grant execute on function public.admin_conversation_activity() to service_role;

create or replace function public.admin_list_users(
  search text default null,
  tier_filter text default null,
  region_filter text default null,
  limit_n int default 50,
  offset_n int default 0
)
returns table (
  email text,
  tier text,
  region text,
  display_name text,
  created_at timestamptz,
  subscription_status text
)
language sql
security definer
set search_path = public
as $$
  select
    u.email,
    p.tier,
    p.region,
    p.display_name,
    p.created_at,
    s.status
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.subscriptions s on s.user_id = p.id
  where
    (search is null or u.email ilike '%' || search || '%')
    and (tier_filter is null or p.tier = tier_filter)
    and (region_filter is null or p.region = region_filter)
  order by p.created_at desc
  limit limit_n offset offset_n;
$$;

revoke all on function public.admin_list_users(text, text, text, int, int) from public, anon, authenticated;
grant execute on function public.admin_list_users(text, text, text, int, int) to service_role;

create or replace function public.admin_count_users(
  search text default null,
  tier_filter text default null,
  region_filter text default null
)
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int
  from public.profiles p
  join auth.users u on u.id = p.id
  where
    (search is null or u.email ilike '%' || search || '%')
    and (tier_filter is null or p.tier = tier_filter)
    and (region_filter is null or p.region = region_filter);
$$;

revoke all on function public.admin_count_users(text, text, text) from public, anon, authenticated;
grant execute on function public.admin_count_users(text, text, text) to service_role;
