"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGame } from "../useGame";
import { TEAMS } from "../lib/teams";
import { HARDCORE_SECONDS } from "../lib/config";
import AuthWidget from "../components/AuthWidget";
import SupportLink from "../components/SupportLink";
import { type Mode, type Player } from "../lib/players";
import { getStrings, frenchAvailable, type Lang, type Strings } from "../lib/i18n";

export default function Game({ teamCode }: { teamCode: string }) {
  const team = TEAMS[teamCode];
  const g = useGame(teamCode);

  // Language: English everywhere; French only offered on the Canadiens page.
  const canFrench = frenchAvailable(teamCode);
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    if (!canFrench) return;
    try {
      const v = localStorage.getItem("dth.lang.mtl");
      if (v === "fr" || v === "en") setLang(v);
    } catch {
      /* ignore */
    }
  }, [canFrench]);
  const chooseLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem("dth.lang.mtl", l);
    } catch {
      /* ignore */
    }
  };

  const t = getStrings(lang);
  const teamName = t.teamFull(teamCode, team.name);
  const teamShort = t.teamShort(teamCode, team.short);
  const eraCompact = t.eraShort(g.eraId, g.era.label);

  // Keyboard: Y / → = yes, N / ← = no, while playing.
  useEffect(() => {
    if (g.status !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "y" || e.key === "ArrowRight") g.answer(true);
      else if (k === "n" || e.key === "ArrowLeft") g.answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [g.status, g]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-10">
      <Header
        t={t}
        teamCode={teamCode}
        teamName={teamName}
        teamShort={teamShort}
        note={team.note}
        lang={lang}
        onLang={canFrench ? chooseLang : undefined}
      />
      <Scoreboard
        t={t}
        streak={g.streak}
        best={g.bestForCurrent}
        mode={g.mode}
        era={eraCompact}
      />

      <section className="card mt-5 overflow-hidden">
        <div className="hem" />
        <div className="p-5 sm:p-7">
          {g.status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-10 text-sm font-semibold text-ink-soft">
              <span className="puck puck-spin h-10 w-10" aria-hidden />
              {t.lacingUp}
            </div>
          )}
          {g.status === "error" && <Centered>{t.loadError}</Centered>}

          {(g.status === "ready" || g.status === "over") && (
            <>
              {g.status === "over" && g.result && (
                <GameOver
                  t={t}
                  result={g.result}
                  teamCode={teamCode}
                  teamShort={teamShort}
                  mode={g.mode}
                  era={eraCompact}
                />
              )}
              {g.importable > 0 && (
                <ImportPrompt
                  t={t}
                  count={g.importable}
                  onImport={g.importLocal}
                  onDismiss={g.dismissImport}
                />
              )}
              <StartPanel t={t} g={g} teamShort={teamShort} />
            </>
          )}

          {g.status === "playing" && g.current && (
            <PlayPanel
              t={t}
              player={g.current}
              teamName={teamName}
              mode={g.mode}
              timeLeft={g.timeLeft}
              onAnswer={g.answer}
            />
          )}
        </div>
        <div className="hem" />
      </section>

      {g.status !== "playing" && <HowToPlay t={t} teamShort={teamShort} />}

      <Footer t={t} teamName={teamName} />
    </main>
  );
}

/* ---------------------------------------------------------------- header */
function Header({
  t,
  teamCode,
  teamName,
  teamShort,
  note,
  lang,
  onLang,
}: {
  t: Strings;
  teamCode: string;
  teamName: string;
  teamShort: string;
  note?: string;
  lang: Lang;
  onLang?: (l: Lang) => void;
}) {
  return (
    <header className="pt-6 text-center">
      <div className="mb-4 flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-widest text-ink-soft">
        <Link href="/" prefetch={false} className="hover:text-team">
          {t.allTeams}
        </Link>
        <AuthWidget />
      </div>
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full crest">
        <span className="text-sm font-bold leading-none">{teamCode}</span>
      </div>
      <h1 className="block text-3xl leading-none text-ink sm:text-4xl">
        {teamName}
      </h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-ink-soft">
        {t.didThey(teamShort)}
      </p>
      {note && (
        <p className="mx-auto mt-3 max-w-md rounded-full border border-team/25 bg-team/5 px-3 py-1.5 text-[0.72rem] font-medium leading-snug text-ink-soft">
          {note}
        </p>
      )}
      {onLang && <LangToggle lang={lang} onChange={onLang} />}
    </header>
  );
}

function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="mt-3 inline-flex overflow-hidden rounded-full border-2 border-ink/20 text-[0.7rem] font-bold uppercase tracking-widest">
      {(["en", "fr"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          className={`px-3 py-1 ${lang === l ? "bg-team text-team-ink" : "text-ink-soft hover:text-ink"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ scoreboard */
function Scoreboard({
  t,
  streak,
  best,
  mode,
  era,
}: {
  t: Strings;
  streak: number;
  best: number;
  mode: Mode;
  era: string;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <Tile label={t.streak} value={streak} />
      <Tile label={`${t.best} · ${t.modeLabel(mode)} · ${era}`} value={best} />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="enamel px-4 py-3 text-center">
      <div className="block text-[0.7rem] tracking-widest opacity-80">
        {label}
      </div>
      <div className="numeral text-4xl font-bold leading-tight">{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------- start/over */
function StartPanel({
  t,
  g,
  teamShort,
}: {
  t: Strings;
  g: ReturnType<typeof useGame>;
  teamShort: string;
}) {
  const empty = g.pool.length === 0;
  return (
    <div className="text-center">
      <h2 className="block text-2xl text-ink">
        {g.status === "over" ? t.nextShift : t.faceoff}
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 sm:gap-0">
        {/* Left side — Mode */}
        <div className="sm:pr-6">
          <div className="mb-3 block text-xs tracking-widest text-ink-soft">
            {t.modeTitle}
          </div>
          <div className="flex flex-col gap-3">
            {(["casual", "hardcore"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => g.chooseMode(m)}
                className={`fo-key ${g.mode === m ? "fo-key-on" : ""}`}
              >
                {t.modeLabel(m)}
                <span className="mt-0.5 block text-[0.6rem] font-semibold normal-case tracking-wide opacity-75">
                  {m === "hardcore" ? t.hardcoreSub(HARDCORE_SECONDS) : t.casualSub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right side — Era, split by a centre line */}
        <div className="relative sm:border-l-2 sm:border-ink/10 sm:pl-6">
          <div className="mb-3 block text-xs tracking-widest text-ink-soft">
            {t.eraTitle}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {g.eras.map((era) => (
              <button
                key={era.id}
                onClick={() => g.chooseEra(era.id)}
                className={`fo-key ${g.eraId === era.id ? "fo-key-on" : ""}`}
              >
                {t.eraPill(era.id, era.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {t.poolLine(g.teamPoolCount, teamShort, t.modeLabel(g.mode))}
      </p>

      <button
        onClick={g.start}
        disabled={empty}
        className="btn-answer btn-yes mt-5 w-full text-lg disabled:cursor-not-allowed disabled:opacity-40"
      >
        {g.status === "over" ? t.laceAgain : t.dropPuck}
      </button>
      {empty && (
        <p className="mt-2 text-xs font-semibold text-penalty">{t.emptyPool}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- play view */
function PlayPanel({
  t,
  player,
  teamName,
  mode,
  timeLeft,
  onAnswer,
}: {
  t: Strings;
  player: Player;
  teamName: string;
  mode: Mode;
  timeLeft: number;
  onAnswer: (guess: boolean) => void;
}) {
  return (
    <div className="text-center">
      {mode === "hardcore" && <Clock t={t} timeLeft={timeLeft} />}

      <div className="relative mt-2 rounded-[4px] border border-ink/15 bg-white/60 px-4 py-6">
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full crest text-sm">
          {player.position}
        </span>
        <div className="block text-[0.7rem] tracking-widest text-ink-soft">
          {t.positionName(player.position)} · {player.decadesActive.join(" · ")}
        </div>
        <div className="mt-1 block text-3xl leading-tight text-ink sm:text-4xl">
          {player.name}
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-ink-soft">
        {t.everPlayed(teamName)}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="btn-answer btn-no" onClick={() => onAnswer(false)}>
          {t.no}
          <span className="mt-1 block text-[0.65rem] font-semibold tracking-wider opacity-70">
            {t.neverThere}
          </span>
        </button>
        <button className="btn-answer btn-yes" onClick={() => onAnswer(true)}>
          {t.yes}
          <span className="mt-1 block text-[0.65rem] font-semibold tracking-wider opacity-80">
            {t.woreSweater}
          </span>
        </button>
      </div>

      <p className="mt-4 text-[0.7rem] uppercase tracking-widest text-ink-soft/70">
        {t.keys}
      </p>
    </div>
  );
}

function Clock({ t, timeLeft }: { t: Strings; timeLeft: number }) {
  const pct = Math.max(0, Math.min(100, (timeLeft / HARDCORE_SECONDS) * 100));
  const warn = timeLeft <= 3;
  const secs = Math.ceil(timeLeft);
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="block text-[0.7rem] tracking-widest text-ink-soft">
          {t.periodClock}
        </span>
        <span
          className={`numeral text-2xl font-bold ${warn ? "tick-warn" : "text-ink"}`}
        >
          0:{secs.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="clock-track h-3">
        <div
          className={`clock-fill ${warn ? "warn" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- game over */
function GameOver({
  t,
  result,
  teamCode,
  teamShort,
  mode,
  era,
}: {
  t: Strings;
  result: NonNullable<ReturnType<typeof useGame>["result"]>;
  teamCode: string;
  teamShort: string;
  mode: Mode;
  era: string;
}) {
  const { player, reason, guess, streak } = result;
  return (
    <div className="mb-6 rounded-[4px] border-2 border-penalty/40 bg-white/70 p-5 text-center">
      <div className="block text-2xl text-penalty">
        {reason === "timeout" ? t.timeUp : t.runOver}
      </div>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        {reason === "timeout"
          ? t.clockBeat
          : guess
            ? t.saidPlayed(teamShort)
            : t.saidNever}
      </p>

      <div className="laces mx-auto mt-4 max-w-sm pt-4">
        <div className="block text-lg text-ink">{player.name}</div>
        <p className="mt-1 text-sm text-ink-soft">
          {t.reveal(player, teamCode, teamShort)}
        </p>
      </div>

      <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-ink-soft">
        {t.streakThisRun}{" "}
        <span className="numeral text-xl font-bold text-ink">{streak}</span> ·{" "}
        {t.modeLabel(mode)} · {era}
      </p>
    </div>
  );
}

/* --------------------------------------------------------- import prompt */
function ImportPrompt({
  t,
  count,
  onImport,
  onDismiss,
}: {
  t: Strings;
  count: number;
  onImport: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-[4px] border border-team/30 bg-white/70 p-3 text-left">
      <p className="flex-1 text-xs text-ink-soft">{t.importPrompt(count)}</p>
      <button onClick={onImport} className="pill pill-active">
        {t.importBtn}
      </button>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-ink-soft hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ how to play */
function HowToPlay({ t, teamShort }: { t: Strings; teamShort: string }) {
  return (
    <details className="card mt-4 overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-3">
        <span className="block text-sm text-ink">{t.howToPlay}</span>
        <span className="howto-mark text-lg text-ink-soft">+</span>
      </summary>
      <div className="laces mx-5 mb-5 space-y-2 pt-3 text-sm text-ink-soft">
        <p>{t.howToIntro(teamShort)}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t.howToWin}</li>
          <li>{t.howToCasual}</li>
          <li>{t.howToHardcore(HARDCORE_SECONDS, teamShort)}</li>
          <li>{t.howToEra}</li>
          <li>{t.howToKeys}</li>
        </ul>
      </div>
    </details>
  );
}

/* --------------------------------------------------------------- chrome */
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 text-center text-sm font-semibold text-ink-soft">
      {children}
    </div>
  );
}

function Footer({ t, teamName }: { t: Strings; teamName: string }) {
  return (
    <footer className="mt-8 text-center text-[0.7rem] uppercase tracking-widest text-ink-soft/60">
      {t.footer(teamName)}
      <SupportLink />
    </footer>
  );
}
