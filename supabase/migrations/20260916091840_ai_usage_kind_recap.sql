-- Daily recap / on-demand summary is a third kind of AI call to track
-- alongside reply and memory_extraction.
alter table public.ai_usage_events drop constraint ai_usage_events_kind_check;
alter table public.ai_usage_events
  add constraint ai_usage_events_kind_check
  check (kind in ('reply', 'memory_extraction', 'recap'));
