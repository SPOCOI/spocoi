import { ImageResponse } from "next/og";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "ro";
  const t = getDictionary(locale).home;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#202836",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "#FFC700",
              position: "relative",
              display: "flex",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: "#202836",
                position: "absolute",
                top: 7,
                left: 20,
                display: "flex",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#FAFAFC" }}>
            spocoi
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 600,
            color: "#FAFAFC",
            lineHeight: 1.25,
            maxWidth: 950,
          }}
        >
          {t.metaTitle}
        </div>
      </div>
    ),
    { ...size },
  );
}
