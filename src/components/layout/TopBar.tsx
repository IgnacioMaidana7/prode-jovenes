import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { BrandLogo } from "@/components/prode/BrandLogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePlayer } from "@/stores/auth.store";
import { usePredictions } from "@/hooks/usePredictions";

export function TopBar() {
  const player = usePlayer();
  const { count: predictionsCount } = usePredictions();

  const displayName = player?.username ?? "Hincha";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-md lg:hidden">
      <Link to="/">
        <BrandLogo size="sm" withSub={false} />
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notificaciones"
          className="relative"
        >
          <Bell />
          {predictionsCount > 0 && (
            <span className="font-mono-label absolute -top-0.5 -right-0.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
              {predictionsCount}
            </span>
          )}
        </Button>
        <Link to="/perfil">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
