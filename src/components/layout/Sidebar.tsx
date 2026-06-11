import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Home,
  Gavel,
  LayoutGrid,
  GitBranch,
  Trophy,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/prode/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePlayer, useLogout } from "@/stores/auth.store";
import { useCurrentUserStats } from "@/hooks/useLeaderboard";
import { formatPoints } from "@/lib/format";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

const items: NavItem[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/reglas", label: "Reglas", icon: Gavel },
  { to: "/grupos", label: "Fase de Grupos", icon: LayoutGrid },
  { to: "/eliminatorias", label: "Eliminatorias", icon: GitBranch },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Sidebar() {
  const player = usePlayer();
  const logout = useLogout();
  const navigate = useNavigate();
  const stats = useCurrentUserStats();

  const displayName = player?.username ?? "Invitado";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    try {
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No pudimos cerrar la sesión."
      );
    }
  };

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border/40 bg-sidebar lg:flex">
      <div className="flex items-center justify-between px-5 py-5">
        <BrandLogo size="sm" />
        <Button variant="ghost" size="icon-sm" aria-label="Notificaciones">
          <Bell />
        </Button>
      </div>

      <div className="px-3">
        <div className="rounded-lg border border-border/40 bg-card/40 p-3">
          <div className="flex items-center gap-3">
            <Avatar size="default">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                {formatPoints(stats.points)} pts
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "group/nav relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-pill"
                        className="absolute inset-0 rounded-md bg-primary/15 ring-1 ring-primary/30"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <item.icon className="relative z-10 size-4" />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border/40 p-3">
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-muted/60 text-foreground"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )
          }
        >
          <User className="size-4" />
          Mi Perfil
        </NavLink>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Cambiar de nombre
        </button>
      </div>
    </aside>
  );
}
