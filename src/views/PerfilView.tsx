import { motion } from "framer-motion";
import { Trophy, Target, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileHero } from "@/components/prode/ProfileHero";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { usePredictionsStore } from "@/stores/predictions.store";
import { groupMatches, knockoutMatches } from "@/data/matches";

export function PerfilView() {
  const count = usePredictionsStore((s) => Object.keys(s.byMatch).length);
  const total = groupMatches.length + knockoutMatches.length;

  return (
    <motion.div
      variants={staggerContainer(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      <ProfileHero />

      <motion.section variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Estadísticas
            </CardTitle>
            <CardDescription>
              Tu actividad en el torneo actual.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile
              icon={<Target className="size-4" />}
              label="Predicciones cargadas"
              value={`${count} / ${total}`}
              variant="default"
            />
            <StatTile
              icon={<Trophy className="size-4" />}
              label="Aciertos totales"
              value="0"
              variant="gold"
            />
            <StatTile
              icon={<Trophy className="size-4" />}
              label="Resultados exactos"
              value="0"
              variant="primary"
            />
          </CardContent>
        </Card>
      </motion.section>

      <motion.section variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle>Historial reciente</CardTitle>
            <CardDescription>
              Tus últimas predicciones en el torneo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {count === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Sin actividad
                </span>
                <p className="max-w-sm text-sm text-pretty text-muted-foreground">
                  Todavía no cargaste ninguna predicción. Empezá por la fase de
                  grupos o las eliminatorias.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Array.from({ length: count }).slice(0, 5).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md border border-border/40 bg-muted/20 px-3 py-2"
                  >
                    <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                      Partido · {i + 1}
                    </span>
                    <Badge variant="outline">Pendiente</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  );
}

function StatTile({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant: "default" | "gold" | "primary";
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${
        variant === "gold"
          ? "border-accent/30 bg-accent/5"
          : variant === "primary"
          ? "border-primary/30 bg-primary/5"
          : "border-border/40 bg-card"
      }`}
    >
      <span
        className={`inline-flex size-9 items-center justify-center rounded-md ${
          variant === "gold"
            ? "bg-accent/15 text-accent"
            : variant === "primary"
            ? "bg-primary/15 text-primary"
            : "bg-muted text-foreground"
        }`}
      >
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="font-display text-lg font-bold tabular-nums text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}
