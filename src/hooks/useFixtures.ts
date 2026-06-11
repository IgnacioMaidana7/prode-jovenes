import { useMemo, useState } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Fixture, FixtureStage } from "@/types";

const FIXTURES_KEY = ["fixtures"] as const;
const LIVE_STATUSES: Fixture["status"][] = ["LIVE", "IN_PLAY", "PAUSED"];
const UPCOMING_STATUSES: Fixture["status"][] = ["SCHEDULED", "TIMED"];

async function fetchFixtures(): Promise<Fixture[]> {
  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Fixture[];
}

export const fixturesQuery = queryOptions({
  queryKey: FIXTURES_KEY,
  queryFn: fetchFixtures,
  staleTime: 60_000,
  refetchOnWindowFocus: true,
});

export function useFixtures() {
  const query = useQuery(fixturesQuery);

  const fixtures = useMemo(() => query.data ?? [], [query.data]);

  const groupMatches = useMemo(
    () => fixtures.filter((f) => f.stage === "GROUP"),
    [fixtures]
  );

  const knockoutMatches = useMemo(
    () => fixtures.filter((f) => f.stage !== "GROUP"),
    [fixtures]
  );

  const liveMatch = useMemo(
    () => fixtures.find((f) => LIVE_STATUSES.includes(f.status)),
    [fixtures]
  );

  const groups = useMemo(() => {
    const set = new Set<string>();
    for (const f of groupMatches) {
      if (f.group_name) set.add(f.group_name);
    }
    return Array.from(set).sort();
  }, [groupMatches]);

  return {
    ...query,
    fixtures,
    groupMatches,
    knockoutMatches,
    liveMatch,
    groups,
  };
}

/**
 * Próximos partidos. Toma un snapshot del "ahora" al montarse para mantener
 * el cálculo puro entre re-renders del mismo componente.
 */
export function useUpcomingMatches(limit = 3) {
  const { fixtures, ...rest } = useFixtures();
  const [now] = useState(() => Date.now());

  const matches = useMemo(
    () =>
      fixtures
        .filter(
          (f) =>
            UPCOMING_STATUSES.includes(f.status) &&
            new Date(f.date).getTime() > now
        )
        .slice(0, limit),
    [fixtures, now, limit]
  );

  return { ...rest, matches };
}

export function useFixturesByGroup(group: string) {
  const { groupMatches, ...rest } = useFixtures();
  const matches = useMemo(
    () => groupMatches.filter((f) => f.group_name === group),
    [groupMatches, group]
  );
  return { ...rest, matches };
}

export function useFixturesByStage(stage: FixtureStage) {
  const { fixtures, ...rest } = useFixtures();
  const matches = useMemo(
    () => fixtures.filter((f) => f.stage === stage),
    [fixtures, stage]
  );
  return { ...rest, matches };
}

export function useFixtureById(id: string | undefined) {
  const { fixtures, ...rest } = useFixtures();
  const fixture = useMemo(
    () => (id ? fixtures.find((f) => f.id === id) : undefined),
    [fixtures, id]
  );
  return { ...rest, fixture };
}
