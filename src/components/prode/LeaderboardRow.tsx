import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fadeUp } from "@/lib/motion";
import { formatOrdinal, formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

type Props = {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  onClick?: () => void;
};

export function LeaderboardRow({ entry, isCurrentUser = false, onClick }: Props) {
  const isTop3 = entry.rank <= 3;
  const displayName = entry.username ?? "Hincha";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      variants={fadeUp}
      onClick={onClick}
      className={cn(
        "group/row relative flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border/40 hover:bg-muted/20",
        isTop3 && "border-accent/30 bg-gradient-to-r from-accent/5 to-transparent",
        isCurrentUser && "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
        onClick && "cursor-pointer"
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
        {entry.avatar_url && (
          <AvatarImage src={entry.avatar_url} alt={displayName} />
        )}
        <AvatarFallback
          className={cn(
            isTop3 ? "bg-accent/15 text-accent" : "bg-muted text-foreground"
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-sm font-semibold",
            isCurrentUser ? "text-primary" : "text-foreground"
          )}
        >
          {displayName}
          {isCurrentUser && (
            <span className="font-mono-label ml-2 text-[0.6rem] uppercase tracking-wider text-primary">
              Vos
            </span>
          )}
        </span>
        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          {entry.predictions_count} pronósticos · {entry.exact_hits} exactos
        </span>
      </div>

      <div className="flex flex-col items-end">
        <span className="font-display text-lg font-bold tabular-nums leading-none text-foreground">
          {formatPoints(entry.total_points)}
        </span>
        <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
          PTS
        </span>
      </div>
    </motion.div>
  );
}
