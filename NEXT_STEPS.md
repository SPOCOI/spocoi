# SPOCOI — pași următori

## Faza 1 — site de prezentare (în lucru acum)

- [x] Schelă Next.js + Tailwind v4 + Poppins + sistem de design (culori/token-uri din brandbook)
- [x] Homepage (hero, features, disclaimer scurt, waitlist teaser)
- [x] Pricing (`/pricing`) — geo-adaptiv automat MD/RO/UE, fără toggle vizibil
- [x] Waitlist (`/waitlist`) — 3 niveluri, formular front-end (fără backend încă)
- [x] Pagini legale (`/legal/privacy`, `/legal/terms`, `/legal/ai-disclaimer`) — entitate corectă, vârstă unificată, marcate draft
- [x] Verificare vizuală în browser (light + dark, mobil + desktop) — spot-check pe homepage/pricing/waitlist
- [x] Favicon real (lună crescentă, `src/app/icon.svg`) — favicon-ul implicit Next.js a fost înlocuit
- [ ] Verifică/actualizează link-urile sociale din footer (Instagram/TikTok) — sunt presupuse (`spocoi`), nu confirmate ca fiind conturile reale
- [ ] Trecere completă, pagină cu pagină, prin toate cele 6 rute în ambele teme + mobil (am verificat punctual, nu exhaustiv)
- [x] i18n real — română (implicit, fără prefix) + engleză (`/en`), rutare pe `src/app/[locale]`, dicționar central în `src/i18n/dictionaries.ts`, switch de limbă în navbar. Franceză/spaniolă rămân candidați "probabil", neconfirmați ferm — nu construim infrastructura pentru ele până nu se confirmă. Rusă exclusă explicit (12 septembrie 2026) — nu o adăuga fără o discuție nouă. Traducerea EN a fost generată de Claude — încă nu a fost verificată de un vorbitor nativ de engleză, vezi nota din CLAUDE.md.
- [ ] Waitlist conectat la o bază de date reală (Supabase, Frankfurt) în loc de formularul placeholder
- [ ] Deploy pe Vercel + domeniu

## Faza 2 — aplicația de chat (neînceput)

Mult mai mare decât site-ul de prezentare — necesită decizii de produs înainte să se scrie cod:

- **Decizie de arhitectură (12 septembrie 2026, confirmată de Daniel):** chatul NU va fi încorporat direct pe homepage. Rămâne o rută/aplicație separată (`/chat`), fără cont deschis public — pe modelul openai.com (vitrină) vs. chatgpt.com (produs). Motiv: cost per conversație necontrolat, risc de abuz și imposibilitatea gestionării unei crize reale fără identitate, dacă chatul ar fi deschis anonim pe homepage. După lansare, CTA-ul de pe homepage (azi "Intră pe waitlist") va duce spre `/chat`, unde va fi și autentificarea.
- **Preview vizual existent** la `src/app/[locale]/chat/page.tsx` — doar design static (mesaje hardcodate, fără AI/backend real), marcat vizibil ca previzualizare și exclus din indexare (`noindex`). Implementează structura stabilită anterior: orb de prezență persistent sus + istoric complet, scrollabil, dedesubt (nu un takeover cu un singur mesaj pe tot ecranul). Tema light e cea a site-ului; tema dark are un fundal dedicat, mai închis (`#0D0F15`), distinct de dark-ul site-ului de prezentare (definit în `globals.css`, clasa `.chat-shell`).
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
