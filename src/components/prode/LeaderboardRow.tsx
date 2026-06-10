import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fadeUp } from "@/lib/motion";
import { formatOrdinal, formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/data/leaderboard";

type Props = {
  entry: LeaderboardEntry;
};

export function LeaderboardRow({ entry }: Props) {
  const isTop3 = entry.rank <= 3;
  const initials = entry.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const TrendIcon =
    entry.trend === "up" ? ArrowUp : entry.trend === "down" ? ArrowDown : Minus;
  const trendColor =
    entry.trend === "up"
      ? "text-primary"
      : entry.trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "group/row relative flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border/40 hover:bg-muted/20",
        isTop3 && "border-accent/30 bg-gradient-to-r from-accent/5 to-transparent",
        entry.isCurrentUser && "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      <span
        className={cn(
          "font-display text-2xl font-extrabold tabular-nums leading-none",
          isTop3 ? "text-accent" : "text-muted-foreground"
        )}
      >
        {formatOrdinal(entry.rank)}
      </span>

      <Avatar size={isTop3 ? "default" : "sm"}>
        <AvatarFallback
          className={cn(
            isTop3
              ? "bg-accent/15 text-accent"
              : "bg-muted text-foreground"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-sm font-semibold",
            entry.isCurrentUser ? "text-primary" : "text-foreground"
          )}
        >
          {entry.name}
          {entry.isCurrentUser && (
            <span className="font-mono-label ml-2 text-[0.6rem] uppercase tracking-wider text-primary">
              Vos
            </span>
          )}
        </span>
        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          {isTop3 ? "Top 3" : "Posición"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <TrendIcon className={cn("size-3.5", trendColor)} />
          <span className={cn("font-mono-label text-[0.7rem]", trendColor)}>
            {entry.trendDelta > 0 ? "+" : ""}
            {entry.trendDelta}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-display text-lg font-bold tabular-nums leading-none text-foreground">
            {formatPoints(entry.points)}
          </span>
          <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            PTS
          </span>
        </div>
      </div>
    </motion.div>
  );
}
