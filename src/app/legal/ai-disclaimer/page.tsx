import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Despre AI — spocoi",
  description:
    "Ce este și ce nu este spocoi: natura serviciului, limitele conversației cu AI-ul și cum raportezi o problemă.",
};

export default function AiDisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Document legal"
      title="Despre AI — limite și natura serviciului"
      updated="12 septembrie 2026"
    >
      <h2>Ce este spocoi</h2>
      <p>
        spocoi este un serviciu de suport emoțional bazat pe inteligență
        artificială, disponibil prin voce sau text. Conversațiile sunt purtate
        cu un model AI, nu cu o persoană reală și nu cu un specialist licențiat.
        spocoi este operat de <strong>Delgra SRL</strong> (Moldova), parte din
        grupul SPOCOI alături de <strong>SPOCOI OÜ</strong> (Estonia, societate
        holding, în curs de înregistrare).
      </p>
      <p>
        spocoi <strong>nu este un furnizor licențiat de servicii medicale sau
        de sănătate mintală</strong> și nu oferă diagnostic, tratament sau
        consiliere psihologică sau psihiatrică. Este gândit ca un spațiu în
        care poți vorbi despre ce te apasă, nu ca un înlocuitor pentru terapie.
      </p>

      <h2>Nu este un substitut pentru îngrijire profesionistă</h2>
      <p>
        Dacă treci printr-o problemă de sănătate mintală, o criză emoțională
        sau ai nevoie de tratament, discută cu un medic, psiholog sau
        psihiatru licențiat. spocoi poate completa acest sprijin, dar nu îl
        poate înlocui.
      </p>

      <h2>Limitele AI-ului</h2>
      <ul>
        <li>
          AI-ul poate interpreta greșit tonul, contextul sau intenția din
          mesajele tale.
        </li>
        <li>
          Răspunsurile nu sunt întotdeauna corecte, complete sau potrivite
          pentru situația ta.
        </li>
        <li>
          AI-ul nu are memorie sau înțelegere reală a vieții tale dincolo de ce
          discuți în conversație.
        </li>
        <li>
          Ca orice sistem AI, poate genera ocazional răspunsuri neașteptate
          sau nepotrivite.
        </li>
      </ul>

      <h2>Nu recunoaște și nu gestionează urgențe</h2>
      <p>
        AI-ul <strong>nu poate identifica și nu poate interveni</strong>{" "}
        într-o urgență medicală, un episod de criză suicidară sau o situație
        de pericol imediat. Nu te baza pe spocoi într-o astfel de situație —
        vezi secțiunea de mai sus cu numerele de urgență și caută ajutor real
        imediat.
      </p>

      <h2>Confidențialitate</h2>
      <p>
        Datele din conversații sunt tratate conform{" "}
        <Link href="/legal/privacy">Politicii de confidențialitate</Link>.
        Recomandăm să eviți să incluzi în conversație informații extrem de
        sensibile pe care nu ai vrea să le păstrăm, chiar dacă protejăm datele
        prin criptare și controale de acces.
      </p>

      <h2>Responsabilitatea ta</h2>
      <p>
        Deciziile pe care le iei rămân responsabilitatea ta. spocoi oferă un
        spațiu de sprijin, nu instrucțiuni medicale sau legale obligatorii.
        Folosește judecata proprie și, la nevoie, un specialist uman pentru
        decizii importante.
      </p>

      <h2>Raportare și feedback</h2>
      <p>
        Dacă primești un răspuns care ți se pare periculos, greșit sau
        nepotrivit, te rugăm să ne scrii la{" "}
        <a href="mailto:support@spocoi.co">support@spocoi.co</a>. Fiecare
        raportare ne ajută să îmbunătățim serviciul.
      </p>
    </LegalPage>
  );
}
