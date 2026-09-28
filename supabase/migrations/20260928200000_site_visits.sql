-- Own lightweight pageview logger for the admin dashboard — Vercel Web
-- Analytics (enabled separately) has no public query API, so it can't be
-- pulled into /admin. This table holds only aggregable, non-identifying
-- data: no cookies, no per-visitor id, no raw IP/user-agent. Populated by
-- POST /api/track, fired from every page via SiteVisitTracker.tsx.

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null,
  referrer_host text,
  country text,
  device text check (device in ('mobile', 'desktop', 'tablet'))
);

alter table public.site_visits enable row level security;

-- No policies: zero access through the public key. Inserts happen via the
-- service-role client in /api/track; reads happen via the admin_* RPCs below.

create index if not exists site_visits_created_at_idx on public.site_visits (created_at);
create index if not exists site_visits_path_idx on public.site_visits (path);

create or replace function public.admin_site_visits_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'total', (select count(*) from public.site_visits),
    'today', (select count(*) from public.site_visits where created_at >= current_date),
    'last7d', (select count(*) from public.site_visits where created_at >= now() - interval '7 days'),
    'last30d', (select count(*) from public.site_visits where created_at >= now() - interval '30 days')
  );
$$;

revoke all on function public.admin_site_visits_stats() from public, anon, authenticated;
grant execute on function public.admin_site_visits_stats() to service_role;

-- Same 7-day window shape as admin_daily_trends (a plain number[] the
-- Sparkline component consumes directly), for visual consistency.
create or replace function public.admin_site_visits_daily()
returns json
language sql
security definer
set search_path = public
as $$
  with days as (
    select generate_series(current_date - interval '6 days', current_date, interval '1 day')::date as d
  ),
  visits as (
    select date_trunc('day', created_at)::date as d, count(*) as c
    from public.site_visits
    group by 1
  )
  select coalesce(json_agg(coalesce(v.c, 0) order by days.d), '[]'::json)
  from days left join visits v on v.d = days.d;
$$;

revoke all on function public.admin_site_visits_daily() from public, anon, authenticated;
grant execute on function public.admin_site_visits_daily() to service_role;

create or replace function public.admin_site_visits_breakdown()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'topPages', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select path, count(*) as count
        from public.site_visits
        where created_at >= now() - interval '30 days'
        group by path
        order by count(*) desc
        limit 10
      ) t
    ),
    'topCountries', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select coalesce(country, 'necunoscut') as country, count(*) as count
        from public.site_visits
        where created_at >= now() - interval '30 days'
        group by coalesce(country, 'necunoscut')
        order by count(*) desc
        limit 10
      ) t
    ),
    'deviceCounts', (
      select coalesce(json_object_agg(coalesce(device, 'necunoscut'), count), '{}'::json)
      from (
        select device, count(*) as count
        from public.site_visits
        where created_at >= now() - interval '30 days'
        group by device
      ) t
    )
  );
$$;

revoke all on function public.admin_site_visits_breakdown() from public, anon, authenticated;
grant execute on function public.admin_site_visits_breakdown() to service_role;
