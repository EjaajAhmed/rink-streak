import { NextResponse } from "next/server";
import { getServerSupabase } from "../../lib/supabase/server";

// OAuth / magic-link redirect target. Exchanges the `code` for a session, then
// sends the user back where they started (?next=). On any auth error (expired
// link, consumed OTP, failed exchange) it routes to a friendly /auth/error page
// instead of dumping the raw Supabase error string in the address bar.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorCode =
    url.searchParams.get("error_code") || url.searchParams.get("error");
  const next = url.searchParams.get("next") ?? "/";

  const errorTo = (reason: string) =>
    NextResponse.redirect(
      new URL(`/auth/error?reason=${encodeURIComponent(reason)}`, url.origin),
    );

  if (errorCode) return errorTo(errorCode);

  if (code) {
    const supabase = getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return errorTo("exchange_failed");
    }
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // Nothing to do (no code, no error) — just go home.
  return NextResponse.redirect(new URL(next, url.origin));
}
