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
  return { title: `${t.aiDisclaimerTitle} — spocoi`, description: t.aiDisclaimerMetaDescription };
}

export default async function AiDisclaimerPage({
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
      title={t.aiDisclaimerTitle}
      updated={locale === "en" ? "September 12, 2026" : "12 septembrie 2026"}
    >
      {locale === "en" ? (
        <>
          <h2>What spocoi is</h2>
          <p>
            spocoi is an emotional-support service powered by artificial
            intelligence, available by voice or text. Conversations are
            held with an AI model, not with a real person and not with a
            licensed specialist. spocoi is operated by{" "}
            <strong>Delgra SRL</strong> (Moldova), part of the SPOCOI group
            alongside <strong>SPOCOI OÜ</strong> (Estonia, holding company,
            in the process of registration).
          </p>
          <p>
            spocoi <strong>is not a licensed provider of medical or mental
            health services</strong> and does not offer diagnosis,
            treatment, or psychological or psychiatric counseling. It&apos;s
            meant as a space to talk about what&apos;s weighing on you, not
            as a replacement for therapy.
          </p>

          <h2>Not a substitute for professional care</h2>
          <p>
            If you&apos;re going through a mental health issue, an
            emotional crisis, or need treatment, talk to a licensed
            doctor, psychologist, or psychiatrist. spocoi can complement
            that support, but it cannot replace it.
          </p>

          <h2>Limits of the AI</h2>
          <ul>
            <li>The AI can misread the tone, context, or intent of your messages.</li>
            <li>Responses aren&apos;t always accurate, complete, or appropriate for your situation.</li>
            <li>The AI has no memory or real understanding of your life beyond what you discuss in the conversation.</li>
            <li>Like any AI system, it can occasionally produce unexpected or inappropriate responses.</li>
          </ul>

          <h2>It doesn&apos;t recognize or handle emergencies</h2>
          <p>
            The AI <strong>cannot identify or intervene</strong> in a
            medical emergency, a suicidal crisis, or a situation of
            immediate danger. Don&apos;t rely on spocoi in such a
            situation — see the emergency numbers above and seek real
            help immediately.
          </p>

          <h2>Privacy</h2>
          <p>
            Conversation data is handled according to our{" "}
            <Link href={localizedHref("/legal/privacy", locale)}>Privacy Policy</Link>. We
            recommend avoiding sharing extremely sensitive information in
            conversation that you wouldn&apos;t want us to keep, even
            though we protect data through encryption and access
            controls.
          </p>

          <h2>Your responsibility</h2>
          <p>
            The decisions you make remain your responsibility. spocoi
            offers a supportive space, not binding medical or legal
            instructions. Use your own judgment and, when needed, a human
            specialist for important decisions.
          </p>

          <h2>Reporting and feedback</h2>
          <p>
            If you receive a response that seems dangerous, wrong, or
            inappropriate, please write to us at{" "}
            <a href="mailto:support@spocoi.co">support@spocoi.co</a>. Every
            report helps us improve the service.
          </p>
        </>
      ) : (
        <>
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
            <Link href={localizedHref("/legal/privacy", locale)}>Politicii de confidențialitate</Link>.
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
        </>
      )}
    </LegalPage>
  );
}
