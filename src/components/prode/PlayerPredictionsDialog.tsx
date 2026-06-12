import { CheckCircle2, Target, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flag } from "@/lib/flags";
import { cn } from "@/lib/utils";
import { formatMatchDate } from "@/lib/format";
import { usePlayerRecentPredictions } from "@/hooks/useLeaderboard";
import type { LeaderboardEntry } from "@/types";

type Props = {
  entry: LeaderboardEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function PointsBadge({ points }: { points: number | null }) {
  if (points === null || points === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
        <XCircle className="size-3" />
        0 pts
      </span>
    );
  }
  if (points >= 10) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 font-mono text-[0.65rem] text-accent ring-1 ring-accent/30">
        <CheckCircle2 className="size-3" />
        {points} pts
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[0.65rem] text-primary ring-1 ring-primary/20">
      <Target className="size-3" />
      {points} pts
    </span>
  );
}

export function PlayerPredictionsDialog({ entry, open, onOpenChange }: Props) {
  const { data: predictions, isLoading } = usePlayerRecentPredictions(
    open ? entry?.player_id : undefined
  );

  const displayName = entry?.username ?? "Hincha";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              {entry?.avatar_url && (
                <AvatarImage src={entry.avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="bg-accent/15 text-accent">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{displayName}</DialogTitle>
              <p className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Últimos 5 partidos jugados
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : !predictions || predictions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/40 bg-muted/10 py-6 text-center font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              Sin pronósticos de partidos jugados
            </p>
          ) : (
            predictions.map((pred) => {
              const f = pred.fixture!;
              const isExact = (pred.points ?? 0) >= 10;
              const isWinner = (pred.points ?? 0) === 5;
              return (
                <div
                  key={pred.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border/30 bg-muted/10 px-3 py-2.5",
                    isExact && "border-accent/30 bg-accent/5",
                    isWinner && "border-primary/20 bg-primary/5"
                  )}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      {f.flag_home && <Flag code={f.flag_home} width={16} />}
                      <span className="truncate">{f.team_home}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span className="truncate">{f.team_away}</span>
                      {f.flag_away && <Flag code={f.flag_away} width={16} />}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                        {formatMatchDate(f.date)}
                      </span>
                      <span className="font-mono text-[0.7rem] text-muted-foreground">
                        Pronóstico:{" "}
                        <span className="font-bold text-foreground">
                          {pred.pred_home}–{pred.pred_away}
                        </span>
                      </span>
                      <span className="font-mono text-[0.7rem] text-muted-foreground">
                        Real:{" "}
                        <span className="font-bold text-foreground">
                          {f.result_home}–{f.result_away}
                        </span>
                      </span>
                    </div>
                  </div>
                  <PointsBadge points={pred.points} />
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
