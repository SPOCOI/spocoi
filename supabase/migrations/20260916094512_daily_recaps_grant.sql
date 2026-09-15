-- Missed in the daily_recaps migration — this project has "Automatically
-- expose new tables" off, so RLS alone isn't enough; every table read or
-- written via the user-scoped client also needs an explicit table-level
-- grant (see the comment in 20260914155102_grants.sql for the full story).
grant select, insert, update, delete on public.daily_recaps to authenticated;
