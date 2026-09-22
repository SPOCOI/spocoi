"use client";

import { useEffect } from "react";

/** [locale]/layout.tsx no longer owns <html>, so it can't set `lang` on it
 * directly — this nudges the attribute client-side instead. */
export function SetHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
