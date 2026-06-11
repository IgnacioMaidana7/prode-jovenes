import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/prode/BrandLogo";
import {
  useEnterGame,
  useLoginWithDni,
  useIsAuthenticated,
} from "@/stores/auth.store";
import { fadeUp, scaleIn, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Flag } from "@/lib/flags";
import { COUNTRIES } from "@/data/countries";

const dniSchema = z.object({
  dni: z
    .string()
    .trim()
    .regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos"),
});

const registerSchema = z.object({
  dni: z
    .string()
    .trim()
    .regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos"),
  username: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(20, "Máximo 20 caracteres"),
  champion: z
    .string()
    .min(1, "Debes seleccionar un campeón"),
});

type DniValues = z.infer<typeof dniSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const stepDniVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const stepRegisterVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const TOURNAMENT_KICKOFF = new Date("2026-06-20T21:00:00Z");

export function OnboardingView() {
  const navigate = useNavigate();
  const enterGame = useEnterGame();
  const loginWithDni = useLoginWithDni();
  const isAuthenticated = useIsAuthenticated();
  const [step, setStep] = useState<"dni" | "register">("dni");
  const [pendingDni, setPendingDni] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const dniForm = useForm<DniValues>({
    resolver: zodResolver(dniSchema),
    defaultValues: { dni: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { dni: "", username: "", champion: "" },
  });

  const selectedChampion = registerForm.watch("champion");
  const usernameValue = registerForm.watch("username");
  const isTournamentStarted = new Date() > TOURNAMENT_KICKOFF;
  const isRegisterSubmitDisabled =
    !usernameValue?.trim() ||
    !selectedChampion ||
    isTournamentStarted ||
    registerForm.formState.isSubmitting;

  const onDniSubmit = dniForm.handleSubmit(async (values) => {
    try {
      const found = await loginWithDni(values.dni);
      if (found) {
        navigate("/", { replace: true });
      } else {
        setPendingDni(values.dni);
        registerForm.setValue("dni", values.dni);
        setStep("register");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No pudimos buscar tu DNI."
      );
    }
  });

  const onRegisterSubmit = registerForm.handleSubmit(async (values) => {
    try {
      await enterGame(values.dni, values.username, values.champion);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No pudimos registrarte."
      );
    }
  });

  const handleBack = () => {
    setStep("dni");
    setPendingDni("");
    dniForm.reset();
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <motion.div
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm"
      >
        <motion.div variants={staggerItem} className="mb-8 flex justify-center">
          <BrandLogo size="lg" />
        </motion.div>

        <motion.div variants={scaleIn}>
          <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-border/40">
            <div className="pointer-events-none absolute inset-0 from-primary/8 via-transparent to-accent/8" />

            <AnimatePresence mode="wait">
              {step === "dni" ? (
                <motion.div
                  key="dni"
                  variants={stepDniVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="relative px-6 pt-6 pb-2"
                >
                  <div className="mb-6 flex flex-col items-center gap-3 text-center">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                      <Trophy className="size-6" />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        Entrá al prode
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Poné tu DNI para entrar. Si ya te registraste, te
                        reconocemos al toque.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={onDniSubmit}
                    className="flex flex-col gap-5"
                    noValidate
                  >
                    <motion.div variants={fadeUp} className="flex flex-col gap-2">
                      <label
                        htmlFor="dni"
                        className="text-sm font-medium text-foreground"
                      >
                        Tu DNI
                      </label>
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="dni"
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          autoFocus
                          placeholder="12345678"
                          className="h-11 pl-10"
                          aria-invalid={!!dniForm.formState.errors.dni}
                          {...dniForm.register("dni")}
                        />
                      </div>
                      {dniForm.formState.errors.dni && (
                        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-destructive">
                          {dniForm.formState.errors.dni.message}
                        </span>
                      )}
                    </motion.div>

                    <motion.div variants={fadeUp}>
                      <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        disabled={dniForm.formState.isSubmitting}
                      >
                        {dniForm.formState.isSubmitting ? "Buscando…" : "Entrar"}
                        {!dniForm.formState.isSubmitting && <ArrowRight />}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  variants={stepRegisterVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="relative px-6 pt-6 pb-2"
                >
                  <div className="mb-6 flex flex-col items-center gap-3 text-center">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                      <User className="size-6" />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        Nuevo por acá
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No encontramos el DNI{" "}
                        <span className="font-mono text-foreground">
                          {pendingDni}
                        </span>
                        . Poné tu nombre para registrarte.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={onRegisterSubmit}
                    className="flex flex-col gap-5"
                    noValidate
                  >
                    <motion.div variants={fadeUp} className="flex flex-col gap-2">
                      <label
                        htmlFor="username"
                        className="text-sm font-medium text-foreground"
                      >
                        Tu nombre
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          autoComplete="nickname"
                          autoFocus
                          placeholder="Toto, Martu, Pipe…"
                          className="h-11 pl-10"
                          aria-invalid={!!registerForm.formState.errors.username}
                          {...registerForm.register("username")}
                        />
                      </div>
                      {registerForm.formState.errors.username && (
                        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-destructive">
                          {registerForm.formState.errors.username.message}
                        </span>
                      )}
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-foreground">
                        Tu Selección Campeona 🏆
                      </label>
                      {isTournamentStarted ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive-foreground">
                          El torneo ya ha comenzado. Ya no es posible registrarse ni seleccionar un campeón.
                        </div>
                      ) : (
                        <>
                          <span className="text-[0.7rem] text-muted-foreground leading-tight">
                            Elegí qué selección ganará el Mundial 2026. Esta decisión no se puede cambiar.
                          </span>

                          <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-border/40 bg-muted/10 p-2 pr-1.5 scrollbar-thin">
                            <div className="flex flex-col gap-4">
                              {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map((groupLetter) => {
                                const groupCountries = COUNTRIES.filter(
                                  (c) => c.group === groupLetter
                                );
                                return (
                                  <div key={groupLetter} className="flex flex-col gap-1.5">
                                    <span className="font-mono-label text-[0.6rem] uppercase tracking-wider text-primary">
                                      Grupo {groupLetter}
                                    </span>
                                    <div className="grid grid-cols-4 gap-1.5">
                                      {groupCountries.map((c) => {
                                        const isSelected = selectedChampion === c.code;
                                        return (
                                          <button
                                            key={c.code}
                                            type="button"
                                            onClick={() =>
                                              registerForm.setValue("champion", c.code, {
                                                shouldValidate: true,
                                          })
                                        }
                                        className={cn(
                                          "flex flex-col items-center justify-center rounded-md border p-1.5 gap-1 transition-all cursor-pointer",
                                          isSelected
                                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/30"
                                            : "border-border/30 bg-card/50 text-muted-foreground hover:border-border/70 hover:bg-card"
                                        )}
                                      >
                                        <Flag code={c.code} width={24} />
                                        <span className="text-[9px] font-mono-label uppercase tracking-tight text-center truncate w-full">
                                          {c.name}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {registerForm.formState.errors.champion && (
                        <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-destructive">
                          {registerForm.formState.errors.champion.message}
                        </span>
                      )}
                        </>
                      )}
                    </motion.div>

                    <motion.div variants={fadeUp} className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={handleBack}
                      >
                        Volver
                      </Button>
                      <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        className="flex-1"
                        disabled={isRegisterSubmitDisabled}
                      >
                        {registerForm.formState.isSubmitting
                          ? "Registrando…"
                          : "Entrar al prode"}
                        {!registerForm.formState.isSubmitting && <ArrowRight />}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative border-t border-border/40 p-5 text-center">
              <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Sin mail · sin contraseña · sin vueltas
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
