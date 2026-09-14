-- Garantează o singură conversație "deschisă" (ended_at is null) per
-- utilizator, la nivel de bază de date — nu doar prin logica din
-- getActiveConversation(). Fără asta, două cereri concurente (ex. la
-- prima încărcare a paginii /chat) pot crea fiecare câte o conversație,
-- iar cea "activă" aleasă la reîncărcare poate fi alta decât cea în care
-- s-au scris mesajele.
create unique index conversations_one_open_per_user
  on public.conversations (user_id)
  where ended_at is null;
