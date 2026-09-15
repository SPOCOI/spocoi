-- Platform-wide AI spend tracking — separate from rate-limit.ts (per-user)
-- and abuse-rate-limit.ts (per-IP/device): this answers "how much are we
-- spending, in total, today" so a FREE-tier traffic spike can't run up a
-- real bill with no individual rate limit ever tripping.
create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('reply', 'memory_extraction')),
  tier text not null check (tier in ('free', 'simplu', 'plus', 'avansat')),
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  cost_usd numeric(10, 6) not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_events_created_at_idx on public.ai_usage_events(created_at);
create index if not exists ai_usage_events_tier_created_at_idx on public.ai_usage_events(tier, created_at);

alter table public.ai_usage_events enable row level security;

-- No policies — service role only, same pattern as waitlist_signups and
-- rate_limit_events.
