import { useRef } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePrediction, useSavePrediction } from "@/hooks/usePredictions";
import type { Fixture } from "@/types";

type Props = {
  fixture: Fixture;
  variant?: "default" | "compact";
};

const EDITABLE_STATUSES = new Set(["SCHEDULED", "TIMED"]);

function isEditable(fixture: Fixture): boolean {
  if (!EDITABLE_STATUSES.has(fixture.status)) return false;
  return new Date(fixture.date).getTime() > Date.now();
}

function parseScore(raw: string): number | undefined {
  if (raw === "") return undefined;
  const n = Number(raw);
  if (Number.isNaN(n)) return undefined;
  return Math.max(0, Math.min(99, Math.floor(n)));
}

export function ScoreInput({ fixture, variant = "default" }: Props) {
  const prediction = usePrediction(fixture.id);
  const save = useSavePrediction();
  const editable = isEditable(fixture);

  const homeRef = useRef<HTMLInputElement>(null);
  const awayRef = useRef<HTMLInputElement>(null);

  const resetKey = `${fixture.id}-${prediction?.id ?? "empty"}`;

  const commit = () => {
    if (!editable) return;
    const home = parseScore(homeRef.current?.value ?? "");
    const away = parseScore(awayRef.current?.value ?? "");
    if (home === undefined || away === undefined) return;
    if (
      home === prediction?.pred_home &&
      away === prediction?.pred_away
    ) {
      return;
    }
    save.mutate({ fixtureId: fixture.id, homeScore: home, awayScore: away });
  };

  return (
    <div
      key={resetKey}
      className={cn(
        "flex items-center gap-1.5",
        variant === "compact" ? "text-xs" : "text-sm"
      )}
    >
      <ScoreField
        inputRef={homeRef}
        defaultValue={prediction?.pred_home}
        disabled={!editable}
        onCommit={commit}
      />
      <span className="font-mono-label text-[0.7rem] text-muted-foreground">
        VS
      </span>
      <ScoreField
        inputRef={awayRef}
        defaultValue={prediction?.pred_away}
        disabled={!editable}
        onCommit={commit}
      />
    </div>
  );
}

function ScoreField({
  inputRef,
  defaultValue,
  disabled,
  onCommit,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  defaultValue: number | undefined;
  disabled?: boolean;
  onCommit: () => void;
}) {
  const isEmpty = defaultValue === undefined;
  return (
    <motion.div whileTap={{ scale: 0.96 }} className="relative">
      <Input
        ref={inputRef}
        type="number"
        min={0}
        max={99}
        inputMode="numeric"
        disabled={disabled}
        defaultValue={defaultValue ?? ""}
        placeholder="-"
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className={cn(
          "h-9 w-12 rounded-md border-0 border-b-2 border-border bg-muted/30 px-0 text-center font-display text-base font-bold tabular-nums transition-colors focus-visible:border-primary focus-visible:bg-muted/50",
          isEmpty && "text-muted-foreground/60",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      />
    </motion.div>
  );
}
