import Link from "next/link";
import { SITE_NAME } from "../../lib/config";

// Friendly landing for auth failures (expired/consumed magic link, etc.) instead
// of the raw Supabase error string.
export default function AuthError({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason ?? "";
  const expired = reason === "otp_expired" || reason === "access_denied";

  const title = expired ? "That sign-in link expired" : "Sign-in didn't work";
  const body = expired
    ? "Magic links are single-use, and email apps sometimes open them automatically to scan them — which uses up the link before you get to it. Request a fresh one and enter the 6-digit code instead; the code won't get eaten by your inbox."
    : "Something went wrong finishing your sign-in. Please request a new sign-in email and try again.";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="puck mb-6 h-16 w-16" aria-hidden />
      <div className="card w-full p-6">
        <h1 className="block text-2xl text-ink">{title}</h1>
        <p className="mt-3 text-sm text-ink-soft">{body}</p>
        <Link
          href="/"
          prefetch={false}
          className="btn-answer btn-yes mt-6 inline-block w-full text-sm"
        >
          Back to {SITE_NAME}
        </Link>
        <p className="mt-3 text-[0.7rem] uppercase tracking-widest text-ink-soft/70">
          Then tap &ldquo;Sign in to save&rdquo; to get a new code
        </p>
      </div>
    </main>
  );
}
