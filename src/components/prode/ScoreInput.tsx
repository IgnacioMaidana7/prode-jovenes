import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Flag } from "@/lib/flags";
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
  const isKnockout = fixture.stage !== "GROUP";

  const homeRef = useRef<HTMLInputElement>(null);
  const awayRef = useRef<HTMLInputElement>(null);

  const [liveHome, setLiveHome] = useState<number | undefined>(prediction?.pred_home);
  const [liveAway, setLiveAway] = useState<number | undefined>(prediction?.pred_away);
  const [tiebreakWinner, setTiebreakWinner] = useState<string | null>(
    prediction?.tiebreak_winner ?? null
  );

  useEffect(() => {
    setLiveHome(prediction?.pred_home);
    setLiveAway(prediction?.pred_away);
    setTiebreakWinner(prediction?.tiebreak_winner ?? null);
  }, [prediction?.pred_home, prediction?.pred_away, prediction?.tiebreak_winner]);

  const resetKey = `${fixture.id}-${prediction?.id ?? "empty"}`;

  const isDraw =
    isKnockout &&
    liveHome !== undefined &&
    liveAway !== undefined &&
    liveHome === liveAway;

  const commit = (overrideTW?: string | null) => {
    if (!editable) return;
    const home = parseScore(homeRef.current?.value ?? "");
    const away = parseScore(awayRef.current?.value ?? "");
    if (home === undefined || away === undefined) return;

    const tw =
      isKnockout && home === away
        ? overrideTW !== undefined
          ? overrideTW
          : tiebreakWinner
        : null;

    if (
      home === prediction?.pred_home &&
      away === prediction?.pred_away &&
      tw === (prediction?.tiebreak_winner ?? null)
    ) {
      return;
    }

    save.mutate({
      fixtureId: fixture.id,
      homeScore: home,
      awayScore: away,
      tiebreakWinner: tw,
    });
  };

  const handleTiebreakSelect = (code: string) => {
    if (!editable) return;
    const newTW = tiebreakWinner === code ? null : code;
    setTiebreakWinner(newTW);
    commit(newTW);
  };

  return (
    <div
      key={resetKey}
      className={cn(
        "flex flex-col items-center gap-2",
        variant === "compact" ? "text-xs" : "text-sm"
      )}
    >
      <div className="flex items-center gap-1.5">
        <ScoreField
          inputRef={homeRef}
          defaultValue={prediction?.pred_home}
          disabled={!editable}
          onCommit={commit}
          onLiveChange={setLiveHome}
        />
        <span className="font-mono-label text-[0.7rem] text-muted-foreground">
          VS
        </span>
        <ScoreField
          inputRef={awayRef}
          defaultValue={prediction?.pred_away}
          disabled={!editable}
          onCommit={commit}
          onLiveChange={setLiveAway}
        />
      </div>

      {isDraw && (
        <div className="flex flex-col items-center gap-1.5 w-full">
          <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            ¿Quién pasa de ronda?
          </span>
          <div className="flex gap-2 justify-center">
            <TiebreakButton
              code={fixture.flag_home}
              name={fixture.team_home}
              selected={tiebreakWinner === fixture.flag_home}
              disabled={!editable}
              onClick={() =>
                fixture.flag_home && handleTiebreakSelect(fixture.flag_home)
              }
            />
            <TiebreakButton
              code={fixture.flag_away}
              name={fixture.team_away}
              selected={tiebreakWinner === fixture.flag_away}
              disabled={!editable}
              onClick={() =>
                fixture.flag_away && handleTiebreakSelect(fixture.flag_away)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TiebreakButton({
  code,
  name,
  selected,
  disabled,
  onClick,
}: {
  code: string | null;
  name: string | null;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  if (!code || !name) return null;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold transition-colors",
        selected
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-muted/20 text-muted-foreground hover:border-primary/50 hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <Flag code={code} width={16} />
      <span>{name}</span>
    </button>
  );
}

function ScoreField({
  inputRef,
  defaultValue,
  disabled,
  onCommit,
  onLiveChange,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  defaultValue: number | undefined;
  disabled?: boolean;
  onCommit: () => void;
  onLiveChange?: (value: number | undefined) => void;
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
        onChange={(e) => onLiveChange?.(parseScore(e.target.value))}
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
