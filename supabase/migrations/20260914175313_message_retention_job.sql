-- Șterge automat mesajele mai vechi de 30 de zile — promisiune deja
-- publicată în Privacy Policy ("Jurnalele de conversație sunt păstrate
-- implicit timp de 30 de zile"), nerespectată tehnic până acum.
--
-- Rulează direct în Postgres via pg_cron, o dată pe zi — nu atinge
-- rândul din `conversations` (doar conținutul mesajelor e promis ca
-- fiind șters, nu metadatele conversației).

create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'delete-old-messages',
  '0 3 * * *',
  $$ delete from public.messages where created_at < now() - interval '30 days'; $$
);
