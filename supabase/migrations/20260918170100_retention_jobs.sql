-- Extends the existing 30-day message-retention job (see
-- message_retention_job.sql) to the other tables that hold conversation-
-- derived or anti-abuse personal data, none of which had an expiry before
-- this migration — a storage-limitation gap (GDPR Art. 5(1)(e)) found
-- during the September 2026 GDPR review.
--
-- rate_limit_events: only ever queried over a rolling 1h/24h window
-- (see abuse-rate-limit.ts) — nothing reads a row older than that, so IP
-- addresses and device ids had been accumulating indefinitely for no
-- operational reason.
--
-- daily_recaps: AI-generated summaries derived from conversation content
-- that itself is deleted after 30 days (see message_retention_job.sql).
-- Only "today's" recap is ever read (chat/page.tsx), so keeping older
-- rows served no product purpose while contradicting the Privacy
-- Policy's "conversation logs kept 30 days" promise.
--
-- mood_checkins: only the single most recent row is ever read
-- (mood.ts) — the running `profiles.mood_phase` counter already carries
-- the trend forward, so full history has no product use.

select cron.schedule(
  'delete-old-rate-limit-events',
  '15 3 * * *',
  $$ delete from public.rate_limit_events where created_at < now() - interval '30 days'; $$
);

select cron.schedule(
  'delete-old-daily-recaps',
  '20 3 * * *',
  $$ delete from public.daily_recaps where created_at < now() - interval '30 days'; $$
);

select cron.schedule(
  'delete-old-mood-checkins',
  '25 3 * * *',
  $$ delete from public.mood_checkins where created_at < now() - interval '30 days'; $$
);
