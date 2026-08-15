import {
  ANALYTICS_SITE_ID,
  ANALYTICS_SRC,
  isAnalyticsConfigured,
} from "../lib/analytics/config";

// Traffic Source tracker. Renders nothing when the env vars are unset, so the
// game is untouched without them (BUILD_PLAN principle 1).
//
// Deliberately a plain <script> in the server-rendered HTML rather than
// next/script: t.js reads its own site id and collect endpoint from
// `document.currentScript`, which is only reliable for a parser-inserted
// script. This is exactly the snippet the Traffic Source dashboard documents.
// `defer` keeps it off the critical path — it runs after HTML parsing, so the
// position in <body> behaves the same as the documented <head> placement.
//
// t.js patches history.pushState/replaceState itself, so App Router client
// navigations between team pages are counted without any hook on our side.
export default function Analytics() {
  if (!isAnalyticsConfigured()) return null;

  return <script defer src={ANALYTICS_SRC} data-site={ANALYTICS_SITE_ID} />;
}
