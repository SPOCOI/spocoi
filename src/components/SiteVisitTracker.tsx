"use client";

import { useEffect } from "react";

/** Fires once per page load — no cookies, no client-side id. See /api/track. */
export function SiteVisitTracker() {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {
      // Best-effort — a dropped pageview count is never worth surfacing to the visitor.
    });
  }, []);

  return null;
}
