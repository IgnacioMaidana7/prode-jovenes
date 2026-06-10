import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Save, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BracketNode } from "@/components/prode/BracketNode";
import { knockoutMatches } from "@/data/matches";
import {
  fadeUp,
  slideInLeft,
  slideInRight,
  staggerContainer,
} from "@/lib/motion";
import type { KnockoutMatch, KnockoutRound } from "@/data/matches";

const rounds: { id: KnockoutRound; label: string; direction: "left" | "right" | "center" }[] = [
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
          Pronosticá el camino hacia la gloria. Seleccioná un equipo para
          avanzar en el bracket.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {rounds.map((round) => {
          const matches = knockoutMatches.filter((m) => m.round === round.id);
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
                {round.id === "F" && (
                  <span className="font-mono-label ml-auto text-[0.6rem] uppercase tracking-wider text-accent">
                    19 jul
                  </span>
                )}
              </div>
              <div
                className={`flex flex-col gap-3 ${
                  round.id === "F" ? "items-center" : ""
                }`}
              >
                {matches.map((m) => (
                  <BracketNode
                    key={m.id}
                    match={m as KnockoutMatch}
                    variant={round.id === "F" ? "final" : "default"}
                  />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      <motion.div
        variants={fadeUp}
        className="sticky bottom-20 z-10 flex flex-col gap-2 rounded-xl border border-border/40 bg-card/90 p-3 backdrop-blur-md md:bottom-0 md:flex-row md:items-center md:justify-between"
      >
        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          Los cruces dependerán de la fase de grupos
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/grupos")}>
            Volver a grupos
          </Button>
          <Button variant="gradient" size="sm">
            <Save /> Guardar Prode
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
