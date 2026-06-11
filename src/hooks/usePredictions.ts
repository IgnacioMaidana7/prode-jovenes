import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { usePlayer } from "@/stores/auth.store";
import { fixturesQuery } from "@/hooks/useFixtures";
import type { Fixture, Prediction } from "@/types";

const PREDICTIONS_KEY = (playerId: string | undefined) =>
  ["predictions", playerId ?? "anon"] as const;

async function fetchPredictions(playerId: string): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Prediction[];
}

export function predictionsQueryOptions(playerId: string | undefined) {
  return queryOptions({
    queryKey: PREDICTIONS_KEY(playerId),
    queryFn: () => fetchPredictions(playerId!),
    enabled: !!playerId,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function usePredictions() {
  const player = usePlayer();
  const query = useQuery(predictionsQueryOptions(player?.id));

  const predictions = useMemo(() => query.data ?? [], [query.data]);
  const byFixture = useMemo(() => {
    const map = new Map<string, Prediction>();
    for (const p of predictions) map.set(p.fixture_id, p);
    return map;
  }, [predictions]);

  return {
    ...query,
    predictions,
    byFixture,
    count: predictions.length,
  };
}

export function usePrediction(fixtureId: string | undefined) {
  const { byFixture } = usePredictions();
  return fixtureId ? byFixture.get(fixtureId) : undefined;
}

type SavePredictionInput = {
  fixtureId: string;
  homeScore: number;
  awayScore: number;
};

function fixtureHasStarted(fixture: Fixture | undefined): boolean {
  if (!fixture) return false;
  if (["SCHEDULED", "TIMED"].includes(fixture.status)) {
    return new Date(fixture.date).getTime() <= Date.now();
  }
  return true;
}

export function useSavePrediction() {
  const player = usePlayer();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ fixtureId, homeScore, awayScore }: SavePredictionInput) => {
      if (!player) throw new Error("Necesitás entrar al prode primero.");

      const fixtures =
        qc.getQueryData<Fixture[]>(fixturesQuery.queryKey) ??
        (await qc.fetchQuery(fixturesQuery));
      const fixture = fixtures.find((f) => f.id === fixtureId);

      if (!fixture) throw new Error("El partido ya no está disponible.");
      if (fixtureHasStarted(fixture)) {
        throw new Error("El partido ya empezó: no se pueden modificar pronósticos.");
      }

      const safeHome = Math.max(0, Math.min(99, Math.floor(homeScore)));
      const safeAway = Math.max(0, Math.min(99, Math.floor(awayScore)));

      const { data, error } = await supabase
        .from("predictions")
        .upsert(
          {
            player_id: player.id,
            fixture_id: fixtureId,
            pred_home: safeHome,
            pred_away: safeAway,
          },
          { onConflict: "player_id,fixture_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data as Prediction;
    },

    onMutate: async ({ fixtureId, homeScore, awayScore }) => {
      if (!player) return;
      const key = PREDICTIONS_KEY(player.id);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Prediction[]>(key) ?? [];

      const optimistic: Prediction = {
        id:
          previous.find((p) => p.fixture_id === fixtureId)?.id ??
          `optimistic-${fixtureId}`,
        player_id: player.id,
        fixture_id: fixtureId,
        pred_home: homeScore,
        pred_away: awayScore,
        points: null,
        created_at: new Date().toISOString(),
      };

      const next = [
        optimistic,
        ...previous.filter((p) => p.fixture_id !== fixtureId),
      ];
      qc.setQueryData(key, next);
      return { previous };
    },

    onError: (error, _input, context) => {
      if (player && context?.previous) {
        qc.setQueryData(PREDICTIONS_KEY(player.id), context.previous);
      }
      const message =
        error instanceof Error ? error.message : "No pudimos guardar tu pronóstico.";
      toast.error(message);
    },

    onSuccess: () => {
      toast.success("Pronóstico guardado");
    },

    onSettled: () => {
      if (player) {
        qc.invalidateQueries({ queryKey: PREDICTIONS_KEY(player.id) });
      }
    },
  });
}
