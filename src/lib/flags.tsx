import { cn } from "@/lib/utils";

type FlagProps = {
  code: string;
  className?: string;
  width?: number;
};

const SPECIAL_FLAGS: Record<string, string> = {
  "GB-ENG": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "GB-SCT": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  "GB-WLS": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}",
  "GB-NIR": "\u{1F1EC}\u{1F1E7}",
};

function codeToEmoji(code: string): string {
  if (!code) return "🏳️";
  const upper = code.toUpperCase();
  if (SPECIAL_FLAGS[upper]) return SPECIAL_FLAGS[upper];
  if (upper.length !== 2) return "🏳️";
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
