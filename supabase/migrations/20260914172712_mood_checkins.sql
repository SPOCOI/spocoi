-- Check-in zilnic de stare ("mai bine / la fel / mai greu ca ieri") și faza
-- lunii afișată în header-ul chat-ului. Fără check-in azi, faza rămâne
-- neschimbată — nicio "pedeapsă" pentru o zi lipsă (decizie de design,
-- vezi NEXT_STEPS.md).

alter table public.profiles
  add column mood_phase integer not null default 0 check (mood_phase between 0 and 6);

create table public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  value text not null check (value in ('worse', 'same', 'better')),
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

alter table public.mood_checkins enable row level security;

create policy "users manage their own mood checkins"
  on public.mood_checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.mood_checkins to authenticated;
