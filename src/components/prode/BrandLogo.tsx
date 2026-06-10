import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
  withSub?: boolean;
};

export function BrandLogo({ className, size = "md", withSub = true }: Props) {
  const sizes = {
    sm: { text: "text-base", sub: "text-[0.6rem]" },
    md: { text: "text-xl", sub: "text-[0.65rem]" },
    lg: { text: "text-3xl", sub: "text-xs" },
  };
  const s = sizes[size];

  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span
        className={cn(
          "font-display font-extrabold tracking-tighter",
          s.text
        )}
      >
        <span className="gradient-accent-text">PRODE</span>{" "}
        <span className="text-foreground">ARGENTINA</span>
      </span>
      {withSub && (
        <span
          className={cn(
            "font-mono-label mt-0.5 uppercase text-muted-foreground",
            s.sub
          )}
        >
          Mundialista · 2026
        </span>
      )}
    </div>
  );
}
