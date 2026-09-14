-- Grants la nivel de tabelă — necesare separat de RLS.
--
-- La crearea proiectului am dezactivat intenționat "Automatically expose
-- new tables" (control manual al accesului). Efect secundar: nicio tabelă
-- nouă nu primește automat grants pentru NICIUN rol Postgres — nici măcar
-- service_role, care altfel ar ocoli RLS dar tot are nevoie de privilegiul
-- de bază la nivel de tabelă (GRANT) ca să poată scrie.
--
-- RLS controlează CE RÂNDURI sunt vizibile; GRANT controlează CE OPERAȚII
-- sunt posibile la nivel de tabelă. Ambele straturi sunt necesare.

grant usage on schema public to service_role, authenticated, anon;

-- service_role: acces complet — folosit doar din server actions/webhooks,
-- niciodată din client. Bypasses RLS, dar tot are nevoie de acest grant.
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- authenticated: operațiile permise pe propriile rânduri — impuse de RLS,
-- nu de acest grant (grant-ul doar deblochează operația la nivel de tabelă).
grant select, insert, update, delete on
  public.profiles,
  public.conversations,
  public.messages,
  public.memory_entries,
  public.voice_sessions
to authenticated;

-- Utilizatorul doar citește starea abonamentului lui; scrierea e doar din
-- webhook-ul Stripe (service_role).
grant select on public.subscriptions to authenticated;

-- waitlist_signups nu primește niciun grant pentru anon/authenticated —
-- scrierea trece exclusiv prin server action, cu service_role.

-- Pentru orice tabelă viitoare (Faza 2 continuă): service_role primește
-- automat acces complet, ca să nu repetăm această problemă la fiecare
-- tabelă nouă.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
