-- Creează automat un rând în public.profiles la fiecare cont nou din
-- Supabase Auth (auth.users), indiferent de ce client a creat contul.
-- Coloanele nespecificate iau valorile default deja definite pe profiles
-- (locale 'ro', theme 'system', tier 'free', personalization_enabled false).

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
