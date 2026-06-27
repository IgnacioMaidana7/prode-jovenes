import { motion } from "framer-motion";
import { Flag } from "@/lib/flags";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreInput } from "@/components/prode/ScoreInput";
import { cardHover, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Fixture, FixtureStage } from "@/types";

const roundLabel: Record<FixtureStage, string> = {
  GROUP: "Grupo",
  R32: "Ronda de 32",
  R16: "Octavos",
  QF: "Cuartos",
  SF: "Semis",
  F: "Final",
  "3RD": "3er Puesto",
};

type Props = {
  match: Fixture;
  variant?: "default" | "final";
};

export function BracketNode({ match }: Props) {
  const isPending = !match.team_home || !match.team_away;
  const isFinal = match.stage === "F";

  return (
    <motion.div
      variants={fadeUp}
      {...cardHover}
      className={cn(isFinal && "w-full max-w-md")}
    >
      <Card
        size="sm"
        className={cn(
          "relative overflow-hidden",
          isFinal &&
            "ring-2 ring-primary/40 bg-gradient-to-br from-card to-primary/5",
          isPending && !isFinal && "opacity-80"
        )}
      >
        {isFinal && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
        )}
        <CardContent className="relative flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {roundLabel[match.stage]}
            </span>
            {isPending && (
              <Badge variant="outline" className="text-[0.6rem]">
                A DEFINIR
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamSide code={match.flag_home} name={match.team_home} side="left" />
            <span className="font-display text-xs text-muted-foreground">
              VS
            </span>
            <TeamSide code={match.flag_away} name={match.team_away} side="right" />
          </div>

          {!isPending && !isFinal && (
            <div className="flex items-center justify-center border-t border-border/40 pt-3">
              <ScoreInput fixture={match} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TeamSide({
  code,
  name,
  side,
}: {
  code: string | null;
  name: string | null;
  side: "left" | "right";
}) {
  if (!code || !name) {
    return (
      <div
        className={cn(
          "flex min-w-0 items-center gap-2",
          side === "right" && "flex-row-reverse text-right"
        )}
      >
        <span className="inline-block size-8 shrink-0 rounded-sm border border-dashed border-border bg-muted/30" />
        <div className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
          Ganador
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        side === "right" && "flex-row-reverse text-right"
      )}
    >
      <Flag code={code} width={32} />
      <div className="min-w-0 flex-1">
        <div className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
          {code}
        </div>
        <div className="truncate text-sm font-semibold text-foreground">
          {name}
        </div>
      </div>
    </div>
  );
}
