"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth";

// Lightweight sign-in popover. Google OAuth (when enabled) + passwordless email.
// Email uses a 6-digit code (typed) rather than only the magic link, so it's
// immune to email link scanners consuming the single-use link before you click.
export default function SignInPanel({ onClose }: { onClose: () => void }) {
  const { signInWithGoogle, signInWithEmail, verifyEmailCode, googleEnabled } =
    useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setError("");
    const res = await signInWithEmail(email.trim());
    setBusy(false);
    if (res.ok) setPhase("code");
    else setError(res.error ?? "Something went wrong.");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setBusy(true);
    setError("");
    const res = await verifyEmailCode(email, code);
    setBusy(false);
    if (res.ok) onClose(); // onAuthStateChange re-renders the widget as signed in
    else setError(res.error ?? "That code is invalid or has expired.");
  };

  return (
    <div className="card absolute right-0 z-20 mt-2 w-72 p-4 text-left shadow-xl">
      <div className="mb-1 flex items-center justify-between">
        <span className="block text-sm text-ink">Save your stats</span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-ink-soft hover:text-ink"
        >
          ×
        </button>
      </div>
      <p className="mb-3 text-xs text-ink-soft">
        Optional — your streaks sync to your account. You can keep playing as a
        guest.
      </p>

      {googleEnabled && (
        <>
          <button
            onClick={signInWithGoogle}
            className="btn-answer btn-no w-full text-sm"
          >
            Continue with Google
          </button>
          <div className="my-3 flex items-center gap-2 text-[0.65rem] uppercase tracking-widest text-ink-soft/70">
            <span className="h-px flex-1 bg-ink/15" /> or{" "}
            <span className="h-px flex-1 bg-ink/15" />
          </div>
        </>
      )}

      {phase === "email" ? (
        <form onSubmit={send} className="space-y-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-lg border-2 border-ink/20 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-team"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-answer btn-yes w-full text-sm disabled:opacity-50"
          >
            {busy ? "Sending…" : "Email me a code"}
          </button>
          {error && <p className="text-xs font-semibold text-penalty">{error}</p>}
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-2">
          <p className="text-xs text-ink-soft">
            Enter the 6-digit code we emailed to{" "}
            <span className="text-team">{email}</span> (or click the link in the
            email).
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full rounded-lg border-2 border-ink/20 bg-white/70 px-3 py-2 text-center text-lg tracking-[0.4em] text-ink outline-none focus:border-team"
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-answer btn-yes w-full text-sm disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify code"}
          </button>
          {error && <p className="text-xs font-semibold text-penalty">{error}</p>}
          <button
            type="button"
            onClick={() => {
              setPhase("email");
              setCode("");
              setError("");
            }}
            className="text-[0.7rem] text-ink-soft underline hover:text-ink"
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
