// Types + pure game logic. No React here so it is easy to reason about / test.
// Shape mirrors web/public/players.json (built by etl/build_players.py).

import {
  HARDCORE_TEAM_MAX_GP,
  HARDCORE_MIN_TEAMS,
} from "./config";

export type Player = {
  id: number;
  name: string;
  position: string;
  teams: string[]; // current-identity team codes the player actually played for
  teamGP: Record<string, number>; // per-team regular-season games (keys ⊆ teams)
  decadesActive: string[];
  teamDecades: Record<string, string[]>;
  careerGP: number;
  teamCount: number; // distinct clubs incl. relocated/defunct (well-travelled metric)
  iconic: boolean;
};

export type Mode = "casual" | "hardcore";

// An era = a selectable pool filter. `decades: null` means "no filter" (all).
export type Era = {
  id: string;
  label: string;
  decades: string[] | null;
};

// Pre-expansion decades (Original Six era) are sparse — collapse everything
// before 1970 into one neutral bucket instead of a pill per decade. 1970s
// onward stay as individual decades. (Generalised from v1's Leafs "Cups Era".)
export const PRE_EXPANSION_BEFORE = 1970;

/* ------------------------------------------------------------ answer check */
// THE single source of truth for "did this player play for team X?" (BUILD_PLAN
// principle 3). Every part of the app — UI, scoring, and any future server-side
// validation — must go through here, never re-derive it from raw fields.
export function playedForTeam(p: Player, teamCode: string): boolean {
  return p.teams.includes(teamCode);
}

/** Whether a yes/no guess is correct for this player + active team. */
export function isCorrect(p: Player, teamCode: string, guess: boolean): boolean {
  return guess === playedForTeam(p, teamCode);
}

/* -------------------------------------------------------------- difficulty */
/**
 * Hardcore strips the gimmes on both sides, relative to the ACTIVE team:
 *  - YES players (played for this team): only forgettable stints
 *    (games for this team < HARDCORE_TEAM_MAX_GP ≈ one season).
 *  - NO players (never this team): well-travelled journeymen (> HARDCORE_MIN_TEAMS
 *    clubs) who aren't instantly recognizable (not iconic).
 */
export function isHardcoreEligible(p: Player, teamCode: string): boolean {
  if (playedForTeam(p, teamCode)) {
    return (p.teamGP[teamCode] ?? 0) < HARDCORE_TEAM_MAX_GP;
  }
  return p.teamCount > HARDCORE_MIN_TEAMS && !p.iconic;
}

export function buildPool(
  players: Player[],
  teamCode: string,
  mode: Mode,
  decades: string[] | null,
): Player[] {
  return players.filter((p) => {
    if (decades && !p.decadesActive.some((d) => decades.includes(d))) return false;
    if (mode === "hardcore" && !isHardcoreEligible(p, teamCode)) return false;
    return true;
  });
}

/* -------------------------------------------------------------------- eras */
export function decadeList(players: Player[]): string[] {
  const seen = new Set<string>();
  for (const p of players) for (const d of p.decadesActive) seen.add(d);
  return [...seen].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

/** Era pills: "All", one "Pre-1970" bucket, then a pill per decade from 1970s. */
export function buildEras(players: Player[]): Era[] {
  const decades = decadeList(players);
  const pre = decades.filter((d) => parseInt(d, 10) < PRE_EXPANSION_BEFORE);
  const modern = decades.filter((d) => parseInt(d, 10) >= PRE_EXPANSION_BEFORE);
  const eras: Era[] = [{ id: "all", label: "All eras", decades: null }];
  if (pre.length) {
    eras.push({ id: "pre1970", label: "Pre-1970", decades: pre });
  }
  for (const d of modern) eras.push({ id: d, label: d, decades: [d] });
  return eras;
}

/* --------------------------------------------------------------- display */
const POSITIONS: Record<string, string> = {
  C: "Centre",
  L: "Left Wing",
  R: "Right Wing",
  D: "Defence",
  G: "Goaltender",
};

export function positionName(code: string): string {
  return POSITIONS[code] ?? code;
}

/** One-line reveal explaining the correct answer on the game-over screen. */
export function revealLine(p: Player, teamCode: string, teamShort: string): string {
  const eras = p.decadesActive.join(", ");
  if (playedForTeam(p, teamCode)) {
    const gp = p.teamGP[teamCode] ?? 0;
    const when = (p.teamDecades[teamCode] ?? []).join(", ");
    return `Yes — ${gp} regular-season game${gp === 1 ? "" : "s"} for the ${teamShort}${
      when ? ` (${when})` : ""
    }.`;
  }
  const played = p.teams.length
    ? `played for ${p.teams.join(", ")}`
    : `${p.careerGP} NHL games`;
  return `No — ${played} across ${p.teamCount} club${
    p.teamCount === 1 ? "" : "s"
  } (${eras}), never the ${teamShort}.`;
}
