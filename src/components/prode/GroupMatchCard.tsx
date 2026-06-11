import { motion } from "framer-motion";
import { Flag } from "@/lib/flags";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LiveBadge } from "@/components/prode/LiveBadge";
import { ScoreInput } from "@/components/prode/ScoreInput";
import { cardHover, fadeUp } from "@/lib/motion";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import type { Fixture } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  match: Fixture;
};

const LIVE_STATUSES = new Set(["LIVE", "IN_PLAY", "PAUSED"]);

export function GroupMatchCard({ match }: Props) {
  const isLive = LIVE_STATUSES.has(match.status);
  const isFinished = match.status === "FINISHED";

  return (
    <motion.div variants={fadeUp} {...cardHover}>
      <Card
        size="sm"
        className={cn(
          "relative overflow-hidden",
          isLive && "ring-primary/40 glow-primary"
        )}
      >
        {isLive && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        )}
        <CardContent className="relative flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {formatMatchDate(match.date)} · {formatMatchTime(match.date)}
            </span>
            {isLive ? (
              <LiveBadge />
            ) : isFinished ? (
              <Badge variant="outline" className="text-[0.6rem]">
                FINALIZADO
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[0.6rem]">
                PRONOSTICÁ
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamSide
              code={match.flag_home}
              name={match.team_home ?? "—"}
              side="left"
            />
            <div className="font-display text-xs text-muted-foreground">
              {isFinished ? (
                <span className="font-display text-base font-bold tabular-nums text-foreground">
                  {match.result_home ?? 0} - {match.result_away ?? 0}
                </span>
              ) : (
                "VS"
              )}
            </div>
            <TeamSide
              code={match.flag_away}
              name={match.team_away ?? "—"}
              side="right"
            />
          </div>

          <div className="flex items-center justify-center border-t border-border/40 pt-3">
            <ScoreInput fixture={match} />
          </div>
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
  name: string;
  side: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        side === "right" && "flex-row-reverse text-right"
      )}
    >
      <Flag code={code ?? "XX"} width={32} />
      <div className="min-w-0 flex-1">
        <div className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
          {code ?? "—"}
        </div>
        <div className="truncate text-sm font-semibold text-foreground">
          {name}
        </div>
      </div>
    </div>
  );
}
