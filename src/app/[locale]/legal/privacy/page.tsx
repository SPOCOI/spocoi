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
      updated="12 septembrie 2026"
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
              <strong>Account data:</strong> name, email address, preferred
              language, and other information provided at sign-up.
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

          <h2>Pricing adapted to your location</h2>
          <p>
            On the pricing page, we automatically determine your region
            (Moldova, Romania, or the rest of the European Union) from your
            connection&apos;s approximate IP address, so we can show you the
            right price without asking you to choose manually. This check
            happens in real time, on every visit — we don&apos;t build a
            history of your locations, and we don&apos;t use this
            information for anything other than setting the displayed
            price.
          </p>
          <p>
            Automatic detection can occasionally be wrong (for example, if
            you use a VPN or are roaming). If the price shown doesn&apos;t
            match your country, write to us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a> and
            we&apos;ll sort it out manually.
          </p>

          <h2>How long we keep data</h2>
          <p>
            Conversation logs are kept by default for <strong>30 days</strong>,
            after which they are automatically deleted. You can request
            deletion of your data earlier at any time by contacting us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>. Some
            data (for example, billing-related data) may be kept for longer
            when required by law.
          </p>

          <h2>Your rights under GDPR</h2>
          <p>As a user in the European Union or the Republic of Moldova, you have the right to:</p>
          <ul>
            <li>access your personal data;</li>
            <li>correct inaccurate or incomplete data;</li>
            <li>have your data deleted (&quot;the right to be forgotten&quot;);</li>
            <li>receive your data in a structured, portable format;</li>
            <li>object to certain processing of your data.</li>
          </ul>
          <p>
            To exercise any of these rights, write to us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>. We
            will respond to your request within a reasonable timeframe.
          </p>

          <h2>Security</h2>
          <p>
            Data is encrypted both in transit and at rest. Access to
            infrastructure is restricted through role-based access
            controls, available only to the team members who actually need
            it to operate the service.
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
              <strong>Date de cont:</strong> nume, adresă de email, limbă
              preferată și alte informații furnizate la înregistrare.
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

          <h2>Prețuri adaptate locației tale</h2>
          <p>
            Pe pagina de prețuri, determinăm automat regiunea ta (Moldova,
            România sau restul Uniunii Europene) pe baza adresei IP aproximative
            a conexiunii tale, ca să-ți arătăm prețul potrivit fără să te punem
            să alegi manual. Această verificare se face în timp real, la fiecare
            vizită — nu construim un istoric al locațiilor tale și nu folosim
            această informație în alt scop decât stabilirea prețului afișat.
          </p>
          <p>
            Detecția automată se poate înșela ocazional (de exemplu, dacă
            folosești un VPN sau ești în roaming). Dacă prețul afișat nu
            corespunde țării tale, scrie-ne la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a> și
            clarificăm situația manual.
          </p>

          <h2>Cât timp păstrăm datele</h2>
          <p>
            Jurnalele de conversație sunt păstrate implicit timp de{" "}
            <strong>30 de zile</strong>, după care sunt șterse automat. Poți
            solicita oricând ștergerea datelor tale mai devreme, contactându-ne la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>. Unele date
            (de exemplu, cele legate de facturare) pot fi păstrate o perioadă mai
            lungă, atunci când legea o cere.
          </p>

          <h2>Drepturile tale conform GDPR</h2>
          <p>Ca utilizator din Uniunea Europeană sau din Republica Moldova, ai dreptul:</p>
          <ul>
            <li>de acces la datele tale personale;</li>
            <li>de rectificare a datelor incorecte sau incomplete;</li>
            <li>de ștergere a datelor tale (&bdquo;dreptul de a fi uitat&rdquo;);</li>
            <li>de portabilitate a datelor, într-un format structurat;</li>
            <li>de opoziție față de anumite prelucrări ale datelor tale.</li>
          </ul>
          <p>
            Pentru a-ți exercita oricare dintre aceste drepturi, scrie-ne la{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>. Vom răspunde
            cererii tale într-un termen rezonabil.
          </p>

          <h2>Securitate</h2>
          <p>
            Datele sunt criptate atât în tranzit, cât și în repaus. Accesul la
            infrastructură este limitat prin controale de acces bazate pe rol,
            disponibile doar echipei care are nevoie efectivă de acces pentru a
            opera serviciul.
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
