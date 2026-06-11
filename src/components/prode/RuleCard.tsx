import { motion } from "framer-motion";
import { Award, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cardHover, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Flag } from "@/lib/flags";
import { getCountryName } from "@/data/countries";

type Props = {
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  highlight?: boolean;
  chosenChampion?: string;
};

export function RuleCard({ title, description, badge, icon: Icon, highlight, chosenChampion }: Props) {
  return (
    <motion.div variants={fadeUp} {...cardHover}>
      <Card
        className={cn(
          "relative overflow-hidden",
          highlight && "ring-2 ring-accent/40 bg-gradient-to-br from-card to-accent/5"
        )}
      >
        {highlight && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-primary/8" />
        )}
        <CardContent className="relative flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md ring-1",
                highlight
                  ? "bg-accent/15 text-accent ring-accent/30"
                  : "bg-primary/10 text-primary ring-primary/30"
              )}
            >
              <Icon className="size-5" />
            </span>
            <Badge variant={highlight ? "gold" : "default"}>{badge}</Badge>
          </div>
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm text-pretty text-muted-foreground">
            {description}
          </p>
          {chosenChampion && (
            <div className="mt-auto pt-3 border-t border-border/20 flex flex-col gap-1.5">
              <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                Tu Campeón:
              </span>
              <div className="inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/30 px-3 py-1.5 text-xs font-semibold text-accent self-start">
                <Flag code={chosenChampion} width={20} />
                <span>{getCountryName(chosenChampion)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RewardIcon({ className }: { className?: string }) {
  return <Award className={cn("size-5", className)} />;
}
