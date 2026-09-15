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
- [x] Waitlist conectat la o bază de date reală (Supabase, Frankfurt) — `src/app/actions/waitlist.ts`, tabela `waitlist_signups`, testat live (înscriere nouă + caz de duplicat)
- [ ] Deploy pe Vercel + domeniu

## Faza 2 — aplicația de chat (începută — schema + autentificare gata, restul discutat)

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

### Autentificare — construită și testată (14 septembrie 2026)

Email + parolă prin Supabase Auth, folosind `@supabase/ssr` (sesiune ținută în cookies, reîmprospătată din `proxy.ts` la fiecare cerere care trece prin matcher).

- `/login`, `/signup` — rută separată `(auth)`, fără navbar/footer de marketing, shell minimal (logo + card centrat)
- `/chat` e acum protejat real — redirect la `/login` dacă nu ești autentificat; header-ul arată emailul contului și un buton de ieșire din cont
- Trigger Postgres (`handle_new_user`, migrarea `20260914155808_profile_on_signup.sql`) creează automat un rând `profiles` la fiecare cont nou, indiferent de client
- Testat end-to-end: înregistrare → sesiune activă → `/chat` accesibil → ieșire din cont → `/chat` cere din nou login → autentificare cu același cont funcționează
- **⚠️ Important, de rezolvat înainte de lansarea reală**: "Confirm email" e **dezactivat temporar** în Supabase (Authentication → Sign In / Providers) — planul gratuit are un SMTP de test cu limită foarte mică de emailuri/oră, care bloca testarea. Codul din `src/app/actions/auth.ts` tratează deja corect ambele cazuri (cu/fără confirmare), dar înainte de lansare trebuie fie reactivat "Confirm email" + configurat SMTP propriu (recomandat, altfel utilizatorii nu pot primi email de confirmare/resetare parolă), fie acceptat conștient riscul de conturi cu emailuri neverificate

### Conversații & mesaje reale — construite și testate (14 septembrie 2026)

`/chat` citește/scrie acum din `conversations`/`messages` reale, per utilizator autentificat (`src/app/actions/conversations.ts`, componenta client `ChatConversation.tsx`) — nu mai e doar design static. (AI-ul chiar răspunde acum — vezi secțiunea următoare, adăugată în aceeași sesiune.)

- `getActiveConversation()` — găsește conversația deschisă a utilizatorului sau creează una nouă
- `sendMessage()` — scrie mesajul utilizatorului, întors imediat în UI (fără reîncărcare)
- **Bug prins și rezolvat pe loc**: două cereri concurente la prima încărcare a `/chat` puteau crea fiecare câte o conversație "deschisă" pentru același utilizator — la reîncărcare, se alegea uneori cea goală, nu cea cu mesaje. Rezolvat cu un index unic la nivel de bază de date (`conversations_one_open_per_user`, migrarea `20260914162520_one_open_conversation.sql`), plus tratarea coliziunii în cod (re-citește conversația câștigătoare în loc să eșueze)
- Testat: mesaje multiple, ordine corectă, persistă corect după reîncărcări repetate

### AI-ul răspunde real — construit și testat (14 septembrie 2026)

`/chat` folosește acum Claude Haiku (Anthropic) pentru răspunsuri reale, plus detectarea de bază pentru semnale de criză decisă mai devreme.

- **Provider**: doar Anthropic deocamdată (decizie explicită) — toată lumea e pe tier FREE fără Stripe, deci rutarea FREE/plătit pe provider diferit (planificată în CLAUDE.md) rămâne pentru când există abonamente reale de diferențiat. Cheie separată, proiect/workspace Anthropic dedicat (`spocoi-chat-backend`), NU cheia folosită de agentul de marketing.
- `src/lib/ai/reply.ts` — system prompt cu tonul de brand (matur, cald, NU Gen Z), separat RO/EN; trimite tot istoricul conversației la Claude, deci AI-ul chiar ține minte contextul (verificat: a recunoscut și a reacționat corect la un mesaj anterior de criză, într-un răspuns ulterior, fără să fie alarmist)
- `src/lib/crisis-detection.ts` — cuvinte-cheie RO+EN (sinucidere, autovătămare etc.); dacă mesajul utilizatorului le conține, **sare peste apelul AI** și răspunde direct cu numerele de urgență din `getCrisisResources(region)` — testat, funcționează
- `profiles.region` se completează acum la înregistrare (din header-ul de geo-detecție deja existent), ca detectarea de criză să arate resursele regiunii corecte — înainte rămânea `null`
- **Bug prins și rezolvat**: textul cu paragrafe (`\n\n`) al răspunsului de criză nu se afișa cu linii separate — rezolvat cu `whitespace-pre-line` în `ChatConversation.tsx`
- Testat end-to-end, în ambele limbi: conversație normală (răspuns cald, contextual), semnal de criză (răspuns fix, cu resurse, fără AI), schimbare de limbă UI mid-conversație (răspunde corect în limba curentă a UI-ului)

### Limitare de cost — construită și testată (14 septembrie 2026)

`src/lib/rate-limit.ts`, verificat în `sendMessage()` înainte de orice scriere în bază sau apel AI:

- **Limită de rafală** (toate tier-urile): max 10 mesaje/minut — protecție pură împotriva abuzului/bot-urilor, nu ține de cost per tier
- **Limită zilnică per tier**: FREE = 30 mesaje/zi (exact numărul deja asumat în modelul financiar — nu o cifră inventată), SIMPLU/PLUS/AVANSAT = 150/400/1000 (valori provizorii, generoase — nimeni nu e încă pe ele fără Stripe, de revizuit când există abonamente reale)
- Când o limită e atinsă: **nu se scrie nimic în bază, nu se apelează AI-ul** — utilizatorul vede o notificare discretă deasupra casetei de input (nu ca mesaj de chat), textul rămâne în casetă ca să poată reîncerca
- Testat live: coborâtă temporar limita de rafală la 2 pentru verificare rapidă (al 3-lea mesaj a fost blocat corect, cu notificarea corectă), apoi repusă la 10

**Rămâne de făcut, separat**: rate-limiting la nivel de IP/dispozitiv (pentru abuz înainte de a avea cont).

### Fereastră de context AI limitată — construită și testată (14 septembrie 2026)

Problemă reală, nu doar teoretică: `sendMessage` trimitea la Claude **tot istoricul conversației**, la fiecare mesaj — costul per mesaj creștea nelimitat pe măsură ce o conversație se lungea (o conversație de 200 de mesaje ar fi retrimis toate cele 200 ca și context, de fiecare dată), și la un moment dat s-ar fi lovit de limita de context a modelului.

- `src/app/actions/conversations.ts` — `listRecentMessages()` nouă, trimite la AI doar **ultimele 20 de mesaje** (`AI_CONTEXT_MESSAGE_LIMIT`), nu tot istoricul. `listMessages()` (folosită pentru afișarea în UI) rămâne neschimbată — utilizatorul vede tot istoricul, doar AI-ul primește o fereastră limitată
- Memoria pe termen lung, dincolo de fereastră, rămâne treaba `memory_entries` (portretul), nu a istoricului brut — consistent cu arhitectura deja decisă
- Testat live: coborâtă temporar fereastra la 4 mesaje, spus AI-ului un "nume secret" în primul mesaj, trimise 2 mesaje de umplutură, apoi întrebat "ce nume ți-am spus" — AI-ul a răspuns corect că nu i s-a spus niciun nume, confirmând că primul mesaj a ieșit din fereastră. Repusă fereastra la 20 după test.

### Pagina de cont + "luna" (check-in zilnic) — construite și testate (14 septembrie 2026)

Design iterat mai întâi prin mockup-uri (vezi discuția), apoi implementat real.

**Pagina de cont** (`/account`, protejată, `src/app/[locale]/account/page.tsx`):
- Date de bază (nume afișat, editabil), preferințe (limbă/temă — reutilizează `LanguageSwitch`/`ThemeToggle` existente)
- Portret AI: toggle pentru `profiles.personalization_enabled` + listă de `memory_entries` cu ștergere individuală (lista e goală acum — pipeline-ul de extragere a portretului nu există încă, doar UI-ul de vizualizare/ștergere)
- Abonament: tier curent (FREE) + link spre `/pricing`
- Zonă periculoasă: reset istoric conversație (șterge `messages`+`conversations` pentru utilizator) și ștergere cont definitivă (prin `supabaseAdmin().auth.admin.deleteUser`, cascadează prin toate tabelele)
- Link către `/account` adăugat în header-ul din `/chat` (iconiță de persoană)
- **Testat live, inclusiv zona periculoasă**: am eliminat temporar `window.confirm()` (browser-ul automatizat nu poate accepta dialoguri native) doar cât să confirm că acțiunile chiar rulează — reset istoric confirmat în loguri, ștergere cont confirmată direct în Supabase (`user_count = 0` după ștergere) — apoi am repus confirmările reale în cod

**"Luna" — check-in zilnic + indicator de stare în header** (ideea lui Daniel, dezvoltată prin mockup-uri):
- Întrebare simplă, o dată pe zi, la prima deschidere a `/chat`: "Cum te simți azi, față de ieri?" — mai greu / la fel / mai bine (`src/components/MoodCheckin.tsx`)
- Fără presiune pe zilele lipsă: dacă nu răspunzi, `profiles.mood_phase` rămâne neschimbat — nu scade doar pentru că ai lipsit o zi
- Faza lunii (0-6, din `profiles.mood_phase`) desenată ca icon SVG cu două cercuri suprapuse (`src/components/MoonPhase.tsx`), cu "umbra" adaptată la tema curentă (`var(--chat-bg)`) — funcționează identic în light și dark
- Header-ul din `/chat` arată luna + eticheta de tendință ("ascultă · în creștere"/"în scădere") — stare partajată între header și cardul de check-in printr-un context React (`MoodProvider.tsx`), fiindcă sunt în locuri diferite pe pagină
- Schema: `profiles.mood_phase` (0-6) + tabela `mood_checkins` (unique per user/zi) — migrarea `20260914172712_mood_checkins.sql`
- Testat live: check-in real → luna trece de la fază 0 la 1, eticheta devine "în creștere", cardul dispare corect

### Verificare exhaustivă front-end — toate rutele, ambele teme, mobil+desktop (14 septembrie 2026)

La cererea lui Daniel, înainte de a trece mai departe la logică/backend. Găsite și reparate 4 bug-uri reale:

- **Header `/chat` cramponat pe mobil**: butonul de sign-out își rupea textul pe două linii sub `sm`, forțând și linia de stare a lunii să se rupă. Reparat cu buton doar-iconiță sub `sm` (`src/app/[locale]/chat/page.tsx`).
- **Tema salvată nu se aplica la un load nou al paginii**: `ThemeToggle.tsx` actualiza starea React din `localStorage` la montare, dar nu apela niciodată `applyTheme()` acolo (doar din `toggle()`) — deci tema salvată se vedea doar după un toggle live, nu la un refresh/link nou. Reparat + adăugat un `<script>` blocant în `<head>`-ul din `layout.tsx` ca să nu mai existe flash de temă greșită înainte de hidratare, plus `suppressHydrationWarning` pe `<html>`.
- **Textele de criză (`crisis.ts`) ignorau locale-ul**: etichetele liniilor de sprijin și nota de fallback pentru Moldova erau hardcodate în română, indiferent de limba site-ului — vizibil pe paginile legale în engleză, dar și în răspunsul real de criză din chat (`buildCrisisReply`) pentru un utilizator care scrie în engleză. Reparat: `getCrisisResources()` ia acum și `locale`, cu variante RO/EN pentru fiecare string.
- **Data "ultima actualizare" de pe paginile legale** era hardcodată în română ("12 septembrie 2026") pe ambele locale-uri. Reparat cu formatul EN corespunzător pe `/en`.

Verificat fără probleme: homepage, pricing, waitlist, login, signup (toate — light+dark, desktop+mobil), `/account` (light+dark, mobil+desktop, inclusiv zona periculoasă), `/en` pentru toate paginile de mai sus, meniul mobil (hamburger).

### Pipeline-ul de extragere a portretului (`memory_entries`) — discutat în chat, apoi construit și testat (15 septembrie 2026)

Decizii luate în chat înainte de cod: personalizarea rămâne pe toate tier-urile (inclusiv FREE — cost mic, throttled), dezactivarea toggle-ului doar pauzează extragerea (nu șterge faptele existente), trigger inline cu `waitUntil` (nu job cron separat).

- **Trigger**: `sendMessage` (`src/app/actions/conversations.ts`) apelează `waitUntil(runMemoryExtraction(...))` din `@vercel/functions` după ce răspunsul AI e deja salvat — rulează după ce utilizatorul a primit deja răspunsul, deci nu adaugă latență percepută. Throttled: rulează doar dacă s-au acumulat cel puțin 6 mesaje noi de la user de la ultima extragere (`src/lib/ai/memory-extraction.ts`).
- **Checkpoint**: `profiles.memory_last_extracted_at` (migrarea `20260914181940_memory_extraction.sql`) — portretul e per-user, nu per-conversație, fiindcă există mereu o singură conversație deschisă.
- **Extragere**: apel Claude Haiku separat, primește faptele existente (cu id) + mesajele noi, răspunde cu un JSON de operații `add`/`update`/`remove` pe categorie. Dedup prin context (modelul vede ce există deja), nu prin embeddings.
- **Categorii fixe** (și constrânse la nivel de DB): `relatii`, `job`, `sanatate`, `obiective`, `stresori_recurenti`, `preferinte`, `altele`.
- **Injectare înapoi în conversație**: `generateAssistantReply` (`src/lib/ai/reply.ts`) primește faptele (max 20, cele mai recent confirmate) și le adaugă într-un bloc separat în system prompt, cu instrucțiune explicită să le folosească firesc, nu să le recite.
- **Testat live, end-to-end**: cont de test, 6 mesaje care conțin câte un fapt durabil diferit (job, despărțire, obiectiv, stres cu șeful, preferință, somn) → toate 6 extrase corect, în categoriile corecte, rezumate (nu copiate cuvânt cu cuvânt), vizibile în `/account`. Verificat și injectarea: un mesaj ulterior ("Azi a fost o zi grea la birou", fără să menționeze șeful) a primit un răspuns AI care întreabă explicit despre "șef" — dovadă că portretul chiar ajunge în conversație, nu doar se salvează.

### Rate-limiting IP/dispozitiv pe crearea de conturi și waitlist — discutat în chat, apoi construit și testat (15 septembrie 2026)

Gaura pe care o închide: `rate-limit.ts` (limitarea de mesaje/zi) e per cont — nimic nu împiedica pe cineva să ocolească capul FREE (30 mesaje/zi) creând conturi noi la nesfârșit. Decizii luate în chat înainte de cod: protejăm atât signup cât și waitlist; semnalul e IP **și** un cookie anonim de dispozitiv (nu fingerprinting — doar un UUID random, httpOnly), ca farming-ul cu VPN/IP rotative de pe același browser să fie prins și el.

- **Tabel generic** `rate_limit_events` (`kind`, `ip`, `device_id`, `created_at`) — migrarea `20260915090512_abuse_rate_limit.sql`, RLS activ fără nicio policy (acces doar prin service role, la fel ca `waitlist_signups`).
- **Praguri** (fereastră glisantă, nu total istoric): signup max 3 conturi / IP / 24h și max 3 / dispozitiv / 24h; waitlist max 5 / oră (risc mult mai mic — doar poluează tabela).
- **`src/lib/abuse-rate-limit.ts`**: `getOrCreateDeviceId()` (cookie `spocoi-device`, setat direct din server action), `getClientIp()` (citește `x-real-ip`/`x-forwarded-for` direct din headers — **nu** prin `ipAddress()` din `@vercel/functions`, care nu recunoaște `ReadonlyHeaders` din `next/headers` și arunca `TypeError: headers.get is not a function`, găsit și reparat în timpul testării), `isRateLimited()`, `recordRateLimitEvent()` (apelat doar după succes, nu la fiecare încercare).
- **Testat live**: 3 conturi noi create în succesiune de pe același "dispozitiv" (browser) → toate reușite; al 4-lea → blocat cu mesajul dedicat, fără niciun rând nou în `auth.users` (verificat direct în SQL Editor). Confirmat că toate 3 au același `device_id` în `rate_limit_events`.

### Cap agregat de cost/tokeni la nivel de platformă — discutat în chat, apoi construit și testat (15 septembrie 2026)

Gaura pe care o închide: nici `rate-limit.ts` (per cont) nici `abuse-rate-limit.ts` (per IP/dispozitiv) nu răspund la "cât cheltuim, în total, azi, pe toată platforma" — dacă FREE devine viral, mulți utilizatori legitimi, fiecare în limita lui individuală, tot pot împinge costul real peste ce-și permite afacerea. Descoperire făcută înainte de a scrie cod: `response.usage` (tokeni reali) din răspunsurile Anthropic nu era capturat nicăieri, deși vine gratis la fiecare apel.

- **Ce se măsoară**: tokeni reali (`input_tokens`/`output_tokens`) din fiecare apel Anthropic — atât `generateAssistantReply` cât și `runMemoryExtraction` — convertiți în cost $ cu prețurile din `CLAUDE.md` (Haiku $1/$5 per 1M). Loghează în tabelul nou `ai_usage_events` (`kind`, `tier`, `model`, `input_tokens`, `output_tokens`, `cost_usd`) — migrarea `20260915103822_ai_usage_cap.sql`.
- **Enforcement în doi pași** (`src/lib/ai/usage-cap.ts`), verificat înainte de orice apel AI: un plafon **moale** de $5/zi pe cheltuiala FREE (doar FREE se oprește, tier-urile plătite continuă normal) și un plafon **dur** de $25/zi pe cheltuiala totală (oprește pe toată lumea, indiferent de tier — plasă de siguranță pentru un bug sau atac). Praguri conservatoare, alese pre-lansare cu trafic aproape zero — de recalibrat cu date reale.
- **Fereastră zilnică**, reset UTC — la fel ca la limita per-tier din `rate-limit.ts`.
- **Găsit și reparat în timpul construcției**: `getReplyText`/`generateAssistantReply` nu primeau `tier`-ul deloc — trebuia plumbat prin `sendMessage` ca să știm ce cheltuială atribuim cui.
- **Testat live, ambele plafoane**: (1) inserat manual $6 cheltuială sintetică pe FREE azi → următorul mesaj al unui cont FREE a fost blocat corect, cu notificarea dedicată ("volum neașteptat de mare"), fără scriere în bază. (2) urcat contul de test la tier `avansat` + inserat $30 cheltuială totală (deloc pe FREE) → tot blocat, dovadă că plafonul dur chiar ignoră tier-ul. Confirmat și cazul normal: un mesaj obișnuit a scris un rând corect în `ai_usage_events` (319 tokeni input, 33 output, cost calculat exact: $0.000484).

### Interfața de chat mai avansată: topicuri, recap zilnic, rezumat rapid — mockup vizual înainte de cod, apoi construit și testat (16 septembrie 2026)

Cerința originală ("topicuri, quick control panel, recap de sesiune") era vagă — clarificată în chat, apoi confirmată vizual printr-un mockup (vezi discuția) înainte de a scrie cod. Decizii cheie: topicurile se clasifică automat de AI, nu alese manual; "sesiune" nu există ca concept în schema curentă (o singură conversație mereu deschisă per user), așa că "recap de sesiune" a devenit **recap zilnic**; "quick control panel" s-a redus la un singur buton de rezumat la cerere, nu un panou nou.

Din feedback pe mockup, trei corecții aplicate înainte de cod: eticheta de topic e text neutru, nu pastilă în galben brand (culoarea de accent rămâne rezervată pentru acțiuni primare); recap-ul și check-in-ul de dispoziție sunt **mutual exclusive** (niciodată amândouă în aceeași vizită); butonul de rezumat e ascuns pe conversații scurte.

- **Un singur mecanism de sumarizare** (`src/lib/ai/recap.ts`, apel Claude Haiku separat), refolosit în două locuri:
  - **Recap zilnic**, persistat în tabelul nou `daily_recaps` (`recap_date`, `topic`, `summary`, `dismissed_at`) — migrarea `20260916091203_daily_recaps.sql`. Generat leneș: calculat o singură dată, la primul `/chat` al zilei, dacă exista conversație ieri și nu există deja un rând pentru ziua respectivă — nu printr-un job cron. Textul e formulat ca invitație de continuare ("Vrei să continuăm de unde am rămas, despre...?"), nu ca raport ("ai spus X, Y").
  - **Rezumat la cerere** (`summarizeCurrentConversation`), buton nou lângă input, vizibil doar dacă conversația are cel puțin 10 mesaje — sub acest prag n-are ce rezuma. Nu se salvează nicăieri, doar afișat inline, dispare la închidere.
- **Topicuri fixe**: `mood`, `stress`, `advice`, `support`, `altele` — clasificate automat de același apel care generează recap-ul, afișate doar ca etichetă mică lângă recap ("stare · ieri"), niciodată ca alegere manuală a utilizatorului.
- **Mutual exclusivitate în `/chat`**: recap-ul se calculează/arată doar dacă check-in-ul de dispoziție de azi e deja rezolvat — niciodată amândouă cardurile deodată.
- **A treia categorie de cost** adăugată în `ai_usage_events` (`kind = 'recap'`) — migrarea `20260916091840_ai_usage_kind_recap.sql` — respectă și ea plafonul agregat de platformă din secțiunea de mai sus.
- **Bug real găsit și reparat în timpul testării**: `daily_recaps` avea RLS dar nu avea GRANT explicit pentru rolul `authenticated` — exact aceeași clasă de problemă ca "permission denied for table waitlist_signups" de la începutul proiectului (proiectul are "Automatically expose new tables" dezactivat, deci fiecare tabelă nouă accesată de utilizator autentificat are nevoie de propriul GRANT, RLS-ul singur nu ajunge). Migrarea `20260916094512_daily_recaps_grant.sql` o repară; regulă de reținut pentru orice tabelă viitoare accesată prin clientul normal (nu `supabaseAdmin`).
- **Testat live, end-to-end**: cont de test cu mesaje sintetice ieri (despărțire/conflict) + azi (stres la job, 10 mesaje) → după rezolvarea check-in-ului de azi, cardul de recap a apărut corect ("stare · ieri" + rezumat cald, invitațional), dispare corect la "Nu acum" și rămâne dispărut după refresh (confirmat direct în `daily_recaps.dismissed_at`). Butonul de rezumat a generat un rezumat real, corect, al conversației curente. Costul ambelor apeluri a apărut corect în `ai_usage_events` sub `kind = 'recap'`.

### Rămas de făcut (schemă/cod, nu doar discuție)

- [x] Migrare SQL pentru schema de mai sus + politici RLS + grants — `supabase/migrations/20260914154009_initial_schema.sql`, `20260914155102_grants.sql`
- [x] Autentificare (email + parolă) — vezi secțiunea de mai sus
- [x] `conversations` + `messages` conectate real la utilizator — vezi secțiunea de mai sus
- [x] AI răspunde real (Claude Haiku) + detectare de bază pentru criză — vezi secțiunea de mai sus
- [x] Limitare de cost (rafală + cap zilnic per tier) — vezi secțiunea de mai sus
- [x] Pagina de cont (`/account`) + check-in zilnic/luna în header — vezi secțiunile de mai sus
- [x] Job zilnic de ștergere mesaje >30 zile — `pg_cron`, migrarea `20260914175313_message_retention_job.sql`, job `delete-old-messages` rulează zilnic la 03:00 UTC. Testat direct: inserat un mesaj cu dată de acum 35 zile alături de unul recent, rulată comanda exactă din job → doar cel vechi a fost șters, cel recent (+ răspunsul AI) au rămas intacte. Șterge doar `messages`, nu și rândul din `conversations` (promisiunea din Privacy Policy vizează conținutul conversației, nu metadatele)
- [x] Pipeline de extragere/actualizare `memory_entries` — vezi secțiunea de mai jos
- Integrare Stripe (checkout + webhook pentru `subscriptions`)
- Voce reală (GPT-4o-mini Realtime / ElevenLabs) — acum doar text
- [x] Interfața de chat mai avansată: topicuri, recap zilnic, rezumat rapid — vezi secțiunea de mai jos
- [x] Rate-limiting la nivel de IP/dispozitiv, înainte de a avea cont — vezi secțiunea de mai jos
- [x] Cap agregat de cost/tokeni la nivel de platformă — vezi secțiunea de mai sus

## De clarificat cu Daniel înainte de lansare

- Revizuire juridică reală a paginilor legale (sunt scrise responsabil, dar rămân draft până le vede un avocat)
- Vârsta minimă (16, cu consimțământ 16–18) — confirmă dacă e politica dorită sau vrei alta
- Dacă vrei un mod "ludic"/informal pentru utilizatori mai tineri ca opțiune explicită, separat de "Gen Z mode" (care a fost eliminat pentru că contrazicea poziționarea)
- **Data Processing Agreements** cu Supabase, OpenAI și Anthropic — obligatorii înainte de lansare conform checklist-ului GDPR intern (`SPOCOI_GDPR_Infrastructura.pdf`), acțiune legală/administrativă de-a ta, nu ceva ce se codează
- Server rusesc menționat în documentul GDPR din aprilie 2026 (vechiul MVP) — **confirmat de Daniel (14 septembrie 2026) că nu mai e o problemă / nu mai există** — doar consemnat aici ca să rămână un răspuns clar dacă întreabă cineva (ex. MDED)
