import { motion } from "framer-motion";
import { Stars, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cardHover, fadeUp, shimmerTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  prize: string;
  description: string;
  ctaLabel: string;
  onCta?: () => void;
};

export function PrizeCard({
  title,
  prize,
  description,
  ctaLabel,
  onCta,
}: Props) {
  return (
    <motion.div variants={fadeUp} {...cardHover}>
      <Card className="relative overflow-hidden ring-1 ring-accent/40">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={shimmerTransition}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <CardContent className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-accent/15 text-accent ring-1 ring-accent/30">
                <Stars className="size-5" />
              </span>
              <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                {title}
              </span>
            </div>
            <h3 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-foreground md:text-3xl">
              {prize}
            </h3>
            <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
              {description}
            </p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            onClick={onCta}
            className={cn("shrink-0 gap-2 self-start md:self-auto")}
          >
            {ctaLabel}
            <ArrowRight />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
