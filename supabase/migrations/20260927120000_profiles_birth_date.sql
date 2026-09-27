-- Real date-of-birth capture for age verification, replacing a bare
-- self-attestation checkbox with a computed-age check at signup.
alter table public.profiles
  add column if not exists birth_date date;
