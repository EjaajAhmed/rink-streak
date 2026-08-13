import { NextResponse } from "next/server";
import { getServerSupabase } from "../../lib/supabase/server";

// The public origin of the request. Behind a proxy (Railway) request.url is the
// internal address (e.g. http://localhost:8080), so we must use the forwarded
// host/proto headers — otherwise we'd redirect the browser to localhost.
function siteOrigin(request: Request): string {
  const h = request.headers;
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? new URL(request.url).host;
  return `${proto}://${host}`;
}

// OAuth / magic-link redirect target. Exchanges the `code` for a session, then
// sends the user back where they started (?next=). On any auth error (expired
// link, consumed OTP, failed exchange) it routes to a friendly /auth/error page
// instead of dumping the raw Supabase error string in the address bar.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = siteOrigin(request);
  const code = url.searchParams.get("code");
  const errorCode =
    url.searchParams.get("error_code") || url.searchParams.get("error");
  const rawNext = url.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") ? rawNext : "/"; // same-origin path only

  const errorTo = (reason: string) =>
    NextResponse.redirect(
      new URL(`/auth/error?reason=${encodeURIComponent(reason)}`, origin),
    );

  if (errorCode) return errorTo(errorCode);

  if (code) {
    const supabase = getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return errorTo("exchange_failed");
    }
    return NextResponse.redirect(new URL(next, origin));
  }

  // Nothing to do (no code, no error) — just go home.
  return NextResponse.redirect(new URL(next, origin));
}
