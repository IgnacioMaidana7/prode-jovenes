import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Suscribe a cambios en `fixtures` y `predictions` vía Supabase Realtime
 * e invalida las queries de TanStack correspondientes para que la UI
 * refleje el nuevo estado sin esperar al próximo ciclo de polling.
 *
 * Pensado para montarse una sola vez en el árbol (App.tsx). Los hooks
 * que exponen los datos se siguen actualizando también por `refetchInterval`,
 * Realtime es solo el camino rápido.
 */
export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("prode-sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "fixtures" },
        () => {
          qc.invalidateQueries({ queryKey: ["fixtures"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "predictions" },
        () => {
          qc.invalidateQueries({ queryKey: ["predictions"] });
          qc.invalidateQueries({ queryKey: ["leaderboard"] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
}
