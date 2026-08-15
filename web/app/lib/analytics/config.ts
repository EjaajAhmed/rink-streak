// Single guard for whether self-hosted analytics is wired up. Mirrors the
// Supabase guard: when the script URL is missing the whole layer stays dormant
// and the app ships exactly as it did before — no script tag, no requests.
//
// Provider-agnostic on purpose. The two common Railway self-host options tag
// the script differently, so we emit whichever attribute is configured:
//   Umami     -> NEXT_PUBLIC_ANALYTICS_SRC=https://<instance>/script.js
//                NEXT_PUBLIC_ANALYTICS_WEBSITE_ID=<website uuid>
//   Plausible -> NEXT_PUBLIC_ANALYTICS_SRC=https://<instance>/js/script.js
//                NEXT_PUBLIC_ANALYTICS_DOMAIN=didtheyhockey.com
//
// Both are cookieless and record the referrer + utm_* params automatically —
// that is exactly what the traffic-source / top-sources report reads from, so
// no extra per-visit call is needed on our side.

export const ANALYTICS_SRC = process.env.NEXT_PUBLIC_ANALYTICS_SRC ?? "";
export const ANALYTICS_WEBSITE_ID =
  process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID ?? "";
export const ANALYTICS_DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN ?? "";

export function isAnalyticsConfigured(): boolean {
  return ANALYTICS_SRC.length > 0;
}
