// Single guard for whether the Traffic Source tracker is wired up. Mirrors the
// Supabase guard: when either value is missing the layer stays dormant and no
// script tag is emitted, so local dev and the guest build are unchanged.
//
// Both values are client-side by nature (they end up in the page HTML) — the
// site id is not a secret. Set them on the SITE service in Railway:
//   NEXT_PUBLIC_ANALYTICS_SRC     = https://<instance>.up.railway.app/t.js
//   NEXT_PUBLIC_ANALYTICS_SITE_ID = 1
//
// The tracker reads its own config off the script tag via
// `document.currentScript` and derives its collect endpoint from `src` by
// swapping /t.js for /api/collect — so the src must be the full public URL of
// the tracker, not a relative path.

export const ANALYTICS_SRC = process.env.NEXT_PUBLIC_ANALYTICS_SRC ?? "";
export const ANALYTICS_SITE_ID = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID ?? "";

export function isAnalyticsConfigured(): boolean {
  return ANALYTICS_SRC.length > 0 && ANALYTICS_SITE_ID.length > 0;
}
