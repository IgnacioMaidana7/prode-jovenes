import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupMatchCard } from "@/components/prode/GroupMatchCard";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useUiStore } from "@/stores/ui.store";
import { useFixtures } from "@/hooks/useFixtures";
import { usePredictions } from "@/hooks/usePredictions";
import { CheckCircle2 } from "lucide-react";

export function GruposView() {
  const activeGroup = useUiStore((s) => s.activeGroup);
  const setActiveGroup = useUiStore((s) => s.setActiveGroup);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const { groupMatches, groups, isLoading, isError, refetch } = useFixtures();
  const { count: predictionsCount } = usePredictions();

  const effectiveActive = useMemo(() => {
    if (groups.length === 0) return activeGroup;
    return groups.includes(activeGroup) ? activeGroup : groups[0];
  }, [groups, activeGroup]);

  useLayoutEffect(() => {
    if (!tabsListRef.current) return;
    tabsListRef.current.scrollLeft = 0;
  }, [groups.length]);

  useEffect(() => {
    if (!tabsListRef.current) return;
    const timer = setTimeout(() => {
      if (!tabsListRef.current) return;
      if (effectiveActive === "A") {
        tabsListRef.current.scrollTo({ left: 0, behavior: "instant" });
      } else {
        const activeTab = tabsListRef.current.querySelector<HTMLElement>(
          `[data-state="active"]`
        );
        if (activeTab) {
          tabsListRef.current.scrollTo({
            left: activeTab.offsetLeft,
            behavior: "instant",
          });
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [effectiveActive]);

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono-label text-[0.7rem] uppercase tracking-wider text-primary">
              Fase de Grupos
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
              Pronosticá los grupos
            </h1>
            <p className="max-w-2xl text-pretty text-muted-foreground">
              Cargá tu pronóstico para cada partido antes del kickoff. Acertar
              el resultado exacto suma el triple.
            </p>
          </div>
          {predictionsCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
              <CheckCircle2 className="size-4 text-primary" />
              <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-primary">
                {predictionsCount} pronósticos guardados
              </span>
            </div>
          )}
        </div>
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
            <div className="sticky top-0 z-20 -mx-4 bg-background/80 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
              <TabsList
                ref={tabsListRef}
                variant="line"
                className="w-full overflow-x-auto scrollbar-hide justify-start"
              >
                {groups.map((g) => (
                  <TabsTrigger
                    key={g}
                    value={g}
                    className="shrink-0"
                  >
                    Grupo {g}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
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
    </motion.div>
  );
}
