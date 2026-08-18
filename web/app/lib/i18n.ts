// Localisation. English is the default everywhere; French is offered only on the
// Canadiens (MTL) page via an in-page toggle. All user-facing strings on the
// game screen resolve through getStrings(lang); dynamic ones (reveal line,
// positions, era/mode labels, team name) are functions on the same object.

import { playedForTeam, type Mode, type Player } from "./players";

export type Lang = "en" | "fr";

export type Strings = {
  allTeams: string;
  didThey: (short: string) => string;
  lacingUp: string;
  loadError: string;
  streak: string;
  best: string;
  faceoff: string;
  nextShift: string;
  modeTitle: string;
  eraTitle: string;
  modeLabel: (m: Mode) => string;
  casualSub: string;
  hardcoreSub: (secs: number) => string;
  poolLine: (n: number, modeLabel: string) => string;
  dropPuck: string;
  laceAgain: string;
  emptyPool: string;
  everPlayed: (name: string) => string;
  no: string;
  neverThere: string;
  yes: string;
  woreSweater: string;
  keys: string;
  periodClock: string;
  timeUp: string;
  runOver: string;
  clockBeat: string;
  saidPlayed: (short: string) => string;
  saidNever: string;
  streakThisRun: string;
  importPrompt: (n: number) => string;
  importBtn: string;
  howToPlay: string;
  howToIntro: (short: string) => string;
  howToWin: string;
  howToCasual: string;
  howToHardcore: (secs: number, short: string) => string;
  howToEra: string;
  howToKeys: string;
  footer: (name: string) => string;
  eraShort: (id: string, label: string) => string;
  eraPill: (id: string, label: string) => string;
  positionName: (code: string) => string;
  reveal: (p: Player, teamCode: string, short: string) => string;
  teamFull: (code: string, fallback: string) => string;
  teamShort: (code: string, fallback: string) => string;
};

const EN: Strings = {
  allTeams: "← all teams",
  didThey: (s) => `Did they ever play for the ${s}?`,
  lacingUp: "Lacing up…",
  loadError: "Couldn't load the roster data (players.json).",
  streak: "Streak",
  best: "Best",
  faceoff: "Face-off",
  nextShift: "Next shift?",
  modeTitle: "Mode",
  eraTitle: "Era",
  modeLabel: (m) => (m === "hardcore" ? "hardcore" : "casual"),
  casualSub: "no clock · any recognizable player",
  hardcoreSub: (secs) => `${secs}s clock · only the tricky ones`,
  poolLine: (n, m) => `${n} players in the ${m} pool`,
  dropPuck: "Drop the puck",
  laceAgain: "Lace up again",
  emptyPool: "No players match this era in hardcore. Try another era or casual mode.",
  everPlayed: (name) => `Ever played a game for the ${name}?`,
  no: "No",
  neverThere: "never there",
  yes: "Yes",
  woreSweater: "wore the sweater",
  keys: "Keys: N / ← = No · Y / → = Yes",
  periodClock: "Period clock",
  timeUp: "Time!",
  runOver: "Run over",
  clockBeat: "The clock beat you.",
  saidPlayed: (s) => `You said they played for the ${s}.`,
  saidNever: "You said they never did.",
  streakThisRun: "Streak this run:",
  importPrompt: (n) =>
    `You have ${n} local best streak${n === 1 ? "" : "s"} not saved to your account.`,
  importBtn: "Import",
  howToPlay: "How to play",
  howToIntro: (s) =>
    `You're shown an NHL player. Guess whether they ever played a game for the ${s}.`,
  howToWin: "A right answer extends your streak; one miss ends the run.",
  howToCasual: "Casual — any recognizable player, no clock.",
  howToHardcore: (secs, s) =>
    `Hardcore — only tricky ones (obscure ${s} & well-travelled others) on a ${secs}-second clock.`,
  howToEra: "Pick an era to narrow the pool. Best streak is saved per team, mode & era.",
  howToKeys: "Keyboard: Y / → for yes, N / ← for no.",
  footer: (name) =>
    `Fan project · not affiliated with the NHL or the ${name} · data: NHL API + Hockey Databank`,
  eraShort: (id, label) => (id === "all" ? "all eras" : id === "pre1970" ? "pre-1970" : label),
  eraPill: (_id, label) => label,
  positionName: (code) =>
    ({ C: "Centre", L: "Left Wing", R: "Right Wing", D: "Defence", G: "Goaltender", F: "Forward" }[code] ?? code),
  reveal: (p, teamCode, short) => {
    const eras = p.decadesActive.join(", ");
    if (playedForTeam(p, teamCode)) {
      const gp = p.teamGP[teamCode] ?? 0;
      const when = (p.teamDecades[teamCode] ?? []).join(", ");
      return `Yes — ${gp} regular-season game${gp === 1 ? "" : "s"} for the ${short}${when ? ` (${when})` : ""}.`;
    }
    const played = p.teams.length ? `played for ${p.teams.join(", ")}` : `${p.careerGP} NHL games`;
    return `No — ${played} across ${p.teamCount} club${p.teamCount === 1 ? "" : "s"} (${eras}), never the ${short}.`;
  },
  teamFull: (_code, fallback) => fallback,
  teamShort: (_code, fallback) => fallback,
};

const FR: Strings = {
  allTeams: "← toutes les équipes",
  didThey: (s) => `Ont-ils déjà joué pour les ${s} ?`,
  lacingUp: "On lace les patins…",
  loadError: "Impossible de charger les données (players.json).",
  streak: "Séquence",
  best: "Record",
  faceoff: "Mise au jeu",
  nextShift: "Prochaine présence ?",
  modeTitle: "Mode",
  eraTitle: "Époque",
  modeLabel: (m) => (m === "hardcore" ? "difficile" : "facile"),
  casualSub: "sans chrono · tout joueur connu",
  hardcoreSub: (secs) => `chrono ${secs}s · seulement les pièges`,
  poolLine: (n, m) => `${n} joueurs dans le bassin ${m}`,
  dropPuck: "Lancer la rondelle",
  laceAgain: "On relace les patins",
  emptyPool:
    "Aucun joueur pour cette époque en mode difficile. Essayez une autre époque ou le mode facile.",
  everPlayed: (name) => `A-t-il déjà disputé un match pour les ${name} ?`,
  no: "Non",
  neverThere: "jamais là",
  yes: "Oui",
  woreSweater: "a porté le chandail",
  keys: "Touches : N / ← = Non · Y / → = Oui",
  periodClock: "Horloge",
  timeUp: "Temps écoulé !",
  runOver: "Séquence terminée",
  clockBeat: "Le chrono a gagné.",
  saidPlayed: (s) => `Vous avez dit qu'il a joué pour les ${s}.`,
  saidNever: "Vous avez dit que non.",
  streakThisRun: "Séquence :",
  importPrompt: (n) =>
    `Vous avez ${n} record${n === 1 ? "" : "s"} local${n === 1 ? "" : "aux"} non sauvegardé${n === 1 ? "" : "s"} dans votre compte.`,
  importBtn: "Importer",
  howToPlay: "Comment jouer",
  howToIntro: (s) =>
    `On vous montre un joueur de la LNH. Devinez s'il a déjà disputé un match pour les ${s}.`,
  howToWin: "Une bonne réponse prolonge votre séquence ; une erreur y met fin.",
  howToCasual: "Facile — tout joueur connu, sans chrono.",
  howToHardcore: (secs, s) =>
    `Difficile — seulement les pièges (${s} obscurs et joueurs nomades) avec un chrono de ${secs} secondes.`,
  howToEra:
    "Choisissez une époque pour cibler le bassin. Le record est sauvegardé par équipe, mode et époque.",
  howToKeys: "Clavier : Y / → pour oui, N / ← pour non.",
  footer: (name) =>
    `Projet de fan · non affilié à la LNH ni aux ${name} · données : API LNH + Hockey Databank`,
  eraShort: (id, label) => (id === "all" ? "toutes" : id === "pre1970" ? "avant 1970" : label),
  eraPill: (id, label) => (id === "all" ? "Toutes" : id === "pre1970" ? "Avant 1970" : label),
  positionName: (code) =>
    ({ C: "Centre", L: "Ailier gauche", R: "Ailier droit", D: "Défenseur", G: "Gardien", F: "Attaquant" }[code] ?? code),
  reveal: (p, teamCode, short) => {
    const eras = p.decadesActive.join(", ");
    if (playedForTeam(p, teamCode)) {
      const gp = p.teamGP[teamCode] ?? 0;
      const when = (p.teamDecades[teamCode] ?? []).join(", ");
      return `Oui — ${gp} match${gp === 1 ? "" : "s"} en saison régulière pour les ${short}${when ? ` (${when})` : ""}.`;
    }
    const played = p.teams.length ? `a joué pour ${p.teams.join(", ")}` : `${p.careerGP} matchs dans la LNH`;
    return `Non — ${played} dans ${p.teamCount} club${p.teamCount === 1 ? "" : "s"} (${eras}), jamais les ${short}.`;
  },
  teamFull: (code, fallback) => (code === "MTL" ? "Canadiens de Montréal" : fallback),
  teamShort: (code, fallback) => (code === "MTL" ? "Canadiens" : fallback),
};

export function getStrings(lang: Lang): Strings {
  return lang === "fr" ? FR : EN;
}

// French is only offered where it fits the team (the Canadiens).
export function frenchAvailable(teamCode: string): boolean {
  return teamCode === "MTL";
}
