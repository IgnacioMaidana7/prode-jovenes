import { motion } from "framer-motion";
import { Flag } from "@/lib/flags";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LiveBadge } from "@/components/prode/LiveBadge";
import { ScoreInput } from "@/components/prode/ScoreInput";
import { cardHover, fadeUp } from "@/lib/motion";
import { getTeam } from "@/data/teams";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import type { GroupMatch } from "@/data/matches";
import { cn } from "@/lib/utils";

type Props = {
  match: GroupMatch;
};

export function GroupMatchCard({ match }: Props) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);
  const isLive = match.status === "live";

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
            ) : (
              <Badge variant="outline" className="text-[0.6rem]">
                PRONOSTICÁ
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <TeamSide code={match.home} name={home?.name ?? match.home} side="left" />
            <div className="font-display text-xs text-muted-foreground">VS</div>
            <TeamSide code={match.away} name={away?.name ?? match.away} side="right" />
          </div>

          <div className="flex items-center justify-center border-t border-border/40 pt-3">
            <ScoreInput matchId={match.id} />
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
  code: string;
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
