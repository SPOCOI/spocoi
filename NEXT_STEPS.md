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

## Faza 2 — aplicația de chat (neînceput, doar discutat — nimic codat încă)

Mult mai mare decât site-ul de prezentare — decizii de produs/arhitectură stabilite în discuție (14 septembrie 2026), înainte să se scrie cod:

### Poziționare & UI

- **Chatul NU va fi încorporat direct pe homepage.** Rămâne o rută/aplicație separată (`/chat`), fără cont deschis public — pe modelul openai.com (vitrină) vs. chatgpt.com (produs). Motiv: cost per conversație necontrolat, risc de abuz și imposibilitatea gestionării unei crize reale fără identitate, dacă chatul ar fi deschis anonim pe homepage. După lansare, CTA-ul de pe homepage (azi "Intră pe waitlist") va duce spre `/chat`, unde va fi și autentificarea.
- **Preview vizual existent** la `src/app/[locale]/chat/page.tsx` — doar design static (mesaje hardcodate, fără AI/backend real), marcat vizibil ca previzualizare și exclus din indexare (`noindex`). Orb de prezență persistent sus + istoric complet, scrollabil, dedesubt. Tema light e cea a site-ului; tema dark are un fundal dedicat, mai închis (`#0D0F15`), distinct de dark-ul site-ului de prezentare (`globals.css`, clasa `.chat-shell`).

### Autentificare & limite

- La lansare: **doar email + parolă**. Google/Apple mai târziu (Apple cere cont de dezvoltator plătit — nu blochează lansarea).
- **Sesiune de voce**: tăiere strictă la 5 minute, cu avertisment cu câteva secunde înainte de limită.
- **Waitlist peste poziția 1000**: rămâne deschis, doar fără etichetă de tier (Fondator/Pioneer/Early Adopter).

### Schema de date (Supabase) — schiță stabilită

```
profiles          — utilizator: nume, limbă, temă, regiune, tier, personalization_enabled (bool)
conversations     — sesiuni de conversație (subiect, început/sfârșit)
messages          — mesaje brute, șterse automat după 30 zile (job zilnic — confirmat, aliniat cu Privacy Policy publicată)
memory_entries    — "portretul" utilizatorului (vezi mai jos), persistă cât timp există contul
voice_sessions    — sesiuni de voce, tăiate la 5 min, pentru calculul limitei din tier
subscriptions     — starea abonamentului Stripe
```

RLS pe fiecare tabelă: un utilizator vede/scrie DOAR rândurile lui (pattern standard Supabase).

**Retenție conversații — decizie confirmată**: 30 de zile (ce e deja publicat în Privacy Policy), NU 12 luni cum spunea un document intern mai vechi (`SPOCOI_GDPR_Infrastructura.pdf`, aprilie 2026) — documentul vechi e depășit pe acest punct.

### Portret personalizat (memory_entries) — funcționalitate nouă, discutată în detaliu

Ideea: AI-ul nu ține minte transcriptul complet pe termen lung, dar extrage din conversații un portret persistent — fapte durabile despre utilizator (context de viață, tipare emoționale, ce funcționează/nu funcționează), NU detalii trecătoare.

- **Consimțământ**: opt-in explicit la onboarding ("Vrei ca spocoi să-și amintească lucruri importante despre tine?"). Dacă utilizatorul refuză, nu se construiește niciun portret pentru el.
- **Format**: bucăți discrete, editabile individual (ca "amintirile" din ChatGPT) — fiecare cu categorie, sursă (din ce conversație vine), dată. NU un singur bloc de text rescris.
- **Flux**: la finalul unei conversații (doar dacă `personalization_enabled = true`), un pas separat de AI citește conversația + portretul existent, extrage/actualizează `memory_entries`, fără duplicate.
- **Vocea nu se stochează niciodată** (raw audio/transcript) — dacă vrem portret din conversații voce, extragerea trebuie să se facă sincron, în timpul/imediat după sesiune, înainte de ștergere; doar rezultatul distilat ajunge în `memory_entries`.
- **Important — Art. 9 GDPR**: acesta e doar CONSIMȚĂMÂNTUL PENTRU PERSONALIZARE. Separat, tot serviciul (orice conversație, chiar fără portret) procesează date de sănătate mintală — categorie specială GDPR — și are nevoie de propriul checkbox de consimțământ explicit la înregistrare, conform documentului GDPR intern. Sunt DOUĂ consimțăminte distincte, nu unul.
- Utilizatorul trebuie să poată vedea și șterge bucăți individuale din portret (UI de tip "ce știe spocoi despre mine") — cerință de transparență/încredere, dincolo de drepturile GDPR deja promise (acces/rectificare/ștergere).

### Detectare de criză — decizie nouă (14 septembrie 2026)

Construim o detectare de bază (cuvinte/expresii asociate cu suicid, autovătămare) care întrerupe fluxul normal și afișează imediat numerele de urgență. Motiv: pitch-ul trimis către Administrația Prezidențială (`SPOCOI_Minister_Pitch.pdf`) promite explicit "instrumente de monitorizare emoțională pentru detectarea semnalelor de alarmă" — fără asta, promisiunea externă și disclaimer-ul legal actual ("AI-ul nu poate identifica o criză") se contraziceau. Detectarea NU înlocuiește disclaimer-ul legal, doar închide acest decalaj.

### Rutare AI (text) — decizie luată pe bază de calcul real, nu presupunere

Vezi tabelul de preț/cost din `CLAUDE.md`. Pe scurt: **vocea reprezintă 80-95% din costul unitar pe fiecare tier plătit — modelul de text ales schimbă foarte puțin costul total.** Din acest motiv:
- FREE → GPT-4o-mini (cel mai ieftin — contează la scara mare de utilizatori care nu plătesc)
- SIMPLU / PLUS / AVANSAT → **un singur model de text (Claude Haiku)** pentru toate trei, pentru ton consistent — planul vechi de rutare pe două providere diferite (OpenAI/Anthropic, în funcție de tier) a fost abandonat.
- Voce: GPT-4o-mini Realtime (SIMPLU/PLUS), ElevenLabs Flash (AVANSAT) — neschimbat.

### Rămas de făcut (schemă/cod, nu doar discuție)

- Autentificare (email + parolă) — Supabase Auth
- Migrare SQL pentru schema de mai sus + politici RLS
- Job zilnic de ștergere mesaje >30 zile
- Pipeline de extragere/actualizare `memory_entries` (apel AI separat, cu deduplicare)
- Detectare de bază pentru semnale de criză
- Integrare Stripe (checkout + webhook pentru `subscriptions`)
- Interfața de chat reală: topicuri (mood/stress/advice/support), quick control panel, recap de sesiune
- Setări cont: limbă, temă, "danger zone" (resetare istoric, ștergere cont) — fără toggle-urile "Gen Z mode" / "18+" din prototipul vechi, decât dacă Daniel confirmă explicit că le vrea înapoi
- Limite de utilizare pe tier (sesiuni voce/lună — deja tăiate strict la 5 min per sesiune)

## De clarificat cu Daniel înainte de lansare

- Revizuire juridică reală a paginilor legale (sunt scrise responsabil, dar rămân draft până le vede un avocat)
- Vârsta minimă (16, cu consimțământ 16–18) — confirmă dacă e politica dorită sau vrei alta
- Dacă vrei un mod "ludic"/informal pentru utilizatori mai tineri ca opțiune explicită, separat de "Gen Z mode" (care a fost eliminat pentru că contrazicea poziționarea)
- **Data Processing Agreements** cu Supabase, OpenAI și Anthropic — obligatorii înainte de lansare conform checklist-ului GDPR intern (`SPOCOI_GDPR_Infrastructura.pdf`), acțiune legală/administrativă de-a ta, nu ceva ce se codează
- Server rusesc menționat în documentul GDPR din aprilie 2026 (vechiul MVP) — **confirmat de Daniel (14 septembrie 2026) că nu mai e o problemă / nu mai există** — doar consemnat aici ca să rămână un răspuns clar dacă întreabă cineva (ex. MDED)
