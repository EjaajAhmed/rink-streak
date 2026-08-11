"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "./supabase/client";

type EmailResult = { ok: boolean; error?: string };

type AuthState = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<EmailResult>;
  signOut: () => Promise<void>;
};

const noop = async () => {};
const DEFAULT: AuthState = {
  configured: false,
  loading: false,
  user: null,
  signInWithGoogle: noop,
  signInWithEmail: async () => ({ ok: false, error: "Sign-in is not enabled." }),
  signOut: noop,
};

const AuthContext = createContext<AuthState>(DEFAULT);

// Where to return after an OAuth / magic-link round-trip: back to the current
// page. Falls back to "/" during SSR.
function redirectTo(): string {
  if (typeof window === "undefined") return "/";
  const next = window.location.pathname + window.location.search;
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getBrowserSupabase();
  const configured = supabase !== null;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(configured);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (alive) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
  }, [supabase]);

  const signInWithEmail = useCallback(
    async (email: string): Promise<EmailResult> => {
      if (!supabase) return { ok: false, error: "Sign-in is not enabled." };
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo() },
      });
      return error ? { ok: false, error: error.message } : { ok: true };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthState>(
    () => ({
      configured,
      loading,
      user,
      signInWithGoogle,
      signInWithEmail,
      signOut,
    }),
    [configured, loading, user, signInWithGoogle, signInWithEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
