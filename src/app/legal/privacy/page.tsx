import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { REGION_HEADER, resolveRegion, type Region } from "@/lib/region";

export const metadata: Metadata = {
  title: "Politica de confidențialitate — spocoi",
  description:
    "Ce date colectăm, cât timp le păstrăm și ce drepturi ai conform GDPR ca utilizator spocoi.",
};

export default async function PrivacyPage() {
  const headersList = await headers();
  const region = (headersList.get(REGION_HEADER) as Region | null) ?? resolveRegion(undefined);

  return (
    <LegalPage
      eyebrow="Document legal"
      region={region}
      title="Politica de confidențialitate"
      updated="12 septembrie 2026"
    >
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
        <Link href="/legal/ai-disclaimer">Despre AI</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Pentru orice întrebare despre confidențialitate, scrie-ne la{" "}
        <a href="mailto:support@spocoi.co">support@spocoi.co</a>.
      </p>
    </LegalPage>
  );
}
