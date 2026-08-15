import Script from "next/script";
import {
  ANALYTICS_DOMAIN,
  ANALYTICS_SRC,
  ANALYTICS_WEBSITE_ID,
  isAnalyticsConfigured,
} from "../lib/analytics/config";

// Loads the self-hosted analytics tracker. Renders nothing at all when the env
// vars are unset, so guest play and local dev are untouched (BUILD_PLAN
// principle 1 — analytics never gates or delays the game).
//
// afterInteractive keeps the tracker off the critical path; the first pageview
// still fires with document.referrer and the landing URL's utm_* intact, which
// is what the traffic-source report is built from.
//
// App Router navigations are pushState, which both Umami and Plausible track
// automatically — no manual route-change hook needed here.
export default function Analytics() {
  if (!isAnalyticsConfigured()) return null;

  return (
    <Script
      src={ANALYTICS_SRC}
      strategy="afterInteractive"
      data-website-id={ANALYTICS_WEBSITE_ID || undefined}
      data-domain={ANALYTICS_DOMAIN || undefined}
    />
  );
}
