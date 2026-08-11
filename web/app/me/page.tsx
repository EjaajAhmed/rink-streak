"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth";
import { getBrowserSupabase } from "../lib/supabase/client";
import { TEAMS, TEAM_CODES } from "../lib/teams";
import { SITE_NAME } from "../lib/config";
import AuthWidget from "../components/AuthWidget";
import {
  fetchProfile,
  fetchProfileStats,
  updateProfile,
  type Profile,
  type ProfileStats,
} from "../lib/stats";

export default function ProfilePage() {
  const { configured, loading, user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [profile, setProfile] = useState<Profile>({
    display_name: null,
    favourite_team: null,
  });
  const [savedNote, setSavedNote] = useState("");

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!user || !sb) return;
    let alive = true;
    Promise.all([fetchProfileStats(sb, user.id), fetchProfile(sb, user.id)]).then(
      ([s, p]) => {
        if (!alive) return;
        setStats(s);
        setProfile(p);
      },
    );
    return () => {
      alive = false;
    };
  }, [user]);

  const save = async (patch: Partial<Profile>) => {
    const sb = getBrowserSupabase();
    if (!user || !sb) return;
    const next = { ...profile, ...patch };
    setProfile(next);
    await updateProfile(sb, user.id, patch);
    setSavedNote("Saved");
    setTimeout(() => setSavedNote(""), 1500);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-12">
      <div className="flex items-center justify-between pt-5 text-[0.7rem] font-semibold uppercase tracking-widest text-ink-soft">
        <Link href="/" prefetch={false} className="hover:text-team">
          ← {SITE_NAME}
        </Link>
        <AuthWidget />
      </div>

      <h1 className="mt-6 block text-3xl text-ink sm:text-4xl">My profile</h1>

      {!configured ? (
        <Note>Accounts aren&apos;t enabled on this deployment yet.</Note>
      ) : loading ? (
        <Note>Loading…</Note>
      ) : !user ? (
        <Note>
          Sign in (top-right) to see your streak stats across every team. You can
          keep playing as a guest without an account.
        </Note>
      ) : (
        <>
          {/* Identity */}
          <section className="card mt-5 p-5">
            <label className="mb-1 block text-xs tracking-widest text-ink-soft">
              Display name
            </label>
            <div className="flex gap-2">
              <input
                value={profile.display_name ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, display_name: e.target.value }))
                }
                placeholder="Add a name"
                className="flex-1 rounded-lg border-2 border-ink/20 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-team"
              />
              <button
                onClick={() => save({ display_name: profile.display_name })}
                className="pill pill-active"
              >
                Save
              </button>
            </div>

            <label className="mb-1 mt-4 block text-xs tracking-widest text-ink-soft">
              Favourite team
            </label>
            <select
              value={profile.favourite_team ?? ""}
              onChange={(e) => save({ favourite_team: e.target.value || null })}
              className="w-full rounded-lg border-2 border-ink/20 bg-white/70 px-3 py-2 text-sm text-ink outline-none focus:border-team"
            >
              <option value="">— none —</option>
              {TEAM_CODES.map((code) => (
                <option key={code} value={code}>
                  {TEAMS[code].name}
                </option>
              ))}
            </select>
            {savedNote && (
              <p className="mt-2 text-xs font-semibold text-team">{savedNote}</p>
            )}
          </section>

          {/* Overall */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatTile label="Best streak" value={stats?.overall.best ?? 0} />
            <StatTile label="Games" value={stats?.overall.games ?? 0} />
            <StatTile
              label="Avg streak"
              value={(stats?.overall.avg ?? 0).toFixed(1)}
            />
          </div>

          {/* Per-team */}
          <h2 className="mb-2 mt-7 block text-sm text-ink">By team</h2>
          {stats && stats.perTeam.length > 0 ? (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-left text-[0.7rem] uppercase tracking-widest text-ink-soft">
                    <th className="px-4 py-2 font-semibold">Team</th>
                    <th className="px-3 py-2 text-right font-semibold">Best</th>
                    <th className="px-3 py-2 text-right font-semibold">Games</th>
                    <th className="px-4 py-2 text-right font-semibold">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.perTeam.map((t) => (
                    <tr key={t.teamCode} className="border-b border-ink/5 last:border-0">
                      <td className="px-4 py-2 text-ink">
                        <Link
                          href={`/${TEAMS[t.teamCode]?.slug ?? ""}`}
                          prefetch={false}
                          className="hover:text-team"
                        >
                          {TEAMS[t.teamCode]?.short ?? t.teamCode}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-ink">
                        {t.best}
                      </td>
                      <td className="px-3 py-2 text-right text-ink-soft">
                        {t.games}
                      </td>
                      <td className="px-4 py-2 text-right text-ink-soft">
                        {t.avg.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Note>No games yet — go start a streak on any team page.</Note>
          )}
        </>
      )}
    </main>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-xl border border-ink/15 bg-white/60 p-5 text-sm text-ink-soft">
      {children}
    </p>
  );
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="enamel px-3 py-3 text-center">
      <div className="block text-[0.65rem] tracking-widest opacity-80">
        {label}
      </div>
      <div className="numeral text-3xl font-bold leading-tight">{value}</div>
    </div>
  );
}
