import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupMatchCard } from "@/components/prode/GroupMatchCard";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useUiStore } from "@/stores/ui.store";
import { useFixtures } from "@/hooks/useFixtures";
import { usePredictions } from "@/hooks/usePredictions";

export function GruposView() {
  const navigate = useNavigate();
  const activeGroup = useUiStore((s) => s.activeGroup);
  const setActiveGroup = useUiStore((s) => s.setActiveGroup);

  const { groupMatches, groups, isLoading, isError, refetch } = useFixtures();
  const { count: predictionsCount } = usePredictions();

  const effectiveActive = useMemo(() => {
    if (groups.length === 0) return activeGroup;
    return groups.includes(activeGroup) ? activeGroup : groups[0];
  }, [groups, activeGroup]);

  const matchesByGroup = useMemo(() => {
    const map = new Map<string, typeof groupMatches>();
    for (const g of groups) {
      map.set(
        g,
        groupMatches.filter((m) => m.group_name === g)
      );
    }
    return map;
  }, [groupMatches, groups]);

  const handleChange = (id: string) => {
    setActiveGroup(id);
  };

  return (
    <motion.div
      variants={staggerContainer(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      <motion.header variants={fadeUp} className="flex flex-col gap-2">
        <span className="font-mono-label text-[0.7rem] uppercase tracking-wider text-primary">
          Fase de Grupos
        </span>
        <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
          Pronosticá los grupos
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Cargá tu pronóstico para cada partido antes del kickoff. Acertar el
          resultado exacto suma el triple.
        </p>
      </motion.header>

      {isError ? (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center"
        >
          <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-destructive">
            No pudimos cargar los partidos
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        </motion.div>
      ) : isLoading ? (
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </motion.div>
      ) : groups.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="rounded-lg border border-dashed border-border/40 bg-muted/10 p-8 text-center"
        >
          <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Todavía no hay grupos cargados
          </span>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <Tabs value={effectiveActive} onValueChange={handleChange}>
            <TabsList variant="line" className="w-full justify-start gap-0">
              {groups.map((g) => (
                <TabsTrigger
                  key={g}
                  value={g}
                  className="flex-1 md:flex-none"
                >
                  Grupo {g}
                </TabsTrigger>
              ))}
            </TabsList>
            <AnimatePresence mode="wait">
              {groups.map((g) => (
                <TabsContent key={g} value={g} className="mt-6">
                  <motion.div
                    variants={staggerContainer(0.05, 0.05)}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 gap-3 md:grid-cols-2"
                  >
                    {(matchesByGroup.get(g) ?? []).map((match) => (
                      <GroupMatchCard key={match.id} match={match} />
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>
          </Tabs>
        </motion.div>
      )}

      <motion.div
        variants={fadeUp}
        className="sticky bottom-20 z-10 flex flex-col gap-2 rounded-xl border border-border/40 bg-card/90 p-3 backdrop-blur-md md:bottom-0 md:flex-row md:items-center md:justify-between"
      >
        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          {predictionsCount > 0
            ? `${predictionsCount} pronósticos guardados`
            : "Guardá antes del kickoff para sumar puntos"}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/reglas")}
          >
            Ver reglas
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => navigate("/leaderboard")}
          >
            Ver ranking
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
