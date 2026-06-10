import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Save } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GroupMatchCard } from "@/components/prode/GroupMatchCard";
import { groupMatches } from "@/data/matches";
import { groups } from "@/data/groups";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useActiveGroup, useSetActiveGroup } from "@/stores/ui.store";
import type { GroupId } from "@/data/groups";

export function GruposView() {
  const navigate = useNavigate();
  const active = useActiveGroup();
  const setActive = useSetActiveGroup();
  const [internalActive, setInternalActive] = useState<GroupId>(active);

  const handleChange = (id: string) => {
    if (id === "A" || id === "B" || id === "C" || id === "D") {
      setInternalActive(id);
      setActive(id);
    }
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
          resultado exacto paga el doble.
        </p>
      </motion.header>

      <motion.div variants={fadeUp}>
        <Tabs value={internalActive} onValueChange={handleChange}>
          <TabsList variant="line" className="w-full justify-start gap-0">
            {groups.map((g) => (
              <TabsTrigger key={g.id} value={g.id} className="flex-1 md:flex-none">
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <AnimatePresence mode="wait">
            {groups.map((g) => (
              <TabsContent key={g.id} value={g.id} className="mt-6">
                <motion.div
                  variants={staggerContainer(0.05, 0.05)}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 gap-3 md:grid-cols-2"
                >
                  {groupMatches
                    .filter((m) => m.group === g.id)
                    .map((match) => (
                      <GroupMatchCard key={match.id} match={match} />
                    ))}
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="sticky bottom-20 z-10 flex flex-col gap-2 rounded-xl border border-border/40 bg-card/90 p-3 backdrop-blur-md md:bottom-0 md:flex-row md:items-center md:justify-between"
      >
        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          Guardá antes del kickoff para sumar puntos
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/reglas")}>
            Ver reglas
          </Button>
          <Button variant="gradient" size="sm">
            <Save /> Guardar Predicciones
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
