import { motion } from "framer-motion";
import { Flag } from "@/lib/flags";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreInput } from "@/components/prode/ScoreInput";
import { cardHover, fadeUp } from "@/lib/motion";
import { getTeam } from "@/data/teams";
import { cn } from "@/lib/utils";
import type { KnockoutMatch, KnockoutRound } from "@/data/matches";

const roundLabel: Record<KnockoutRound, string> = {
  R16: "Octavos",
  QF: "Cuartos",
  SF: "Semis",
  F: "Final",
};

type Props = {
  match: KnockoutMatch;
  variant?: "default" | "final";
};

export function BracketNode({ match }: Props) {
  const isPending = !match.home || !match.away;
  const isFinal = match.round === "F";

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
          isFinal && "ring-2 ring-primary/40 bg-gradient-to-br from-card to-primary/5",
          isPending && !isFinal && "opacity-80"
        )}
      >
        {isFinal && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
        )}
        <CardContent className="relative flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
              {roundLabel[match.round]}
            </span>
            {isPending && (
              <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-accent">
                A definir
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <TeamRow
              code={match.home}
              isWinner={isFinal && !isPending}
            />
            <div className="h-px w-full bg-border/40" />
            <TeamRow
              code={match.away}
              isWinner={isFinal && !isPending}
            />
          </div>

          {!isPending && !isFinal && (
            <div className="flex items-center justify-center border-t border-border/40 pt-2.5">
              <ScoreInput matchId={match.id} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TeamRow({
  code,
  isWinner,
}: {
  code: string | null;
  isWinner?: boolean;
}) {
  if (!code) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="inline-block size-7 rounded-sm border border-dashed border-border bg-muted/30" />
        <div className="flex-1 font-mono-label text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          Ganador
        </div>
      </div>
    );
  }
  const team = getTeam(code);
  return (
    <div className="flex items-center gap-2.5">
      <Flag code={code} width={28} />
      <div className="flex-1 truncate text-sm font-semibold text-foreground">
        {team?.name ?? code}
      </div>
      {isWinner && (
        <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-accent">
          Finalista
        </span>
      )}
    </div>
  );
}
