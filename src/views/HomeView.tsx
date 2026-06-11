import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Gavel, LayoutGrid, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveBadge } from "@/components/prode/LiveBadge";
import { Flag } from "@/lib/flags";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { useFixtures, useUpcomingMatches } from "@/hooks/useFixtures";

export function HomeView() {
  const { liveMatch, isLoading } = useFixtures();
  const { matches: upcomingMatches } = useUpcomingMatches(3);

  return (
    <motion.div
      variants={staggerContainer(0.06, 0.05)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      <motion.section
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/5 p-6 md:p-8"
      >
        <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-col gap-4">
          <span className="font-mono-label text-[0.7rem] uppercase tracking-wider text-primary">
            Pasión Mundialista
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
            Demostrá que sos el que más sabe
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            Carga tus pronósticos, sumá puntos en cada fecha y ganá la camiseta
            oficial de la selección.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild variant="gradient" size="lg">
              <Link to="/grupos">
                Cargar prode <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/reglas">Cómo se juega</Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {liveMatch && (
        <motion.section variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
              En vivo ahora
            </h2>
            <LiveBadge />
          </div>
          <Card className="relative overflow-hidden ring-1 ring-primary/40 glow-primary">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <CardContent className="relative grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto]">
              <TeamPreview
                flag={liveMatch.flag_home}
                name={liveMatch.team_home ?? "—"}
              />
              <span className="font-display text-2xl text-muted-foreground">
                {liveMatch.result_home ?? 0} - {liveMatch.result_away ?? 0}
              </span>
              <TeamPreview
                flag={liveMatch.flag_away}
                name={liveMatch.team_away ?? "—"}
                reverse
              />
              <div className="flex flex-col items-center gap-1 md:items-end">
                <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                  {liveMatch.stage === "GROUP"
                    ? `Grupo ${liveMatch.group_name ?? "?"}`
                    : liveMatch.stage}
                </span>
                <span className="font-display text-sm text-foreground">
                  {formatMatchTime(liveMatch.date)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}

      <motion.section variants={fadeUp} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            Próximos partidos
          </h2>
          <Link
            to="/grupos"
            className="font-mono-label text-[0.65rem] uppercase tracking-wider text-primary transition-colors hover:text-accent"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))
          ) : upcomingMatches.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-border/40 bg-muted/10 p-6 text-center">
              <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Sin partidos próximos
              </span>
            </div>
          ) : (
            upcomingMatches.map((m) => (
              <Card key={m.id} size="sm" className="hover:border-primary/30">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                      {formatMatchDate(m.date)} · {formatMatchTime(m.date)}
                    </span>
                    <Badge variant="outline" className="text-[0.6rem]">
                      {m.stage === "GROUP"
                        ? `GRUPO ${m.group_name ?? "?"}`
                        : m.stage}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Flag code={m.flag_home ?? "XX"} width={24} />
                      <span className="truncate text-sm font-semibold">
                        {m.team_home ?? "—"}
                      </span>
                    </div>
                    <span className="font-display text-xs text-muted-foreground">
                      VS
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <span className="truncate text-right text-sm font-semibold">
                        {m.team_away ?? "—"}
                      </span>
                      <Flag code={m.flag_away ?? "XX"} width={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="grid grid-cols-1 gap-3 md:grid-cols-3"
      >
        <QuickAction
          to="/grupos"
          icon={<LayoutGrid className="size-5" />}
          title="Fase de Grupos"
          description="Pronosticá los partidos de cada zona."
        />
        <QuickAction
          to="/eliminatorias"
          icon={<Gavel className="size-5" />}
          title="Eliminatorias"
          description="Armá tu camino hacia la final."
        />
        <QuickAction
          to="/leaderboard"
          icon={<Trophy className="size-5" />}
          title="Leaderboard"
          description="Mirá cómo estás posicionado."
        />
      </motion.section>
    </motion.div>
  );
}

function TeamPreview({
  flag,
  name,
  reverse,
}: {
  flag: string | null;
  name: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        reverse ? "flex-row-reverse text-right" : ""
      }`}
    >
      <Flag code={flag ?? "XX"} width={48} />
      <div>
        <div className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
          {flag ?? "—"}
        </div>
        <div className="font-display text-xl font-bold leading-tight tracking-tight text-foreground">
          {name}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link to={to}>
      <Card className="transition-colors hover:border-primary/30">
        <CardContent className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/30">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="text-xs text-pretty text-muted-foreground">
              {description}
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
