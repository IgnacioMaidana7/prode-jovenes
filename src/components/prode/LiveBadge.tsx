import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { livePulse } from "@/lib/motion";

type Props = {
  label?: string;
  className?: string;
};

export function LiveBadge({ label = "EN VIVO", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/15 px-2 py-0.5 font-mono-label text-[0.65rem] font-medium uppercase tracking-wider text-primary",
        className
      )}
    >
      <motion.span
        variants={livePulse}
        initial="initial"
        animate="animate"
        className="inline-block size-1.5 rounded-full bg-primary glow-primary"
      />
      {label}
    </span>
  );
}
