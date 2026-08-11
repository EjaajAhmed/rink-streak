import Link from "next/link";
import { TEAMS, TEAM_CODES, themeVars } from "./lib/teams";
import { SITE_NAME, SITE_TAGLINE } from "./lib/config";

// Grouping for the landing grid (division order, like the teams.ts comments).
const DIVISIONS: { name: string; codes: string[] }[] = [
  { name: "Atlantic", codes: ["TOR", "MTL", "BOS", "BUF", "DET", "FLA", "OTT", "TBL"] },
  { name: "Metropolitan", codes: ["CAR", "CBJ", "NJD", "NYI", "NYR", "PHI", "PIT", "WSH"] },
  { name: "Central", codes: ["CHI", "COL", "DAL", "MIN", "NSH", "STL", "UTA", "WPG"] },
  { name: "Pacific", codes: ["ANA", "CGY", "EDM", "LAK", "SJS", "SEA", "VAN", "VGK"] },
];

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 pb-14">
      <header className="pt-10 text-center sm:pt-14">
        <h1 className="block text-4xl leading-none text-ink sm:text-6xl">
          {SITE_NAME}
        </h1>
        <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-ink-soft">
          {SITE_TAGLINE}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink-soft">
          Pick a team. You&apos;ll be shown NHL players one at a time — guess
          whether each one <strong>ever</strong> suited up for that team. Every
          right answer extends your streak; one miss ends the run.
        </p>
      </header>

      <p className="mt-8 text-center text-xs font-semibold uppercase tracking-widest text-ink-soft">
        Choose your team
      </p>

      <div className="mt-4 space-y-7">
        {DIVISIONS.map((div) => (
          <section key={div.name}>
            <h2 className="mb-2 block text-xs tracking-widest text-ink-soft">
              {div.name}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {div.codes.map((code) => {
                const t = TEAMS[code];
                return (
                  <Link
                    key={code}
                    href={`/${t.slug}`}
                    prefetch={false}
                    style={themeVars(code) as React.CSSProperties}
                    className="team-tile relative flex h-24 flex-col justify-end overflow-hidden p-3"
                  >
                    <span className="tile-accent absolute left-0 top-0 h-full w-1.5" />
                    <span className="block text-[0.7rem] tracking-widest opacity-80">
                      {code}
                    </span>
                    <span className="block text-base leading-tight sm:text-lg">
                      {t.short}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-center text-[0.7rem] uppercase tracking-widest text-ink-soft/70">
        {TEAM_CODES.length} teams · fan project · not affiliated with the NHL ·
        data: NHL API + Hockey Databank
      </p>
    </main>
  );
}
