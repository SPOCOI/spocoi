import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { REGION_HEADER, resolveRegion, type Region } from "@/lib/region";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, localizedHref, defaultLocale, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).legal;
  return { title: `${t.termsTitle} — spocoi`, description: t.termsMetaDescription };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = getDictionary(locale).legal;

  const headersList = await headers();
  const region = (headersList.get(REGION_HEADER) as Region | null) ?? resolveRegion(undefined);

  return (
    <LegalPage
      region={region}
      locale={locale}
      title={t.termsTitle}
      updated="12 septembrie 2026"
    >
      {locale === "en" ? (
        <>
          <p>
            These terms govern the use of the spocoi service, operated by{" "}
            <strong>Delgra SRL</strong>, a company registered in the
            Republic of Moldova, part of the SPOCOI group alongside{" "}
            <strong>SPOCOI OÜ</strong> (Estonia, holding company, in the
            process of registration). By creating an account or using the
            service, you agree to the terms below.
          </p>

          <h2>Minimum age</h2>
          <p>
            The minimum age to use spocoi is <strong>16</strong>. Users aged
            16 to 18 may use the service only with the consent and
            supervision of a parent or legal guardian. Access is not
            permitted for anyone under 16, under any circumstances.
          </p>

          <h2>Your account</h2>
          <p>
            You are responsible for keeping your login credentials
            confidential and for any activity carried out from your
            account. Notify us immediately at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a> if you
            suspect unauthorized access to your account.
          </p>

          <h2>Subscriptions and payments</h2>
          <p>
            spocoi has a free tier and paid tiers, with pricing adapted by
            region. Current, constantly-updated prices are available on the{" "}
            <Link href={localizedHref("/pricing", locale)}>pricing</Link> page — we don&apos;t
            reproduce them here to avoid outdated information.
          </p>
          <ul>
            <li>
              Payments are processed by a third-party provider,{" "}
              <strong>Stripe</strong>; spocoi does not store your full card
              details.
            </li>
            <li>
              You can request a refund within <strong>14 days</strong> of
              payment, calculated proportionally to the unused portion of
              your subscription.
            </li>
            <li>
              Any price change to an active subscription will be
              communicated to you at least <strong>30 days</strong> before
              it takes effect.
            </li>
            <li>You can cancel your subscription at any time from your account settings.</li>
          </ul>

          <h2>What you need to understand about the service</h2>
          <p>By using spocoi, you confirm and accept that:</p>
          <ul>
            <li>
              spocoi <strong>does not replace</strong> professional
              psychological or psychiatric care.
            </li>
            <li>
              spocoi <strong>is not an emergency service</strong> and
              cannot respond to crisis situations or immediate danger.
            </li>
            <li>
              Conversations are not held with licensed therapists, but
              with an AI system.
            </li>
            <li>We do not guarantee any specific therapeutic or emotional outcome.</li>
            <li>No one monitors your conversations in real time.</li>
          </ul>

          <h2>Prohibited uses</h2>
          <p>You may not use spocoi to:</p>
          <ul>
            <li>Violate applicable law in your jurisdiction.</li>
            <li>Harass, threaten, or abuse other people.</li>
            <li>
              Gain unauthorized access to accounts, systems, or data
              belonging to other users or to spocoi.
            </li>
            <li>
              Scrape, decompile, or reverse-engineer the application or the
              AI models.
            </li>
            <li>Share your login credentials with third parties.</li>
            <li>Build a competing service using spocoi, its content, or its technology.</li>
          </ul>

          <h2>Intellectual property</h2>
          <p>
            The spocoi platform, its technology, design, and associated
            trademarks belong to Delgra SRL / the SPOCOI group. You retain
            the rights to the content you submit in conversations.
          </p>
          <p>
            By using the service, you grant us a license to use the
            content of your conversations to improve the service and for
            internal research. We will not use your conversations for
            marketing or promotional purposes without your explicit,
            separate consent.
          </p>

          <h2>Service limitations</h2>
          <p>
            The AI&apos;s responses can be incomplete, inaccurate, or
            unsuitable — see{" "}
            <Link href={localizedHref("/legal/ai-disclaimer", locale)}>About the AI</Link> for
            details. We do not guarantee uninterrupted operation of the
            service; maintenance downtime or technical issues may occur.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms as the service evolves. We will
            visibly mark the date of the last update on this page, and
            important changes will be communicated to users with an active
            subscription.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Write to us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>.
          </p>
        </>
      ) : (
        <>
          <p>
            Acești termeni guvernează utilizarea serviciului spocoi, operat de{" "}
            <strong>Delgra SRL</strong>, societate înregistrată în Republica
            Moldova, parte din grupul SPOCOI alături de{" "}
            <strong>SPOCOI OÜ</strong> (Estonia, societate holding, în curs de
            înregistrare). Prin crearea unui cont sau utilizarea serviciului, ești
            de acord cu termenii de mai jos.
          </p>

          <h2>Vârsta minimă</h2>
          <p>
            Vârsta minimă pentru a utiliza spocoi este <strong>16 ani</strong>.
            Utilizatorii cu vârsta între 16 și 18 ani pot folosi serviciul doar cu
            acordul și sub supravegherea unui părinte sau tutore legal. Accesul nu
            este permis persoanelor sub 16 ani, în nicio situație.
          </p>

          <h2>Contul tău</h2>
          <p>
            Ești responsabil pentru păstrarea confidențialității datelor de
            autentificare și pentru orice activitate desfășurată din contul tău.
            Anunță-ne imediat la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a> dacă
            suspectezi acces neautorizat la contul tău.
          </p>

          <h2>Abonamente și plăți</h2>
          <p>
            spocoi are un nivel gratuit și niveluri plătite, cu prețuri adaptate
            pe regiune. Prețurile curente, actualizate constant, sunt disponibile
            pe pagina de <Link href={localizedHref("/pricing", locale)}>prețuri</Link> — nu le reproducem
            aici pentru a evita informații învechite.
          </p>
          <ul>
            <li>
              Plățile sunt procesate printr-un furnizor terț, <strong>Stripe</strong>;
              spocoi nu stochează datele complete ale cardului tău.
            </li>
            <li>
              Poți solicita rambursare în termen de <strong>14 zile</strong> de la
              plată, calculată proporțional cu perioada neconsumată din abonament.
            </li>
            <li>
              Orice modificare de preț la un abonament activ îți va fi comunicată
              cu cel puțin <strong>30 de zile</strong> înainte de a intra în
              vigoare.
            </li>
            <li>Poți anula abonamentul oricând din setările contului.</li>
          </ul>

          <h2>Ce trebuie să înțelegi despre serviciu</h2>
          <p>Prin utilizarea spocoi, confirmi și accepți că:</p>
          <ul>
            <li>
              spocoi <strong>nu înlocuiește</strong> îngrijirea psihologică sau
              psihiatrică profesionistă.
            </li>
            <li>
              spocoi <strong>nu este un serviciu de urgență</strong> și nu poate
              răspunde la situații de criză sau pericol imediat.
            </li>
            <li>
              Conversațiile nu sunt purtate cu terapeuți licențiați, ci cu un
              sistem AI.
            </li>
            <li>Nu garantăm niciun rezultat terapeutic sau emoțional anume.</li>
            <li>
              Nicio persoană nu monitorizează conversațiile tale în timp real.
            </li>
          </ul>

          <h2>Utilizări interzise</h2>
          <p>Nu ai voie să folosești spocoi pentru a:</p>
          <ul>
            <li>Încălca legea aplicabilă în jurisdicția ta.</li>
            <li>Hărțui, amenința sau abuza alte persoane.</li>
            <li>
              Obține acces neautorizat la conturi, sisteme sau date ale altor
              utilizatori sau ale spocoi.
            </li>
            <li>
              Extrage date automat (scraping), decompila sau face inginerie
              inversă asupra aplicației sau modelelor AI.
            </li>
            <li>Distribui sau partaja datele tale de autentificare cu terți.</li>
            <li>
              Construi un serviciu concurent folosind spocoi, conținutul sau
              tehnologia sa.
            </li>
          </ul>

          <h2>Proprietate intelectuală</h2>
          <p>
            Platforma spocoi, tehnologia, designul și mărcile asociate aparțin
            Delgra SRL / grupului SPOCOI. Tu păstrezi drepturile asupra
            conținutului pe care îl trimiți în conversații.
          </p>
          <p>
            Prin utilizarea serviciului, ne oferi o licență de a folosi conținutul
            conversațiilor tale pentru îmbunătățirea serviciului și cercetare
            internă. Nu vom folosi conversațiile tale în scopuri de marketing sau
            promovare fără consimțământul tău explicit, separat.
          </p>

          <h2>Limitările serviciului</h2>
          <p>
            Răspunsurile AI-ului pot fi incomplete, inexacte sau nepotrivite —
            vezi <Link href={localizedHref("/legal/ai-disclaimer", locale)}>Despre AI</Link> pentru
            detalii. Nu garantăm funcționarea neîntreruptă a serviciului; pot
            apărea întreruperi de mentenanță sau probleme tehnice.
          </p>

          <h2>Modificări ale acestor termeni</h2>
          <p>
            Putem actualiza acești termeni pe măsură ce serviciul evoluează. Vom
            marca vizibil pe această pagină data ultimei actualizări, iar
            modificările importante vor fi comunicate utilizatorilor cu abonament
            activ.
          </p>

          <h2>Contact</h2>
          <p>
            Întrebări despre acești termeni? Scrie-ne la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>.
          </p>
        </>
      )}
    </LegalPage>
  );
}
