-- Per-email delivery/engagement tracking, populated by the Resend webhook
-- (/api/campaign/webhook) rather than polled from Resend's API — lets the
-- admin panel show delivered/opened/clicked/bounced without an extra call
-- per recipient.

alter table public.campaign_recipients
  add column if not exists resend_email_id text,
  add column if not exists delivery_status text
    check (delivery_status in ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  add column if not exists delivered_at timestamptz,
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz,
  add column if not exists bounced_at timestamptz;

create index if not exists campaign_recipients_resend_email_id_idx
  on public.campaign_recipients (resend_email_id);

create or replace function public.admin_campaign_daily_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select coalesce(json_agg(row_to_json(t) order by t.day desc), '[]'::json)
  from (
    select
      to_char(sent_at, 'YYYY-MM-DD') as day,
      count(*) as sent,
      count(*) filter (where delivery_status in ('delivered', 'opened', 'clicked')) as delivered,
      count(*) filter (where delivery_status in ('opened', 'clicked')) as opened,
      count(*) filter (where delivery_status = 'clicked') as clicked,
      count(*) filter (where delivery_status = 'bounced') as bounced,
      count(*) filter (where delivery_status = 'complained') as complained
    from public.campaign_recipients
    where sent_at is not null
    group by to_char(sent_at, 'YYYY-MM-DD')
  ) t;
$$;

revoke all on function public.admin_campaign_daily_stats() from public, anon, authenticated;
grant execute on function public.admin_campaign_daily_stats() to service_role;

create or replace function public.admin_campaign_recipients_for_day(target_day text)
returns json
language sql
security definer
set search_path = public
as $$
  select coalesce(json_agg(row_to_json(t) order by t.sent_at desc), '[]'::json)
  from (
    select email, status, delivery_status, sent_at, delivered_at, opened_at, clicked_at, bounced_at
    from public.campaign_recipients
    where sent_at is not null
      and to_char(sent_at, 'YYYY-MM-DD') = target_day
  ) t;
$$;

revoke all on function public.admin_campaign_recipients_for_day(text) from public, anon, authenticated;
grant execute on function public.admin_campaign_recipients_for_day(text) to service_role;
