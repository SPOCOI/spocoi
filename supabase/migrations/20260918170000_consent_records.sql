-- Auditable proof of consent (GDPR Art. 7(1): the controller must be able
-- to demonstrate that the data subject has consented). Two consent types
-- captured at signup:
--   - 'age_attestation'       — user confirms they meet the 16+ minimum age
--                                (16-18 under parental supervision)
--   - 'special_category_data' — explicit Art. 9(2)(a) consent to process
--                                health-adjacent data disclosed in
--                                conversations (mood, memory entries tagged
--                                "sanatate", daily recap topics, etc.)
-- These are recorded once per account, at signup, pinned to the policy
-- version the user actually saw — never inferred or backfilled.

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in ('age_attestation', 'special_category_data')),
  policy_version text not null,
  granted_at timestamptz not null default now()
);

create index if not exists consents_user_id_idx on public.consents(user_id);

alter table public.consents enable row level security;

create policy "Users can view their own consent records"
  on public.consents for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy: rows are written exclusively by the
-- signUp server action via the service-role client, at the moment consent
-- is actually given — never editable afterward by the user or by us.
