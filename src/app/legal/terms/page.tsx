import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { REGION_HEADER, resolveRegion, type Region } from "@/lib/region";

export const metadata: Metadata = {
  title: "Termeni și condiții — spocoi",
  description:
    "Termenii și condițiile de utilizare a spocoi: eligibilitate, cont, abonamente, proprietate intelectuală și limitările serviciului.",
};

export default async function TermsPage() {
  const headersList = await headers();
  const region = (headersList.get(REGION_HEADER) as Region | null) ?? resolveRegion(undefined);

  return (
    <LegalPage
      eyebrow="Document legal"
      region={region}
      title="Termeni și condiții"
      updated="12 septembrie 2026"
    >
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
        pe pagina de <Link href="/pricing">prețuri</Link> — nu le reproducem
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
        vezi <Link href="/legal/ai-disclaimer">Despre AI</Link> pentru
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
    </LegalPage>
  );
}
