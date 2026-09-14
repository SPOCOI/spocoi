-- SPOCOI — schema inițială
-- Faza 1 (waitlist real) + Faza 2 (aplicația de chat), conform deciziilor
-- din NEXT_STEPS.md (14 septembrie 2026).
--
-- Toate tabelele "de utilizator" au RLS: un utilizator vede/scrie DOAR
-- rândurile lui (auth.uid() = user_id). Excepție: waitlist_signups (nu
-- ține de un cont autentificat) și partea de scriere din subscriptions
-- (doar webhook-ul Stripe, cu service role, scrie acolo).

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Faza 1 — waitlist
-- ─────────────────────────────────────────────────────────────

create sequence if not exists public.waitlist_position_seq;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  position integer not null default nextval('public.waitlist_position_seq'),
  region text not null check (region in ('MD', 'RO', 'UE')),
  locale text not null check (locale in ('ro', 'en')),
  created_at timestamptz not null default now()
);

alter sequence public.waitlist_position_seq owned by public.waitlist_signups.position;

alter table public.waitlist_signups enable row level security;

-- Fără nicio policy: acces zero prin cheia publică (nici citire, nici
-- scriere). Scrierea se face printr-un server action, cu service role,
-- ca să nu expunem emailurile utilizatorilor direct clientului.

-- ─────────────────────────────────────────────────────────────
-- Faza 2 — aplicația de chat
-- ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'ro' check (locale in ('ro', 'en')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  region text check (region in ('MD', 'RO', 'UE')),
  tier text not null default 'free' check (tier in ('free', 'simplu', 'plus', 'avansat')),
  personalization_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users manage their own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table public.conversations enable row level security;

create policy "users manage their own conversations"
  on public.conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists conversations_user_id_idx on public.conversations(user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  modality text not null check (modality in ('text', 'voice')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "users manage their own messages"
  on public.messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_created_at_idx on public.messages(created_at);
-- messages_created_at_idx e folosit de job-ul zilnic de ștergere (retenție 30 zile)

create table if not exists public.memory_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  content text not null,
  source_conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  last_confirmed_at timestamptz not null default now()
);

alter table public.memory_entries enable row level security;

create policy "users manage their own memory entries"
  on public.memory_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.voice_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  duration_seconds integer not null check (duration_seconds <= 300),
  started_at timestamptz not null default now()
);

alter table public.voice_sessions enable row level security;

create policy "users manage their own voice sessions"
  on public.voice_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  tier text not null check (tier in ('free', 'simplu', 'plus', 'avansat')),
  region text not null check (region in ('MD', 'RO', 'UE')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active',
  current_period_end timestamptz
);

alter table public.subscriptions enable row level security;

create policy "users view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Scrierea în subscriptions se face DOAR din webhook-ul Stripe (service role,
-- ocolește RLS) — utilizatorul nu trebuie să-și poată schimba singur tier-ul.
