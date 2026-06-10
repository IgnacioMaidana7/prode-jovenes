export type MatchStatus = "scheduled" | "live" | "finished";

export type GroupMatch = {
  id: string;
  group: "A" | "B" | "C" | "D";
  home: string;
  away: string;
  date: string;
  status: MatchStatus;
};

export type KnockoutRound = "R16" | "QF" | "SF" | "F";

export type KnockoutMatch = {
  id: string;
  round: KnockoutRound;
  /** Codes of the two teams, or null when waiting on a previous match. */
  home: string | null;
  away: string | null;
  /** Source match id for each side (only relevant when team is null). */
  fromHome?: string;
  fromAway?: string;
  date: string;
};

export const groupMatches: GroupMatch[] = [
  { id: "A1", group: "A", home: "AR", away: "CA", date: "2026-06-20T21:00:00", status: "live" },
  { id: "A2", group: "A", home: "PE", away: "CL", date: "2026-06-21T21:00:00", status: "scheduled" },
  { id: "A3", group: "A", home: "AR", away: "CL", date: "2026-06-25T22:00:00", status: "scheduled" },
  { id: "A4", group: "A", home: "CA", away: "PE", date: "2026-06-25T22:00:00", status: "scheduled" },

  { id: "B1", group: "B", home: "US", away: "MX", date: "2026-06-22T19:00:00", status: "scheduled" },
  { id: "B2", group: "B", home: "UY", away: "PA", date: "2026-06-22T21:00:00", status: "scheduled" },
  { id: "B3", group: "B", home: "US", away: "PA", date: "2026-06-26T20:00:00", status: "scheduled" },
  { id: "B4", group: "B", home: "MX", away: "UY", date: "2026-06-26T22:00:00", status: "scheduled" },

  { id: "C1", group: "C", home: "BR", away: "CO", date: "2026-06-23T19:00:00", status: "scheduled" },
  { id: "C2", group: "C", home: "EC", away: "VE", date: "2026-06-23T21:00:00", status: "scheduled" },
  { id: "C3", group: "C", home: "BR", away: "VE", date: "2026-06-27T20:00:00", status: "scheduled" },
  { id: "C4", group: "C", home: "CO", away: "EC", date: "2026-06-27T22:00:00", status: "scheduled" },

  { id: "D1", group: "D", home: "ES", away: "FR", date: "2026-06-24T19:00:00", status: "scheduled" },
  { id: "D2", group: "D", home: "NL", away: "MA", date: "2026-06-24T21:00:00", status: "scheduled" },
  { id: "D3", group: "D", home: "ES", away: "MA", date: "2026-06-28T20:00:00", status: "scheduled" },
  { id: "D4", group: "D", home: "FR", away: "NL", date: "2026-06-28T22:00:00", status: "scheduled" },
];

export const knockoutMatches: KnockoutMatch[] = [
  { id: "R16-1", round: "R16", home: "AR", away: "AU", date: "2026-07-01T21:00:00" },
  { id: "R16-2", round: "R16", home: null, away: null, fromHome: "A1", fromAway: "A2", date: "2026-07-02T21:00:00" },
  { id: "R16-3", round: "R16", home: "NL", away: "US", date: "2026-07-02T18:00:00" },
  { id: "R16-4", round: "R16", home: "ES", away: "MA", date: "2026-07-03T21:00:00" },
  { id: "R16-5", round: "R16", home: "BR", away: "KR", date: "2026-07-04T21:00:00" },

  { id: "QF-1", round: "QF", home: "AR", away: null, fromAway: "QF-2", date: "2026-07-08T21:00:00" },
  { id: "QF-2", round: "QF", home: null, away: null, fromHome: "R16-3", fromAway: "R16-4", date: "2026-07-09T21:00:00" },
  { id: "QF-3", round: "QF", home: null, away: null, fromHome: "R16-5", fromAway: "R16-2", date: "2026-07-10T21:00:00" },

  { id: "SF-1", round: "SF", home: null, away: null, fromHome: "QF-1", fromAway: "QF-2", date: "2026-07-14T21:00:00" },
  { id: "SF-2", round: "SF", home: null, away: null, fromHome: "QF-3", fromAway: "R16-1", date: "2026-07-15T21:00:00" },

  { id: "F", round: "F", home: null, away: null, fromHome: "SF-1", fromAway: "SF-2", date: "2026-07-19T20:00:00" },
];

export type AnyMatch = (GroupMatch | KnockoutMatch) & { kind: "group" | "knockout" };

export function getMatchById(id: string): AnyMatch | undefined {
  const g = groupMatches.find((m) => m.id === id);
  if (g) return { ...g, kind: "group" };
  const k = knockoutMatches.find((m) => m.id === id);
  if (k) return { ...k, kind: "knockout" };
  return undefined;
}
