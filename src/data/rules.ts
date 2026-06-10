import { CheckCircle2, Trophy, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Rule = {
  id: string;
  title: string;
  description: string;
  points: number;
  badge: string;
  icon: LucideIcon;
};

export const rules: Rule[] = [
  {
    id: "winner",
    badge: "+5 PTS",
    title: "Adivinar Ganador",
    description:
      "Acertá qué equipo gana el partido o si termina en empate. La base de todo buen pronóstico.",
    points: 5,
    icon: Target,
  },
  {
    id: "exact",
    badge: "+10 PTS",
    title: "Resultado Exacto",
    description:
      "Clavala en el ángulo adivinando la cantidad exacta de goles de cada equipo. Doble mérito.",
    points: 10,
    icon: CheckCircle2,
  },
  {
    id: "champion",
    badge: "+50 PTS",
    title: "Campeón del Torneo",
    description:
      "Pronóstico a largo plazo. Elegí al equipo que levantará la copa al final del certamen antes del inicio.",
    points: 50,
    icon: Trophy,
  },
];

export const scoring = {
  winner: 5,
  exact: 10,
  champion: 50,
};
