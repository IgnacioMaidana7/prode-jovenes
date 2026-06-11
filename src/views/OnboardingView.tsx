import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/prode/BrandLogo";
import {
  useEnterGame,
  useLoginWithDni,
  useIsAuthenticated,
} from "@/stores/auth.store";
import { fadeUp, scaleIn, staggerContainer, staggerItem } from "@/lib/motion";

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
});

type DniValues = z.infer<typeof dniSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const inputWrapperStyle: React.CSSProperties = {
  backgroundColor: "var(--input)",
  borderColor: "oklch(0.58 0.045 75 / 0.45)",
};

const inputStyle: React.CSSProperties = {
  color: "var(--foreground)",
  backgroundColor: "transparent",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  border: "none",
  padding: 0,
  margin: 0,
  lineHeight: "1.5",
};

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
    defaultValues: { dni: "", username: "" },
  });

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
      await enterGame(values.dni, values.username);
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
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />

            <AnimatePresence mode="wait">
              {step === "dni" ? (
                <motion.div
                  key="dni"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
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
                      <div
                        className="flex h-11 items-center gap-3 rounded-lg border px-3 transition-colors focus-within:border-primary"
                        style={inputWrapperStyle}
                      >
                        <CreditCard className="size-4 shrink-0 text-muted-foreground" />
                        <input
                          id="dni"
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          autoFocus
                          placeholder="12345678"
                          style={inputStyle}
                          className="placeholder:text-muted-foreground/60"
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
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
                      <div
                        className="flex h-11 items-center gap-3 rounded-lg border px-3 transition-colors focus-within:border-primary"
                        style={inputWrapperStyle}
                      >
                        <User className="size-4 shrink-0 text-muted-foreground" />
                        <input
                          id="username"
                          type="text"
                          autoComplete="nickname"
                          autoFocus
                          placeholder="Toto, Martu, Pipe…"
                          style={{ ...inputStyle, caretColor: "var(--primary)" }}
                          className="placeholder:text-muted-foreground/60"
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
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting
                          ? "Registrando…"
                          : "Registrarme"}
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
