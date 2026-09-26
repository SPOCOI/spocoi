-- Allow the marketing-site support-chat widget (src/lib/ai/support-chat.ts)
-- to log its spend through the same ai_usage_events table/cap logic as the
-- product's own AI calls, under its own kind/tier so it's distinguishable
-- in the log without affecting the existing FREE-tier product cap.
alter table public.ai_usage_events drop constraint ai_usage_events_kind_check;
alter table public.ai_usage_events add constraint ai_usage_events_kind_check
  check (kind in ('reply', 'memory_extraction', 'recap', 'support_chat'));

alter table public.ai_usage_events drop constraint ai_usage_events_tier_check;
alter table public.ai_usage_events add constraint ai_usage_events_tier_check
  check (tier in ('free', 'simplu', 'plus', 'avansat', 'support'));
