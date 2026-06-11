import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BracketNode } from "@/components/prode/BracketNode";
import { useFixtures } from "@/hooks/useFixtures";
import {
  fadeUp,
  slideInLeft,
  slideInRight,
  staggerContainer,
} from "@/lib/motion";
import type { FixtureStage } from "@/types";

const rounds: {
  id: FixtureStage;
  label: string;
  direction: "left" | "right" | "center";
}[] = [
  { id: "R16", label: "Octavos", direction: "left" },
  { id: "QF", label: "Cuartos", direction: "left" },
  { id: "SF", label: "Semis", direction: "right" },
  { id: "F", label: "La Final", direction: "center" },
];

const bracketVariants = {
  left: slideInLeft,
  right: slideInRight,
  center: fadeUp,
};

export function EliminatoriasView() {
  const navigate = useNavigate();
  const { knockoutMatches, isLoading, isError, refetch } = useFixtures();

  return (
    <motion.div
      variants={staggerContainer(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <motion.header variants={fadeUp} className="flex flex-col gap-2">
        <span className="font-mono-label text-[0.7rem] uppercase tracking-wider text-primary">
          Fase Final
        </span>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
          Eliminatorias
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Pronosticá el camino hacia la gloria. Cargá el resultado de cada
          cruce.
        </p>
      </motion.header>

      {isError ? (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center"
        >
          <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-destructive">
            No pudimos cargar el bracket
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        </motion.div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      ) : knockoutMatches.length === 0 ? (
        <motion.div
          variants={fadeUp}
          className="rounded-lg border border-dashed border-border/40 bg-muted/10 p-8 text-center"
        >
          <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Las eliminatorias se habilitan al cerrar la fase de grupos
          </span>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {rounds.map((round) => {
            const matches = knockoutMatches.filter(
              (m) => m.stage === round.id
            );
            if (matches.length === 0) return null;
            return (
              <motion.section
                key={round.id}
                variants={bracketVariants[round.direction]}
                className="flex flex-col gap-4"
              >
                <div className="flex items-center gap-2">
                  {round.id === "F" ? (
                    <Trophy className="size-4 text-accent" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                  <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                    {round.label}
                  </h2>
                </div>
                <div
                  className={`flex flex-col gap-3 ${
                    round.id === "F" ? "items-center" : ""
                  }`}
                >
                  {matches.map((m) => (
                    <BracketNode
                      key={m.id}
                      match={m}
                      variant={round.id === "F" ? "final" : "default"}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}

      <motion.div
        variants={fadeUp}
        className="sticky bottom-20 z-10 flex flex-col gap-2 rounded-xl border border-border/40 bg-card/90 p-3 backdrop-blur-md md:bottom-0 md:flex-row md:items-center md:justify-between"
      >
        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          Los cruces se actualizan a medida que avanza el torneo
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/grupos")}
          >
            Volver a grupos
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
