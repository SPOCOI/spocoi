-- "Vorbește cu un om" in the support chat widget now sends an email
-- (via /api/contact-human) instead of just a mailto: link — needs its own
-- rate-limit kind, same pattern as pricing_test.
alter table public.rate_limit_events drop constraint rate_limit_events_kind_check;
alter table public.rate_limit_events add constraint rate_limit_events_kind_check
  check (kind in ('signup', 'waitlist', 'pricing_test', 'contact'));
