import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RuleCard } from "@/components/prode/RuleCard";
import { PrizeCard } from "@/components/prode/PrizeCard";
import { rules } from "@/data/rules";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function ReglasView() {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={staggerContainer(0.08, 0.1)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <motion.header variants={fadeUp} className="flex flex-col gap-3">
        <span className="font-mono-label text-[0.7rem] uppercase tracking-wider text-primary">
          Reglamento
        </span>
        <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
          Reglas y Premios
        </h1>
        <p className="max-w-2xl text-pretty text-muted-foreground">
          Demostrá que sos el que más sabe de fútbol. Acertá los resultados,
          sumá puntos y llevate la gloria máxima al final del torneo.
        </p>
      </motion.header>

      <motion.section
        variants={fadeUp}
        className="flex flex-col gap-4"
      >
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          Sistema de Puntuación
        </h2>
        <motion.div
          variants={staggerContainer(0.06, 0.05)}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {rules.map((rule) => (
            <RuleCard
              key={rule.id}
              title={rule.title}
              description={rule.description}
              badge={rule.badge}
              icon={rule.icon}
              highlight={rule.id === "champion"}
            />
          ))}
        </motion.div>
      </motion.section>

      <motion.section variants={fadeUp} className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          La Recompensa
        </h2>
        <PrizeCard
          title="Gran Premio Final"
          prize="Camiseta Oficial · Selección Argentina"
          description="El usuario que termine en la primera posición de la tabla general al finalizar el torneo, se llevará la piel del campeón del mundo en su edición dorada."
          ctaLabel="Ver Ranking Actual"
          onCta={() => navigate("/leaderboard")}
        />
      </motion.section>
    </motion.div>
  );
}
