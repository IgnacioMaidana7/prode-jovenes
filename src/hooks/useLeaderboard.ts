import { useMemo } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { usePlayer } from "@/stores/auth.store";
import type { GroupLeaderboardEntry, LeaderboardEntry } from "@/types";

const GLOBAL_KEY = ["leaderboard", "global"] as const;
const GROUP_KEY = (groupId: string) =>
  ["leaderboard", "group", groupId] as const;

async function fetchGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("ranking_global")
    .select("*")
    .order("rank", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LeaderboardEntry[];
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
  return (data ?? []) as GroupLeaderboardEntry[];
}

export const globalLeaderboardQuery = queryOptions({
  queryKey: GLOBAL_KEY,
  queryFn: fetchGlobalLeaderboard,
  staleTime: 30_000,
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
