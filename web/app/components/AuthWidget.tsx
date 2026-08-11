"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import SignInPanel from "./SignInPanel";

// Non-intrusive account affordance. Renders NOTHING when Supabase isn't
// configured (guest-only build). Guest: a subtle "Sign in to save" link that
// opens the SignInPanel popover. Signed in: a small menu with Profile + Sign out.
export default function AuthWidget() {
  const { configured, loading, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!configured || loading) return null;

  if (!user) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[0.7rem] font-semibold uppercase tracking-widest text-ink-soft underline decoration-dotted underline-offset-4 hover:text-team"
        >
          Sign in to save
        </button>
        {open && <SignInPanel onClose={() => setOpen(false)} />}
      </div>
    );
  }

  const label = user.email ?? "Account";
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-widest text-ink-soft hover:text-team"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full crest text-[0.6rem]">
          {label.slice(0, 1).toUpperCase()}
        </span>
        <span className="max-w-[10rem] truncate normal-case tracking-normal">
          {label}
        </span>
      </button>
      {open && (
        <div className="card absolute right-0 z-20 mt-2 w-44 p-2 text-left shadow-xl">
          <Link
            href="/me"
            prefetch={false}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-ink/5"
          >
            My profile
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-ink/5"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
