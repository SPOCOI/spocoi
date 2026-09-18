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
  return { title: `${t.privacyTitle} — spocoi`, description: t.privacyMetaDescription };
}

export default async function PrivacyPage({
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
      title={t.privacyTitle}
      updated={locale === "en" ? "September 12, 2026" : "12 septembrie 2026"}
    >
      {locale === "en" ? (
        <>
          <p>
            This policy describes how <strong>Delgra SRL</strong> (Moldova),
            spocoi&apos;s current operator and part of the SPOCOI group alongside{" "}
            <strong>SPOCOI OÜ</strong> (Estonia, holding company, in the process
            of registration), collects, uses, and protects your data.
          </p>
          <p>
            We follow <strong>GDPR</strong> (General Data Protection
            Regulation) principles. The infrastructure that stores user data
            is hosted within the European Union — the database runs on
            Supabase, in the Frankfurt, Germany region.
          </p>

          <h2>Minimum age</h2>
          <p>
            The minimum age to use spocoi is <strong>16</strong>. Users aged
            16 to 18 may use the service only with the consent and
            supervision of a parent or legal guardian. We do not knowingly
            collect data from anyone under 16.
          </p>

          <h2>What data we collect</h2>
          <ul>
            <li>
              <strong>Account data:</strong> email address, preferred
              language, and an optional display name you can set later in
              account settings.
            </li>
            <li>
              <strong>Conversation logs:</strong> the content of
              conversations with the AI, by voice or text.
            </li>
            <li>
              <strong>Technical and usage data:</strong> device type,
              operating system, approximate IP address, app usage
              statistics.
            </li>
            <li>
              <strong>Payment data:</strong> for users on a paid plan,
              payments are processed by <strong>Stripe</strong>; spocoi does
              not store your full card number.
            </li>
          </ul>

          <h2>Legal basis for processing</h2>
          <p>
            We process account data and conversation content because
            it&apos;s necessary to provide the service you sign up for
            (performance of a contract). Where a conversation reveals
            health-related or other special-category information about
            you, we rely on your <strong>explicit consent</strong>, given
            as a separate, specific checkbox at sign-up — not bundled with
            general acceptance of these terms. You can withdraw that
            consent at any time by turning off personalization in your
            account settings or by deleting your account; withdrawal
            doesn&apos;t affect processing already carried out.
          </p>

          <h2>Pricing adapted to your location</h2>
          <p>
            On the pricing page, we automatically determine your region
            (Moldova, Romania, or the rest of the European Union) from your
            connection&apos;s approximate IP address, so we can show you the
            right price without asking you to choose manually. This check
            happens in real time, on every visit — we don&apos;t build a
            history of your locations for pricing purposes.
          </p>
          <p>
            Automatic detection can occasionally be wrong (for example, if
            you use a VPN or are roaming). If the price shown doesn&apos;t
            match your country, write to us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a> and
            we&apos;ll sort it out manually.
          </p>

          <h2>Cookies and similar technologies</h2>
          <p>
            spocoi does not use advertising or analytics cookies, and
            doesn&apos;t run any third-party tracking scripts. We only set
            two strictly technical cookies, both required for the service
            to function:
          </p>
          <ul>
            <li>
              a <strong>session cookie</strong>, set when you log in, so
              you stay signed in between visits — deleted when you sign
              out or your session expires;
            </li>
            <li>
              an <strong>anonymous device identifier</strong> (a random id,
              not a device fingerprint), kept for up to <strong>1
              year</strong>, used exclusively to prevent abuse of the
              sign-up and waitlist forms (for example, one person creating
              many free accounts in a row). It is never used for
              advertising, analytics, or tracking your activity on the
              service.
            </li>
          </ul>

          <h2>Who else processes your data (sub-processors)</h2>
          <p>We share data with a small number of specialized providers, only to the extent needed to run the service:</p>
          <ul>
            <li>
              <strong>Supabase</strong> (database and authentication),
              hosted in Frankfurt, Germany — within the EU.
            </li>
            <li>
              <strong>Anthropic</strong> (the AI model that powers
              conversations, memory personalization, and daily summaries),
              based in the United States. Sending conversation content to
              Anthropic for processing is what allows the AI to reply to
              you at all. We are formalizing a Data Processing Agreement
              and EU Standard Contractual Clauses with Anthropic to govern
              this transfer; until that is complete, treat this transfer
              as a known, disclosed limitation rather than a settled
              guarantee.
            </li>
            <li>
              <strong>Vercel</strong> (hosting and content delivery).
            </li>
            <li>
              <strong>Stripe</strong> (payment processing, paid tiers
              only) — see below.
            </li>
          </ul>
          <p>
            We do not sell your data, and we do not share it with anyone
            for their own marketing purposes.
          </p>

          <h2>How long we keep data</h2>
          <p>Retention depends on the type of data:</p>
          <ul>
            <li>
              <strong>Conversation messages</strong> (the raw text/voice
              content): kept for <strong>30 days</strong>, then
              automatically and permanently deleted by an automated job.
            </li>
            <li>
              <strong>Daily conversation summaries and mood check-ins:</strong>{" "}
              also kept for <strong>30 days</strong>, then automatically
              deleted.
            </li>
            <li>
              <strong>Personalization memory</strong> (specific facts the
              AI remembers about you, when personalization is turned on):
              kept for as long as your account is active. You can review
              and delete individual memory entries, or turn personalization
              off entirely, at any time from your account settings; doing
              so does not delete entries already extracted unless you
              remove them yourself.
            </li>
            <li>
              <strong>Anti-abuse records</strong> (IP address and the
              anonymous device id described above, tied to sign-up/waitlist
              attempts): kept for <strong>30 days</strong>, then
              automatically deleted.
            </li>
          </ul>
          <p>
            You can request deletion of your data earlier at any time by
            contacting us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>, or by
            deleting your account directly from account settings. Some data
            (for example, billing-related data) may be kept for longer when
            required by law.
          </p>

          <h2>Your rights under GDPR</h2>
          <p>As a user in the European Union or the Republic of Moldova, you have the right to:</p>
          <ul>
            <li>access your personal data;</li>
            <li>correct inaccurate or incomplete data;</li>
            <li>have your data deleted (&quot;the right to be forgotten&quot;);</li>
            <li>receive your data in a structured, portable format;</li>
            <li>object to certain processing of your data, or ask us to restrict it;</li>
            <li>withdraw consent at any time, where we rely on consent;</li>
            <li>
              lodge a complaint with your national data protection
              supervisory authority (in Moldova, the{" "}
              <em>Centrul Național pentru Protecția Datelor cu Caracter
              Personal</em>; in an EU country, your local authority) if you
              believe we&apos;ve mishandled your data.
            </li>
          </ul>
          <p>
            To exercise any of these rights, write to us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>. We
            will respond within <strong>30 days</strong>.
          </p>

          <h2>Security and breach notification</h2>
          <p>
            Data is encrypted both in transit and at rest. Access to
            infrastructure is restricted through role-based access
            controls, available only to the team members who actually need
            it to operate the service. If a personal data breach occurs
            that is likely to affect your rights or freedoms, we will
            notify the relevant supervisory authority within the timeframe
            required by law and inform affected users without undue delay.
          </p>

          <h2>Related to the AI&apos;s limitations</h2>
          <p>
            For details on how conversations relate to the AI and its
            limitations, see the{" "}
            <Link href={localizedHref("/legal/ai-disclaimer", locale)}>About the AI</Link> page.
          </p>

          <h2>Contact</h2>
          <p>
            For any question about privacy, write to us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>.
          </p>
        </>
      ) : (
        <>
          <p>
            Această politică descrie cum <strong>Delgra SRL</strong> (Moldova),
            operatorul curent al spocoi și parte din grupul SPOCOI alături de{" "}
            <strong>SPOCOI OÜ</strong> (Estonia, societate holding, în curs de
            înregistrare), colectează, folosește și protejează datele tale.
          </p>
          <p>
            Ne conformăm principiilor <strong>GDPR</strong> (Regulamentul General
            privind Protecția Datelor). Infrastructura care stochează datele
            utilizatorilor este găzduită în Uniunea Europeană — baza de date
            rulează pe Supabase, în regiunea Frankfurt, Germania.
          </p>

          <h2>Vârsta minimă</h2>
          <p>
            Vârsta minimă pentru a utiliza spocoi este <strong>16 ani</strong>.
            Utilizatorii cu vârsta între 16 și 18 ani pot folosi serviciul doar cu
            acordul și sub supravegherea unui părinte sau tutore legal. Nu
            colectăm cu bună știință date de la persoane sub 16 ani.
          </p>

          <h2>Ce date colectăm</h2>
          <ul>
            <li>
              <strong>Date de cont:</strong> adresă de email, limbă
              preferată și un nume de afișare opțional, pe care îl poți seta
              ulterior din setările contului.
            </li>
            <li>
              <strong>Jurnale de conversație:</strong> conținutul discuțiilor
              purtate cu AI-ul, prin voce sau text.
            </li>
            <li>
              <strong>Date tehnice și de utilizare:</strong> tip de dispozitiv,
              sistem de operare, adresă IP aproximativă, statistici de utilizare a
              aplicației.
            </li>
            <li>
              <strong>Date de plată:</strong> pentru utilizatorii cu abonament
              plătit, plățile sunt procesate de <strong>Stripe</strong>; spocoi nu
              stochează numărul complet al cardului tău.
            </li>
          </ul>

          <h2>Baza legală a prelucrării</h2>
          <p>
            Procesăm datele de cont și conținutul conversațiilor pentru că e
            necesar ca să-ți oferim serviciul la care te înscrii (executarea
            unui contract). Acolo unde o conversație dezvăluie informații
            despre sănătate sau alte categorii speciale de date despre tine,
            ne bazăm pe <strong>consimțământul tău explicit</strong>, dat
            printr-o căsuță separată și specifică la înregistrare — nu
            inclus implicit în acceptarea generală a termenilor. Poți
            retrage acest consimțământ oricând, dezactivând personalizarea
            din setările contului sau ștergându-ți contul; retragerea nu
            afectează prelucrarea deja efectuată.
          </p>

          <h2>Prețuri adaptate locației tale</h2>
          <p>
            Pe pagina de prețuri, determinăm automat regiunea ta (Moldova,
            România sau restul Uniunii Europene) pe baza adresei IP aproximative
            a conexiunii tale, ca să-ți arătăm prețul potrivit fără să te punem
            să alegi manual. Această verificare se face în timp real, la fiecare
            vizită — nu construim un istoric al locațiilor tale în scop de
            preț.
          </p>
          <p>
            Detecția automată se poate înșela ocazional (de exemplu, dacă
            folosești un VPN sau ești în roaming). Dacă prețul afișat nu
            corespunde țării tale, scrie-ne la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a> și
            clarificăm situația manual.
          </p>

          <h2>Cookie-uri și tehnologii similare</h2>
          <p>
            spocoi nu folosește cookie-uri de publicitate sau analytics și nu
            rulează scripturi de tracking de la terți. Setăm doar două
            cookie-uri strict tehnice, ambele necesare funcționării
            serviciului:
          </p>
          <ul>
            <li>
              un <strong>cookie de sesiune</strong>, setat când te
              autentifici, ca să rămâi conectat între vizite — șters când te
              deloghezi sau când sesiunea expiră;
            </li>
            <li>
              un <strong>identificator anonim de dispozitiv</strong> (un id
              aleatoriu, nu o amprentă a dispozitivului), păstrat până la{" "}
              <strong>1 an</strong>, folosit exclusiv pentru a preveni
              abuzul formularelor de înregistrare și waitlist (de exemplu, o
              persoană care creează multe conturi gratuite la rând). Nu e
              folosit niciodată pentru publicitate, analytics sau
              urmărirea activității tale pe serviciu.
            </li>
          </ul>

          <h2>Cine mai procesează datele tale (sub-procesatori)</h2>
          <p>Împărtășim date cu un număr mic de furnizori specializați, doar în măsura necesară pentru a rula serviciul:</p>
          <ul>
            <li>
              <strong>Supabase</strong> (bază de date și autentificare),
              găzduit în Frankfurt, Germania — în UE.
            </li>
            <li>
              <strong>Anthropic</strong> (modelul AI care alimentează
              conversațiile, personalizarea prin memorie și rezumatele
              zilnice), companie din Statele Unite. Trimiterea conținutului
              conversațiilor către Anthropic e ceea ce permite AI-ului să-ți
              răspundă. Suntem în curs de formalizare a unui Acord de
              Prelucrare a Datelor și a Clauzelor Contractuale Standard UE
              cu Anthropic pentru a guverna acest transfer; până la
              finalizare, tratează acest transfer ca o limitare cunoscută
              și disclosată, nu ca o garanție deja stabilită.
            </li>
            <li>
              <strong>Vercel</strong> (găzduire și livrare de conținut).
            </li>
            <li>
              <strong>Stripe</strong> (procesare plăți, doar pentru
              nivelurile plătite) — vezi mai jos.
            </li>
          </ul>
          <p>
            Nu vindem datele tale și nu le împărtășim cu nimeni în scopuri
            proprii de marketing.
          </p>

          <h2>Cât timp păstrăm datele</h2>
          <p>Retenția depinde de tipul de date:</p>
          <ul>
            <li>
              <strong>Mesajele din conversații</strong> (conținutul brut,
              text/voce): păstrate <strong>30 de zile</strong>, apoi șterse
              automat și permanent printr-un job automatizat.
            </li>
            <li>
              <strong>Rezumatele zilnice ale conversațiilor și check-in-urile
              de dispoziție:</strong> păstrate și ele <strong>30 de
              zile</strong>, apoi șterse automat.
            </li>
            <li>
              <strong>Memoria de personalizare</strong> (fapte specifice pe
              care AI-ul le reține despre tine, când personalizarea e
              activă): păstrată cât timp contul tău e activ. Poți vedea și
              șterge intrări individuale de memorie, sau dezactiva complet
              personalizarea, oricând din setările contului; asta nu șterge
              automat intrările deja extrase, decât dacă le ștergi tu
              manual.
            </li>
            <li>
              <strong>Înregistrările anti-abuz</strong> (adresa IP și
              identificatorul anonim de dispozitiv descris mai sus, legate
              de încercări de înregistrare/waitlist): păstrate{" "}
              <strong>30 de zile</strong>, apoi șterse automat.
            </li>
          </ul>
          <p>
            Poți solicita oricând ștergerea datelor tale mai devreme,
            contactându-ne la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>, sau
            ștergându-ți direct contul din setări. Unele date (de exemplu,
            cele legate de facturare) pot fi păstrate o perioadă mai lungă,
            atunci când legea o cere.
          </p>

          <h2>Drepturile tale conform GDPR</h2>
          <p>Ca utilizator din Uniunea Europeană sau din Republica Moldova, ai dreptul:</p>
          <ul>
            <li>de acces la datele tale personale;</li>
            <li>de rectificare a datelor incorecte sau incomplete;</li>
            <li>de ștergere a datelor tale (&bdquo;dreptul de a fi uitat&rdquo;);</li>
            <li>de portabilitate a datelor, într-un format structurat;</li>
            <li>de opoziție față de anumite prelucrări ale datelor tale, sau de a cere restricționarea lor;</li>
            <li>de a-ți retrage consimțământul oricând, acolo unde ne bazăm pe el;</li>
            <li>
              de a depune o plângere la autoritatea națională de
              supraveghere a protecției datelor (în Moldova,{" "}
              <em>Centrul Național pentru Protecția Datelor cu Caracter
              Personal</em>; într-o țară UE, autoritatea locală), dacă
              consideri că ți-am gestionat greșit datele.
            </li>
          </ul>
          <p>
            Pentru a-ți exercita oricare dintre aceste drepturi, scrie-ne la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>. Vom
            răspunde în <strong>30 de zile</strong>.
          </p>

          <h2>Securitate și notificarea breșelor</h2>
          <p>
            Datele sunt criptate atât în tranzit, cât și în repaus. Accesul la
            infrastructură este limitat prin controale de acces bazate pe rol,
            disponibile doar echipei care are nevoie efectivă de acces pentru a
            opera serviciul. Dacă are loc o breșă de date personale care poate
            afecta drepturile sau libertățile tale, vom notifica autoritatea
            de supraveghere competentă în termenul cerut de lege și îi vom
            informa pe utilizatorii afectați fără întârzieri nejustificate.
          </p>

          <h2>Legătura cu limitele AI-ului</h2>
          <p>
            Pentru detalii despre cum sunt folosite conversațiile în raport cu
            AI-ul și limitele acestuia, vezi pagina{" "}
            <Link href={localizedHref("/legal/ai-disclaimer", locale)}>Despre AI</Link>.
          </p>

          <h2>Contact</h2>
          <p>
            Pentru orice întrebare despre confidențialitate, scrie-ne la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>.
          </p>
        </>
      )}
    </LegalPage>
  );
}
