import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeaderboardRow } from "@/components/prode/LeaderboardRow";
import { leaderboard } from "@/data/leaderboard";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { formatPoints } from "@/lib/format";
import { useUser } from "@/stores/auth.store";

export function LeaderboardView() {
  const user = useUser();
  const navigate = useNavigate();

  return (
    <motion.div
      variants={staggerContainer(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      <motion.header variants={fadeUp} className="flex flex-col gap-2">
        <span className="font-mono-label text-[0.7rem] uppercase tracking-wider text-primary">
          Tabla General
        </span>
        <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
          Leaderboard
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Mirá cómo estás posicionado entre los mejores pronosticadores del
          torneo. Actualizado después de cada fecha.
        </p>
      </motion.header>

      <motion.div variants={fadeUp}>
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5" />
          <CardContent className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-accent/15 text-accent ring-1 ring-accent/30">
                <Crown className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                  Líder actual
                </span>
                <span className="font-display text-lg font-bold text-foreground">
                  {leaderboard[0].name} · {formatPoints(leaderboard[0].points)} pts
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/reglas")}>
                Ver reglas
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate("/eliminatorias")}>
                Hacer prode
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.04, 0.05)}
        className="flex flex-col gap-1"
      >
        {leaderboard.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
      </motion.div>

      {user && (
        <motion.div variants={fadeUp} className="text-center">
          <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Estás en el puesto <span className="text-foreground">{user.rank}º</span> con {formatPoints(user.points)} pts
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
