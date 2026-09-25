import "server-only";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://spocoi.com";

export const CAMPAIGN_SUBJECT = "Un psiholog bun e scump. spocoi ascultă oricând.";

export function buildCampaignHtml(unsubscribeToken: string): string {
  const unsubscribeUrl = `${SITE_URL}/dezabonare?token=${unsubscribeToken}`;

  return `<!DOCTYPE html>
<html lang="ro">
  <body style="margin:0;padding:0;background-color:#FAFAFC;font-family:'Poppins',Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
      Un psiholog bun e scump și greu de găsit. spocoi ascultă oricând, fără liste de așteptare.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">

            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:6px;">
                      <div style="width:18px;height:18px;border-radius:50%;background-color:#FFC700;position:relative;overflow:hidden;">
                        <div style="width:14px;height:14px;border-radius:50%;background-color:#ffffff;position:absolute;top:2px;left:6px;"></div>
                      </div>
                    </td>
                    <td>
                      <span style="font-size:20px;font-weight:700;color:#202836;">spocoi</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 0 32px;">
                <h1 style="margin:0;font-size:23px;font-weight:600;color:#202836;line-height:1.35;">
                  Un psiholog bun e scump.<br/>spocoi ascultă oricând.
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 0 32px;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:#4B5563;">
                  Salut, la <strong>spocoi</strong> construim o platformă AI de suport emoțional pentru Moldova, România și diaspora, gândită ca o alternativă accesibilă la terapia tradițională. Îți scriem direct fiindcă adresa ta e într-o listă de contacte a unui alt proiect din echipa noastră, iar credem că asta te poate interesa — dacă nu, te poți dezabona jos, fără resentimente.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 14px 0;vertical-align:top;width:24px;">
                      <span style="font-size:15px;">🕐</span>
                    </td>
                    <td style="padding:0 0 14px 0;">
                      <p style="margin:0;font-size:14px;line-height:1.5;color:#202836;"><strong>Disponibil 24/7</strong> — fără liste de așteptare, fără programare cu săptămâni înainte.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 14px 0;vertical-align:top;width:24px;">
                      <span style="font-size:15px;">🇲🇩</span>
                    </td>
                    <td style="padding:0 0 14px 0;">
                      <p style="margin:0;font-size:14px;line-height:1.5;color:#202836;"><strong>Vorbește românește de la bază</strong> — nu o adaptare de ultim moment dintr-o altă piață.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0;vertical-align:top;width:24px;">
                      <span style="font-size:15px;">🔒</span>
                    </td>
                    <td style="padding:0;">
                      <p style="margin:0;font-size:14px;line-height:1.5;color:#202836;"><strong>Privat</strong> — conversații criptate, date găzduite în UE.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFABF;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;font-size:13px;color:#5C4F00;text-transform:uppercase;letter-spacing:0.04em;">Waitlist deschis</p>
                      <p style="margin:6px 0 0 0;font-size:14px;color:#202836;line-height:1.5;">
                        Primii 100 înscriși primesc statutul <strong>Fondator</strong> — acces prioritar și beneficii la lansare.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 0 32px;" align="center">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:10px;background-color:#FFC700;">
                      <a href="${SITE_URL}/waitlist" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#202836;text-decoration:none;">
                        Rezervă-ți locul pe waitlist →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 0 32px;">
                <p style="margin:0;font-size:14px;color:#4B5563;">— echipa spocoi</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 32px 32px;border-top:1px solid #EEEEF2;margin-top:24px;">
                <p style="margin:20px 0 0 0;font-size:12px;line-height:1.6;color:#9CA3AF;">
                  Primești acest email fiindcă adresa ta apare într-o listă de contacte a unui alt proiect din echipa spocoi. Nu vrei să mai primești noutăți despre spocoi?
                  <a href="${unsubscribeUrl}" style="color:#9CA3AF;text-decoration:underline;">Dezabonează-te aici</a>.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
