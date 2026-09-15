-- Checkpoint for the memory-extraction pipeline: the AI portrait is
-- per-user, not per-conversation (there's only ever one open conversation
-- anyway), so extraction only needs to know "messages newer than this".
alter table public.profiles
  add column if not exists memory_last_extracted_at timestamptz;

-- Fixed taxonomy, decided in chat before building the pipeline — keeps
-- entries comparable for dedup and groupable in the /account UI.
alter table public.memory_entries
  add constraint memory_entries_category_check
  check (category in ('relatii', 'job', 'sanatate', 'obiective', 'stresori_recurenti', 'preferinte', 'altele'));
