import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePredictionsStore } from "@/stores/predictions.store";

type Props = {
  matchId: string;
  variant?: "default" | "compact";
};

export function ScoreInput({ matchId, variant = "default" }: Props) {
  const prediction = usePredictionsStore((s) => s.byMatch[matchId]);
  const savePrediction = usePredictionsStore((s) => s.savePrediction);

  const home = prediction?.homeScore;
  const away = prediction?.awayScore;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        variant === "compact" ? "text-xs" : "text-sm"
      )}
    >
      <ScoreField
        value={home}
        onChange={(v) =>
          savePrediction(matchId, v ?? 0, away ?? 0)
        }
      />
      <span className="font-mono-label text-[0.7rem] text-muted-foreground">
        VS
      </span>
      <ScoreField
        value={away}
        onChange={(v) =>
          savePrediction(matchId, home ?? 0, v ?? 0)
        }
      />
    </div>
  );
}

function ScoreField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const isEmpty = value === undefined;
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      className="relative"
    >
      <Input
        type="number"
        min={0}
        max={99}
        inputMode="numeric"
        value={value ?? ""}
        placeholder="-"
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") onChange(undefined);
          else onChange(Math.max(0, Math.min(99, Number(raw) || 0)));
        }}
        className={cn(
          "h-9 w-12 rounded-md border-0 border-b-2 border-border bg-muted/30 px-0 text-center font-display text-base font-bold tabular-nums transition-colors focus-visible:border-primary focus-visible:bg-muted/50",
          isEmpty && "text-muted-foreground/60"
        )}
      />
    </motion.div>
  );
}
