import "server-only";
import { getResend } from "@/lib/resend";
import type { Locale } from "@/i18n/config";

export type WaitlistTier = "founder" | "pioneer" | "early_adopter" | null;

export function tierForPosition(position: number): WaitlistTier {
  if (position <= 100) return "founder";
  if (position <= 500) return "pioneer";
  if (position <= 1000) return "early_adopter";
  return null;
}

const FROM_ADDRESS = process.env.WAITLIST_FROM_EMAIL ?? "spocoi <hello@spocoi.com>";

const TIER_LABEL: Record<Exclude<WaitlistTier, null>, Record<Locale, string>> = {
  founder: { ro: "Fondator", en: "Founder" },
  pioneer: { ro: "Pioneer", en: "Pioneer" },
  early_adopter: { ro: "Early Adopter", en: "Early Adopter" },
};

function buildSubject(locale: Locale): string {
  return locale === "en" ? "You're on the spocoi waitlist" : "Ești pe waitlist-ul spocoi";
}

function buildHtml(locale: Locale, position: number, tier: WaitlistTier): string {
  const tierLabel = tier ? TIER_LABEL[tier][locale] : null;

  const heading =
    locale === "en" ? "You're on the list." : "Ești pe listă.";
  const intro =
    locale === "en"
      ? "Thanks for signing up for spocoi. We'll email you as soon as it's your turn to get access."
      : "Mulțumim că te-ai înscris pe waitlist-ul spocoi. Te anunțăm prin email imediat ce e rândul tău să primești acces.";
  const positionLabel = locale === "en" ? "Your position" : "Poziția ta";
  const tierIntro =
    locale === "en"
      ? `You're in as part of the <strong>${tierLabel}</strong> group.`
      : `Faci parte din grupul <strong>${tierLabel}</strong>.`;
  const signature = locale === "en" ? "— the spocoi team" : "— echipa spocoi";

  return `<!DOCTYPE html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background-color:#FAFAFC;font-family:'Poppins',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <span style="font-size:20px;font-weight:700;color:#202836;">spocoi</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;">
                <h1 style="margin:0;font-size:22px;font-weight:600;color:#202836;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 0 32px;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFABF;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;font-size:13px;color:#5C4F00;text-transform:uppercase;letter-spacing:0.04em;">${positionLabel}</p>
                      <p style="margin:4px 0 0 0;font-size:28px;font-weight:700;color:#202836;">#${position}</p>
                      ${
                        tierLabel
                          ? `<p style="margin:8px 0 0 0;font-size:14px;color:#202836;">${tierIntro}</p>`
                          : ""
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <p style="margin:0;font-size:14px;color:#4B5563;">${signature}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendWaitlistConfirmationEmail(
  email: string,
  locale: Locale,
  position: number,
): Promise<void> {
  const tier = tierForPosition(position);
  await getResend().emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: buildSubject(locale),
    html: buildHtml(locale, position, tier),
  });
}
