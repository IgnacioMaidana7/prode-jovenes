import { cn } from "@/lib/utils";

type FlagProps = {
  code: string;
  className?: string;
  width?: number;
};

function codeToEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳️";
  const upper = code.toUpperCase();
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  return String.fromCodePoint(
    A + (upper.charCodeAt(0) - base),
    A + (upper.charCodeAt(1) - base)
  );
}

export function Flag({ code, className, width = 24 }: FlagProps) {
  const upper = code.toUpperCase();
  const emoji = codeToEmoji(code);
  return (
    <span
      role="img"
      aria-label={upper}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-muted/40 shadow-sm shadow-black/40 ring-1 ring-border/40",
        className
      )}
      style={{
        width,
        height: Math.round((width * 3) / 4),
        fontSize: Math.round(width * 0.85),
        lineHeight: 1,
      }}
    >
      <span
        className="leading-none"
        style={{ fontFamily: '"Twemoji Country Flags", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}
      >
        {emoji}
      </span>
    </span>
  );
}
