-- Cold-outreach email campaign (invite an external contact list to the
-- waitlist). Sends are paced in daily batches from a route handler, not
-- sent all at once — see /api/campaign/send-batch. Every recipient gets
-- a stable unsubscribe_token embedded in their email footer link.

create table if not exists public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending' check (status in ('pending', 'sent', 'unsubscribed', 'failed')),
  unsubscribe_token uuid not null default gen_random_uuid(),
  sent_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.campaign_recipients enable row level security;

-- No policies: zero access through the public key. Reads/writes happen
-- exclusively via the service-role client (send-batch route, unsubscribe
-- action, admin stats).

create index if not exists campaign_recipients_status_idx on public.campaign_recipients (status);
create unique index if not exists campaign_recipients_unsubscribe_token_idx on public.campaign_recipients (unsubscribe_token);

create or replace function public.admin_campaign_stats()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'total', (select count(*) from public.campaign_recipients),
    'pending', (select count(*) from public.campaign_recipients where status = 'pending'),
    'sent', (select count(*) from public.campaign_recipients where status = 'sent'),
    'unsubscribed', (select count(*) from public.campaign_recipients where status = 'unsubscribed'),
    'failed', (select count(*) from public.campaign_recipients where status = 'failed')
  );
$$;

revoke all on function public.admin_campaign_stats() from public, anon, authenticated;
grant execute on function public.admin_campaign_stats() to service_role;
