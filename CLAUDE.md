# SPOCOI — context de proiect

SPOCOI e o platformă AI de suport emoțional (conversații voce/text) pentru Moldova, România și diaspora UE — alternativă accesibilă 24/7 la terapie tradițională. Suport emoțional larg e identitatea de bază; detectarea manipulării/relațiilor toxice e o funcționalitate secundară, nu focusul. Public țintă: vârstă medie 38.6 ani → ton matur, autentic. **Explicit NOT Gen Z, NOT superficial.**

## Limbi — decizie 12 septembrie 2026, folosește ASTA, nu planul vechi RO/RU/EN

Live acum: **română + engleză**. **Rusa a fost exclusă explicit** (decizie Daniel) — nu o reintroduce în copy, chiar dacă apare în materiale vechi/memorie ca parte din planul original RO/RU/EN. Candidați pentru extindere ulterioară, doar ca plan, neconstruit încă: **franceză și spaniolă** ("probabil", nu confirmat ferm). Poloneză și italiană au fost discutate și lăsate deoparte.

Proces de traducere, dacă/când se construiește o limbă nouă: Claude generează traducerea ca punct de plecare, dar **un vorbitor nativ verifică tonul înainte de publicare** — mai ales pentru un produs de suport emoțional, unde tonul contează la fel de mult ca acuratețea gramaticală. Nu publica traduceri automate neverificate.

Fondator & CEO: Daniel Graur. Lead developer/CTO: Nicolae.

## Entitate legală — folosește ASTA, nu alta

Structură reală: **SPOCOI OÜ** (Estonia, holding, în curs de înregistrare) + **Delgra SRL** (Moldova, operator curent). Site-ul vechi (pierdut) avea pagini legale care spuneau greșit "Spocoi Inc., a Delaware C Corporation" — **nu folosi asta niciodată**. Până se finalizează OÜ-ul, entitatea operațională e Delgra SRL.

## Reguli de conținut / ce NU includem fără confirmare explicită

- **Fără toggle "Gen Z mode"** — contrazice poziționarea oficială (vârstă medie 38.6, ton matur). A existat în prototipul vechi, dar nu-l reintroducem fără OK explicit de la Daniel.
- **Fără "Adult mode (18+)" ca feature de plan** — neclar ce înseamnă pentru un produs de suport emoțional, nu-l reintroducem fără clarificare de produs.
- **Vârsta minimă**: prototipul vechi avea 13 ani în Terms și 18 ani în Privacy Policy — contradicție nerezolvată. Pân-atunci, paginile legale noi tratează asta ca **draft, pending legal review**, cu o mențiune vizibilă în acest sens — nu prezenta text legal ca fiind final/gata de lansare.
- **Prețuri**: folosește modelul curent geo-adaptiv (vezi tabelul de mai jos), NU prețurile vechi din prototipul bolt.new (€0/€2.50/€5/€7 flat, fără adaptare geografică) — acelea sunt perimate.

## Identitate de brand (din brandbook-ul real, 28 pagini)

- **Logo**: lună crescentă galbenă + wordmark "spocoi" (minusculă, bold). Variantă secundară: crescenta înlocuiește "o"-ul din "spocoi".
- **Font**: Poppins — singurul typeface din brand, folosit la toate weight-urile (Light/Regular/SemiBold). Suportă chirilică + latină.
- **Culori**: primar `#FFC700` (galben), secundar `#FDE882`, terțiar `#FFFABF`, ink navy `#202836` (light theme) / aproape-alb `#FAFAFC` (dark theme).
- Brandbook-ul complet: `~/Downloads/Telegram Desktop/spocoi brandbook 1.pdf` (doar imagini, fără text extractibil).

## Model de venituri (curent, documentat — folosește acesta)

Freemium, geo-adaptiv (Moldova / România / UE):

| Tier | MD | RO | UE | Cost unitar | Marja (MD/RO/UE) | Sesiuni voce |
|---|---|---|---|---|---|---|
| FREE | $0 | $0 | $0 | $0.02 | — (nu generează venit) | — |
| SIMPLU | $2.99 | $4.99 | $6.99 | ~$0.16–0.30* | 90–95% | 1×5min |
| PLUS | $6.99 | $9.99 | $14.99 | ~$0.88–1.00* | 86–93% | 5×5min |
| AVANSAT | $17.99 | $24.99 | $34.99 | **$6.48** (nu $3.99 — cifră veche, corectată 14 septembrie 2026) | 64.0% / 74.1% / 81.5% | 20×5min |

*Costurile SIMPLU/PLUS au un interval pentru că includ standardizarea de model de mai jos (14 septembrie 2026) — nu mai sunt calculate pe mixul vechi de providere.

**De reținut**: costul unitar e dominat de minutele de voce (80–95% din cost pe fiecare tier plătit), nu de modelul de text folosit — verificat cu prețuri reale de API în septembrie 2026 (GPT-4o-mini $0.15/$0.60 per 1M token, Claude Haiku 4.5 $1/$5, ElevenLabs Flash ~$0.05/min).

**Preț AVANSAT majorat 22 septembrie 2026** (de la $14.99/$19.99/$29.99 la $17.99/$24.99/$34.99) — decizie bazată pe benchmarking competitori, verificare de affordability pe venit mediu MD/RO/UE și îmbunătățirea marjei (56.8%→64.0% MD). Testat acum fiindcă sunt aproape zero abonați AVANSAT existenți de perturbat; reversibil oricând (Stripe Price nou, fără impact pentru abonații deja existenți). Price ID-urile Stripe pentru toate 3 tier-uri (SIMPLU/PLUS/AVANSAT × MD/RO/UE) au fost recreate în contul de test `spocoi sandbox`, care nu avea niciun produs configurat anterior.

Waitlist pe 3 niveluri: Fondator (primii 100), Pioneer (101–500), Early Adopter (501–1000). Peste poziția 1000, înscrierile rămân deschise, doar fără etichetă de tier (decizie 14 septembrie 2026).

## Tech stack (produs, nu neapărat site-ul de marketing)

Infrastructură: Supabase (Frankfurt, GDPR), Vercel, Railway — totul găzduit UE, non-negociabil.

AI — decizie de rutare (14 septembrie 2026): tier-ul **FREE** rămâne pe GPT-4o-mini (text) — cel mai ieftin, relevant la scară mare de utilizatori care nu generează venit. Tier-urile **plătite (SIMPLU/PLUS/AVANSAT) sunt standardizate pe un singur model de text (Claude Haiku)**, ca personalitatea/tonul AI-ului să fie consistent pentru orice utilizator plătitor — planul vechi de rutare pe două providere diferite (OpenAI pe SIMPLU, mix Anthropic pe PLUS/AVANSAT) a fost abandonat după calcul: economisea nesemnificativ, dat fiind că vocea domină costul, nu textul. Voce: GPT-4o-mini Realtime (SIMPLU/PLUS), ElevenLabs Flash (AVANSAT).

## Acest repo

Next.js (App Router) + TypeScript + Tailwind v4. Site de marketing/prezentare construit de la zero (site-ul vechi a fost pierdut din cauza echipei IT anterioare — nu există cod vechi de recuperat, doar documentele de mai sus).

- `src/components/` — Logo, NavBar, Footer și alte componente de brand comune. Reutilizează-le, nu duplica markup.
- Design tokens (culori, fonturi) sunt în `src/app/globals.css` — folosește variabilele, nu hexuri hardcodate.
- Aplicația de chat (auth, sesiuni, integrare AI) e **Faza 2**, neînceput încă — vezi `NEXT_STEPS.md`.

## Stil de lucru Daniel

Lucrează iterativ, sesiuni lungi; apreciază etichetarea nivelului de certitudine; preferă workflow structurat cu urmărire de task-uri; lucrează în principal în română. Corectează direct mischaracterizările — dacă ceva de mai sus pare depășit, corectează direct în acest fișier.
