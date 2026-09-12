# SPOCOI — context de proiect

SPOCOI e o platformă AI de suport emoțional (conversații voce/text, RO/RU/EN) pentru Moldova, România și diaspora UE — alternativă accesibilă 24/7 la terapie tradițională. Suport emoțional larg e identitatea de bază; detectarea manipulării/relațiilor toxice e o funcționalitate secundară, nu focusul. Public țintă: vârstă medie 38.6 ani → ton matur, autentic. **Explicit NOT Gen Z, NOT superficial.**

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

| Tier | MD | RO | UE | Cost unitar | Sesiuni voce |
|---|---|---|---|---|---|
| FREE | $0 | $0 | $0 | — | — |
| SIMPLU | $2.99 | $4.99 | $6.99 | $0.16 | 1×5min |
| PLUS | $6.99 | $9.99 | $14.99 | $0.88 | 5×5min |
| AVANSAT | $14.99 | $19.99 | $29.99 | $3.99 | 20×5min |

Waitlist pe 3 niveluri: Fondator (primii 100), Pioneer (101–500), Early Adopter (501–1000).

## Tech stack (produs, nu neapărat site-ul de marketing)

GPT-4o-mini Realtime, ElevenLabs (voce), Anthropic API, Supabase (Frankfurt, GDPR), Vercel, Railway — totul găzduit UE, non-negociabil.

## Acest repo

Next.js (App Router) + TypeScript + Tailwind v4. Site de marketing/prezentare construit de la zero (site-ul vechi a fost pierdut din cauza echipei IT anterioare — nu există cod vechi de recuperat, doar documentele de mai sus).

- `src/components/` — Logo, NavBar, Footer și alte componente de brand comune. Reutilizează-le, nu duplica markup.
- Design tokens (culori, fonturi) sunt în `src/app/globals.css` — folosește variabilele, nu hexuri hardcodate.
- Aplicația de chat (auth, sesiuni, integrare AI) e **Faza 2**, neînceput încă — vezi `NEXT_STEPS.md`.
- Poppins e încărcat cu `next/font/google` doar cu subset-urile `latin`/`latin-ext` — versiunea bundle-uită de Next.js nu oferă `cyrillic` ca opțiune tipată. Când se face varianta RU a site-ului, fontul chirilic trebuie încărcat separat (self-hosted woff2 sau `<link>` manual către Google Fonts cu `subset=cyrillic`), nu prin acest hook.

## Stil de lucru Daniel

Lucrează iterativ, sesiuni lungi; apreciază etichetarea nivelului de certitudine; preferă workflow structurat cu urmărire de task-uri; lucrează în principal în română. Corectează direct mischaracterizările — dacă ceva de mai sus pare depășit, corectează direct în acest fișier.
