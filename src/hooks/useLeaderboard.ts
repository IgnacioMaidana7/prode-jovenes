import { useMemo } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { usePlayer } from "@/stores/auth.store";
import type { GroupLeaderboardEntry, LeaderboardEntry } from "@/types";

export type PredictionWithFixture = {
  id: string;
  fixture_id: string;
  pred_home: number;
  pred_away: number;
  points: number | null;
  fixture: {
    team_home: string | null;
    team_away: string | null;
    flag_home: string | null;
    flag_away: string | null;
    result_home: number | null;
    result_away: number | null;
    status: string;
    date: string;
  } | null;
};

const GLOBAL_KEY = ["leaderboard", "global"] as const;
const GROUP_KEY = (groupId: string) =>
  ["leaderboard", "group", groupId] as const;

function withDenseRank<T extends { total_points: number; rank: number }>(
  rows: T[]
): T[] {
  const sorted = [...rows].sort((a, b) => b.total_points - a.total_points);
  let dense = 0;
  let prevPoints: number | null = null;
  return sorted.map((row) => {
    if (row.total_points !== prevPoints) {
      dense += 1;
      prevPoints = row.total_points;
    }
    return { ...row, rank: dense };
  });
}

async function fetchGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("ranking_global")
    .select("*")
    .order("rank", { ascending: true });
  if (error) throw error;
  return withDenseRank((data ?? []) as LeaderboardEntry[]);
}

async function fetchGroupLeaderboard(
  groupId: string
): Promise<GroupLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("ranking_by_group")
    .select("*")
    .eq("group_id", groupId)
    .order("rank", { ascending: true });
  if (error) throw error;
  return withDenseRank((data ?? []) as GroupLeaderboardEntry[]);
}

export const globalLeaderboardQuery = queryOptions({
  queryKey: GLOBAL_KEY,
  queryFn: fetchGlobalLeaderboard,
  staleTime: 30_000,
  refetchInterval: 30_000,
  refetchIntervalInBackground: false,
});

export function useGlobalLeaderboard() {
  return useQuery(globalLeaderboardQuery);
}

export function useGroupLeaderboard(groupId: string | undefined) {
  return useQuery({
    queryKey: GROUP_KEY(groupId ?? "none"),
    queryFn: () => fetchGroupLeaderboard(groupId!),
    enabled: !!groupId,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

async function fetchPlayerRecentPredictions(
  playerId: string
): Promise<PredictionWithFixture[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select(
      `id, fixture_id, pred_home, pred_away, points,
       fixture:fixtures(team_home, team_away, flag_home, flag_away, result_home, result_away, status, date)`
    )
    .eq("player_id", playerId);
  if (error) throw error;

  return ((data ?? []) as PredictionWithFixture[])
    .filter(
      (p) =>
        p.fixture?.status === "FINISHED" && p.fixture.result_home !== null
    )
    .sort(
      (a, b) =>
        new Date(b.fixture!.date).getTime() -
        new Date(a.fixture!.date).getTime()
    )
    .slice(0, 5);
}

export function usePlayerRecentPredictions(playerId: string | undefined) {
  return useQuery({
    queryKey: ["player-recent-predictions", playerId ?? "none"],
    queryFn: () => fetchPlayerRecentPredictions(playerId!),
    enabled: !!playerId,
    staleTime: 30_000,
  });
}

export function useCurrentUserStats() {
  const player = usePlayer();
  const { data, isLoading } = useGlobalLeaderboard();

  return useMemo(() => {
    if (!player || !data) {
      return {
        entry: undefined,
        points: 0,
        rank: 0,
        exactHits: 0,
        winnerHits: 0,
        predictionsCount: 0,
        isLoading,
      };
    }
    const entry = data.find((e) => e.player_id === player.id);
    return {
      entry,
      points: entry?.total_points ?? 0,
      rank: entry?.rank ?? 0,
      exactHits: entry?.exact_hits ?? 0,
      winnerHits: entry?.winner_hits ?? 0,
      predictionsCount: entry?.predictions_count ?? 0,
      isLoading,
    };
  }, [player, data, isLoading]);
}
