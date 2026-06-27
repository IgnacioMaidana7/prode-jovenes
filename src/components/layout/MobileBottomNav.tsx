import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Gavel, LayoutGrid, Trophy, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/grupos", label: "Grupos", icon: LayoutGrid },
  { to: "/eliminatorias", label: "Eliminatorias", icon: GitBranch },
  { to: "/leaderboard", label: "Tabla", icon: Trophy },
  { to: "/reglas", label: "Reglas", icon: Gavel },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-sidebar/95 backdrop-blur-md lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 text-[0.65rem] font-medium uppercase tracking-wider transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="mobile-nav-pill"
                      className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
