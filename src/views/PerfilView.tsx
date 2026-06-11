import { motion } from "framer-motion";
import { Trophy, Target, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "@/lib/flags";
import { usePlayer } from "@/stores/auth.store";
import { getCountryName } from "@/data/countries";
import { ProfileHero } from "@/components/prode/ProfileHero";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { usePredictions } from "@/hooks/usePredictions";
import { useFixtures } from "@/hooks/useFixtures";
import { useCurrentUserStats } from "@/hooks/useLeaderboard";
import { formatMatchDate } from "@/lib/format";

export function PerfilView() {
  const player = usePlayer();
  const stats = useCurrentUserStats();
  const { predictions, isLoading: loadingPredictions } = usePredictions();
  const { fixtures, isLoading: loadingFixtures } = useFixtures();

  const totalFixtures = fixtures.length;
  const totalPredictions = predictions.length;

  const fixturesById = new Map(fixtures.map((f) => [f.id, f]));

  const history = predictions.slice(0, 5).map((p) => ({
    prediction: p,
    fixture: fixturesById.get(p.fixture_id),
  }));

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
          <CardContent className={`grid grid-cols-1 gap-3 ${player?.champion ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
            <StatTile
              icon={<Target className="size-4" />}
              label="Predicciones cargadas"
              value={
                loadingFixtures || loadingPredictions
                  ? "…"
                  : `${totalPredictions} / ${totalFixtures}`
              }
              variant="default"
            />
            <StatTile
              icon={<Trophy className="size-4" />}
              label="Aciertos totales"
              value={stats.isLoading ? "…" : String(stats.winnerHits)}
              variant="gold"
            />
            <StatTile
              icon={<Trophy className="size-4" />}
              label="Resultados exactos"
              value={stats.isLoading ? "…" : String(stats.exactHits)}
              variant="primary"
            />
            {player?.champion && (
              <StatTile
                icon={<Trophy className="size-4" />}
                label="Mi Campeón"
                value={
                  <div className="flex items-center gap-1.5 font-semibold text-accent">
                    <Flag code={player.champion} width={20} />
                    <span className="truncate">{getCountryName(player.champion)}</span>
                  </div>
                }
                variant="gold"
              />
            )}
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
            {loadingPredictions ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : history.length === 0 ? (
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
                {history.map(({ prediction, fixture }) => {
                  const points = prediction.points;
                  const badgeVariant =
                    points === null
                      ? "outline"
                      : points >= 3
                      ? "gold"
                      : points >= 1
                      ? "default"
                      : "outline";
                  const badgeLabel =
                    points === null
                      ? "Pendiente"
                      : points === 0
                      ? "0 pts"
                      : `+${points} pts`;

                  return (
                    <div
                      key={prediction.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/20 px-3 py-2"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {fixture ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Flag code={fixture.flag_home ?? "XX"} width={20} />
                              <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                                vs
                              </span>
                              <Flag code={fixture.flag_away ?? "XX"} width={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-foreground">
                                {fixture.team_home} vs {fixture.team_away}
                              </p>
                              <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                                {formatMatchDate(fixture.date)} ·{" "}
                                {prediction.pred_home}-{prediction.pred_away}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                            Partido · {prediction.fixture_id.slice(0, 6)}
                          </span>
                        )}
                      </div>
                      <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                    </div>
                  );
                })}
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
  value: React.ReactNode;
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
