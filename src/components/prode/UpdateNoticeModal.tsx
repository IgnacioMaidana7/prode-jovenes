import { useState } from "react";
import { RefreshCw, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const NOTICE_KEY = "prode_update_notice_v3";

function hasSeenNotice() {
  try {
    return localStorage.getItem(NOTICE_KEY) === "seen";
  } catch {
    return true;
  }
}

function markNoticeSeen() {
  try {
    localStorage.setItem(NOTICE_KEY, "seen");
  } catch {
    // ignore
  }
}

export function UpdateNoticeModal() {
  const [open, setOpen] = useState(() => !hasSeenNotice());

  const handleClose = () => {
    markNoticeSeen();
    setOpen(false);
  };

  const handleReload = () => {
    markNoticeSeen();
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/15">
              <Zap className="size-3.5 text-primary" />
            </span>
            <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-primary">
              Actualización
            </span>
          </div>
          <DialogTitle>Nuevas reglas de eliminatorias</DialogTitle>
          <DialogDescription>
            Ahora en los cruces de eliminatorias, si pronosticás empate tenés
            que elegir qué equipo pasa de ronda. El puntaje es el siguiente:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm">
          <ScoreRow
            label="Empate exacto + equipo correcto"
            points={10}
            highlight
          />
          <ScoreRow
            label="Empate (no exacto) — cualquier equipo"
            points={5}
          />
          <ScoreRow
            label="Empate exacto + equipo incorrecto"
            points={5}
          />
          <div className="my-1 border-t border-border/30" />
          <ScoreRow label="Ganador correcto (sin empate)" points={5} />
          <ScoreRow label="Resultado exacto (sin empate)" points={10} highlight />
        </div>

        <p className="text-xs text-muted-foreground">
          Si la página sigue mostrando la versión vieja, recargala con el botón
          de abajo.
        </p>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={handleReload} className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Recargar página
          </Button>
          <Button size="sm" onClick={handleClose}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScoreRow({
  label,
  points,
  highlight = false,
}: {
  label: string;
  points: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={highlight ? "text-foreground font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={`font-mono-label text-xs font-bold tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        +{points} pts
      </span>
    </div>
  );
}
