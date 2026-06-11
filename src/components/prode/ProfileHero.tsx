import { motion } from "framer-motion";
import { LogOut, Settings, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePlayer, useLogout } from "@/stores/auth.store";
import { useCurrentUserStats } from "@/hooks/useLeaderboard";
import { formatOrdinal, formatPoints } from "@/lib/format";
import { fadeUp, scaleIn } from "@/lib/motion";

export function ProfileHero() {
  const player = usePlayer();
  const logout = useLogout();
  const navigate = useNavigate();
  const stats = useCurrentUserStats();

  if (!player) return null;

  const displayName = player.username;
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    try {
      logout();
      toast.success("Listo, ya podés entrar con otro DNI.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No pudimos cerrar la sesión."
      );
    }
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-primary/15 blur-3xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        <CardContent className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <motion.div variants={scaleIn}>
              <Avatar size="lg" className="size-20 ring-2 ring-primary/40">
                <AvatarFallback className="font-display text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="flex flex-col gap-1">
              <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Mi Perfil
              </span>
              <h1 className="font-display text-3xl font-extrabold leading-none tracking-tight text-foreground md:text-4xl">
                {displayName}
              </h1>
              <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                Jugador · {player.id.slice(0, 8)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-end gap-1 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5">
              <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-primary">
                Puntos
              </span>
              <span className="font-display text-2xl font-extrabold leading-none text-foreground tabular-nums">
                {formatPoints(stats.points)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 rounded-lg border border-border/40 bg-muted/30 px-4 py-2.5">
              <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                Ranking
              </span>
              <span className="font-display text-2xl font-extrabold leading-none text-foreground tabular-nums">
                {stats.rank > 0 ? formatOrdinal(stats.rank) : "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {stats.exactHits > 0 && (
          <Badge variant="default">
            <Trophy className="size-3" /> {stats.exactHits} exactos
          </Badge>
        )}
        {stats.winnerHits > 0 && (
          <Badge variant="gold">{stats.winnerHits} aciertos</Badge>
        )}
        {stats.predictionsCount > 0 && (
          <Badge variant="bronze">
            {stats.predictionsCount} pronósticos cargados
          </Badge>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Settings /> Preferencias
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut /> Cambiar de usuario
        </Button>
      </div>
    </motion.div>
  );
}
