import { useMemo } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { usePlayer } from "@/stores/auth.store";
import type { GroupLeaderboardEntry, LeaderboardEntry } from "@/types";

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
