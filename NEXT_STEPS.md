# SPOCOI — pași următori

## Faza 1 — site de prezentare (în lucru acum)

- [x] Schelă Next.js + Tailwind v4 + Poppins + sistem de design (culori/token-uri din brandbook)
- [x] Homepage (hero, features, disclaimer scurt, waitlist teaser)
- [ ] Pricing (`/pricing`) — toggle regiune MD/RO/UE, model geo-adaptiv curent
- [ ] Waitlist (`/waitlist`) — 3 niveluri, formular front-end (fără backend încă)
- [ ] Pagini legale (`/legal/privacy`, `/legal/terms`, `/legal/ai-disclaimer`) — entitate corectă, vârstă unificată, marcate draft
- [ ] Verificare vizuală în browser (light + dark), mobil + desktop
- [ ] i18n real — acum doar română. Engleză confirmată ca a doua limbă; franceză/spaniolă candidați "probabil", neconfirmați ferm. Rusă exclusă explicit (12 septembrie 2026) — nu o adăuga fără o discuție nouă. Doar planificare deocamdată, nu construim infrastructura de rutare/traducere până nu se confirmă ordinea limbilor. Când se construiește: traducere Claude + verificare de vorbitor nativ înainte de publicare, vezi CLAUDE.md.
- [ ] Waitlist conectat la o bază de date reală (Supabase, Frankfurt) în loc de formularul placeholder
- [ ] Deploy pe Vercel + domeniu

## Faza 2 — aplicația de chat (neînceput)

Mult mai mare decât site-ul de prezentare — necesită decizii de produs înainte să se scrie cod:

- Autentificare (email + Google/Apple, după modelul din prototipul vechi Figma)
- Schemă Supabase: users, sesiuni de conversație, mesaje, abonamente/plăți (Stripe)
- Integrare GPT-4o-mini Realtime pentru text + ElevenLabs pentru voce (vocea "Cristina Amza")
- Interfața de chat: topicuri (mood/stress/advice/support), quick control panel (schimbă subiect, resetează dialog, conversații anterioare), recap de sesiune
- Setări cont: limbă, temă, "danger zone" (resetare istoric, ștergere cont) — fără toggle-urile "Gen Z mode" / "18+" din prototipul vechi, decât dacă Daniel confirmă explicit că le vrea înapoi și clarifică ce înseamnă
- Limite de utilizare pe tier (sesiuni voce/lună, conform tabelului de prețuri)

## De clarificat cu Daniel înainte de lansare

- Revizuire juridică reală a paginilor legale (sunt scrise responsabil, dar rămân draft până le vede un avocat)
- Vârsta minimă (16, cu consimțământ 16–18) — confirmă dacă e politica dorită sau vrei alta
- Dacă vrei un mod "ludic"/informal pentru utilizatori mai tineri ca opțiune explicită, separat de "Gen Z mode" (care a fost eliminat pentru că contrazicea poziționarea)
