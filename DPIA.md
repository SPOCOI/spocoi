# DPIA — Evaluarea impactului asupra protecției datelor (spocoi)

**Status: DRAFT — pregătit tehnic, în așteptarea verificării/semnării juridice.** Acest document nu înlocuiește consultanța unui avocat sau DPO. Secțiunile 1-4 sunt fapte verificate direct din cod (audit tehnic, 18 septembrie 2026); secțiunea 5 (concluzia) trebuie completată și semnată de operator după revizuire juridică.

**Operator:** Delgra SRL (Moldova), parte din grupul SPOCOI alături de SPOCOI OÜ (Estonia, în curs de înregistrare).
**Data acestei versiuni:** 18 septembrie 2026.
**Autor:** Draft tehnic asistat, pe baza auditului codebase-ului spocoi.

---

## 1. Descrierea prelucrării

### 1.1 Ce este spocoi

Platformă de suport emoțional prin conversații AI (text, viitor și voce), pentru adulți din Moldova, România și diaspora UE. Nu e serviciu medical licențiat.

### 1.2 Categorii de date procesate

| Categorie | Exemple concrete | Tabel/sursă |
|---|---|---|
| Date de cont | email, limbă preferată, nume de afișare opțional | `profiles` |
| **Date de categorie specială (Art. 9)** | conținutul conversațiilor (text brut), memorie extrasă (inclusiv categoria explicită `sanatate`), rezumate zilnice cu topic `mood`/`stress`, check-in-uri de dispoziție | `messages`, `memory_entries`, `daily_recaps`, `mood_checkins` |
| Date tehnice/anti-abuz | adresă IP, identificator anonim de dispozitiv (cookie 1 an) | `rate_limit_events` |
| Date de facturare (viitor, neactivat încă) | date card via Stripe (spocoi nu stochează cardul complet) | `subscriptions` |
| Dovadă de consimțământ | tip consimțământ, versiune politică, dată | `consents` |

### 1.3 Fluxul datelor (cine primește ce)

1. Utilizatorul scrie un mesaj → salvat în `messages` (Supabase, Frankfurt, UE).
2. Ultimele ~20 mesaje + memoria persistentă (dacă personalizarea e activă) → trimise la **Anthropic** (SUA) pentru generarea răspunsului AI.
3. Periodic (după minim 6 mesaje noi), transcriptul → trimis din nou la Anthropic pentru **extragerea de memorie** (fapte durabile, inclusiv de sănătate).
4. O dată pe zi, mesajele zilei → trimise la Anthropic pentru **rezumat zilnic** (recap).
5. Nimic din conversații nu ajunge la Vercel (doar găzduire) sau la vreun serviciu de analytics/tracking (niciunul nu există în produs).

### 1.4 Retenție (implementată tehnic, 18 septembrie 2026)

| Tip de date | Retenție | Mecanism |
|---|---|---|
| Mesaje brute | 30 zile | job `pg_cron` automat |
| Rezumate zilnice (`daily_recaps`) | 30 zile | job `pg_cron` automat (adăugat 18 sept 2026) |
| Check-in-uri de dispoziție | 30 zile | job `pg_cron` automat (adăugat 18 sept 2026) |
| Înregistrări anti-abuz (IP/device) | 30 zile | job `pg_cron` automat (adăugat 18 sept 2026) |
| Memorie de personalizare | cât timp contul e activ | ștergere manuală (utilizator) sau la ștergerea contului |
| Dovadă de consimțământ | cât timp contul e activ | fără expirare (necesară ca probă) |

### 1.5 Bază legală

- **Executarea contractului** (Art. 6(1)(b)) — pentru a oferi serviciul la care utilizatorul se înscrie.
- **Consimțământ explicit** (Art. 9(2)(a)) — pentru procesarea datelor de categorie specială dezvăluite în conversații. Captat separat de acceptarea termenilor generali, printr-un checkbox dedicat la înregistrare, înregistrat auditabil în tabelul `consents` (implementat 18 septembrie 2026).

---

## 2. Necesitate și proporționalitate

| Prelucrare | De ce e necesară | Alternativă mai puțin invazivă luată în calcul |
|---|---|---|
| Trimiterea conversației la Anthropic | Fără asta, AI-ul nu poate răspunde deloc — e chiar funcția de bază a produsului | Rulare a unui model propriu, on-premise — respins ca nefezabil financiar/tehnic la acest stadiu |
| Memorie persistentă (`memory_entries`) | Evită repetarea acaeleiași informații de către utilizator la fiecare conversație — funcție explicit opțională (`personalization_enabled`, dezactivată implicit) | Fără memorie deloc — opțiune păstrată: utilizatorul poate lăsa oprit |
| Rezumate zilnice | Ajută utilizatorul să vadă un fir al propriei stări în timp | Nu se persistă în afara ferestrei de 30 zile (aliniat cu mesajele) |
| Reținerea IP/device 30 zile | Prevenirea abuzului formularelor (creare masivă de conturi gratuite) | Redus de la "nedefinit" la 30 zile în urma acestui audit; alternativa (ștergere imediată) ar face rate-limiting-ul inutil |

---

## 3. Riscuri identificate

| # | Risc | Probabilitate | Impact | Nivel |
|---|---|---|---|---|
| R1 | Breșă de securitate expune conversații cu conținut de sănătate mintală | Scăzută (infra Supabase, RLS, criptare) | Foarte mare | **Ridicat** |
| R2 | Anthropic (procesator din SUA) nu are DPA/SCC semnat — transfer internațional nereglementat formal | Certă (situație curentă) | Mare (neconformitate GDPR directă) | **Ridicat** |
| R3 | Memoria de personalizare reține fapte de sănătate mai mult decât utilizatorul își imaginează | Medie (utilizatorul poate uita că a activat funcția) | Medie | Mediu |
| R4 | Minori sub 16 ani accesează serviciul (fără verificare tehnică a vârstei) | Medie | Mare (protecție minori) | **Ridicat** |
| R5 | Utilizatorul dezvăluie o criză reală, iar detectarea pe cuvinte-cheie ratează situația | Scăzută-medie | Foarte mare (siguranța persoanei) | **Ridicat** (risc de siguranță, nu doar GDPR) |
| R6 | Reidentificarea unui utilizator din rezumate/memorie în caz de breșă parțială | Scăzută | Mare | Mediu |

---

## 4. Măsuri de atenuare

### Deja implementate (18 septembrie 2026)
- Consimțământ explicit, separat, pentru date de categorie specială — checkbox dedicat la înregistrare, înregistrat în `consents` (atenuează R2 parțial, R3).
- Retenție automată de 30 zile pentru mesaje, recap-uri, mood check-ins, date anti-abuz (atenuează R1, R6).
- RLS (Row Level Security) pe toate tabelele cu date personale — un utilizator nu poate accesa datele altuia.
- Criptare in transit și at rest (Supabase).
- Utilizatorul poate vedea, șterge individual, sau dezactiva complet memoria de personalizare din setările contului.
- Ștergerea contului șterge în cascadă toate datele asociate.
- Detectare de bază pe cuvinte-cheie pentru semnale de criză, cu redirecționare către resurse reale de urgență (atenuează parțial R5 — rămâne un mecanism aproximativ, disclosat ca atare în AI Disclaimer).
- Privacy Policy actualizată: numește Anthropic ca sub-procesator, disclosă cookie-urile, drept de a depune plângere la autoritatea de supraveghere, termen de răspuns de 30 zile pentru cereri.

### Rămase de făcut (acțiuni de business/juridice, nu de cod)
- **R2 — critic**: semnarea efectivă a unui Data Processing Agreement + Clauze Contractuale Standard UE cu Anthropic (și cu Supabase, deja parțial acoperit prin găzduirea UE, dar DPA-ul trebuie confirmat explicit în scris).
- **R4**: decizie de business — fie verificare de vârstă mai robustă (ex. dată de naștere + validare), fie acceptarea riscului rezidual cu auto-declarație (decizie care trebuie documentată explicit aici, cu motivare).
- **R5**: decizie dacă e nevoie de un mecanism suplimentar (ex. escaladare către un om, parteneriat cu o linie de criză locală) — menționat ca gol în `NEXT_STEPS.md` ("Nu avem încă o linie de sprijin emoțional verificată pentru Moldova").
- Revizuire juridică finală a acestui document și a paginilor legale (Privacy Policy/Terms/AI Disclaimer sunt marcate explicit "draft, pending legal review").

---

## 5. Concluzie (de completat de operator/jurist)

- [ ] Riscurile reziduale (după măsurile de mai sus) sunt acceptabile pentru lansare?
- [ ] Este necesară consultarea prealabilă a autorității de supraveghere (Art. 36 GDPR), în cazul în care riscul rezidual rămâne ridicat?
- [ ] Semnătură operator: ___________________ Dată: ___________

---

*Acest document trebuie revizuit din nou la orice schimbare semnificativă a prelucrării (ex. adăugarea vocii/ElevenLabs, activarea Stripe, adăugarea unui nou model AI).*
