export type LeaderboardEntry = {
  rank: number;
  name: string;
  points: number;
  trend: "up" | "down" | "same";
  trendDelta: number;
  isCurrentUser?: boolean;
};

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Toto Salvio", points: 1840, trend: "up", trendDelta: 12 },
  { rank: 2, name: "Martu Centurión", points: 1710, trend: "up", trendDelta: 6 },
  { rank: 3, name: "Pipe Roldán", points: 1655, trend: "down", trendDelta: -3 },
  { rank: 4, name: "Caro Bilos", points: 1480, trend: "up", trendDelta: 8 },
  { rank: 5, name: "Nico Bustos", points: 1410, trend: "same", trendDelta: 0 },
  { rank: 6, name: "Sole Méndez", points: 1330, trend: "up", trendDelta: 4 },
  { rank: 7, name: "Gus Pereyra", points: 1280, trend: "down", trendDelta: -2 },
  { rank: 8, name: "Hincha 1,250 PTS", points: 1250, trend: "up", trendDelta: 5, isCurrentUser: true },
  { rank: 9, name: "Rami Quinteros", points: 1180, trend: "down", trendDelta: -7 },
  { rank: 10, name: "Yami Gallardo", points: 1105, trend: "up", trendDelta: 2 },
  { rank: 11, name: "Lu Acuña", points: 1020, trend: "same", trendDelta: 0 },
  { rank: 12, name: "Diego Maidana", points: 970, trend: "down", trendDelta: -1 },
];
