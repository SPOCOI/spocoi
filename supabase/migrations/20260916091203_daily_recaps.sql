-- Daily conversation recap + auto topic classification, discussed and
-- mocked up before building: shows a short, warm continuation prompt for
-- "yesterday's" conversation when the user opens /chat, mutually exclusive
-- with the mood check-in card (never both the same day).
create table if not exists public.daily_recaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recap_date date not null,
  topic text not null check (topic in ('mood', 'stress', 'advice', 'support', 'altele')),
  summary text not null,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, recap_date)
);

alter table public.daily_recaps enable row level security;

create policy "users manage their own daily recaps"
  on public.daily_recaps for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
