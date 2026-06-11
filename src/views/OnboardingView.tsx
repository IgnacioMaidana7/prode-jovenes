import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, User } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/prode/BrandLogo";
import {
  useEnterGame,
  useIsAuthenticated,
} from "@/stores/auth.store";
import { fadeUp, scaleIn, staggerContainer, staggerItem } from "@/lib/motion";

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(20, "Máximo 20 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function OnboardingView() {
  const navigate = useNavigate();
  const enterGame = useEnterGame();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await enterGame(values.username);
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No pudimos registrarte."
      );
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <motion.div
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm"
      >
        <motion.div variants={staggerItem} className="mb-6 flex justify-center">
          <BrandLogo size="lg" />
        </motion.div>

        <motion.div variants={scaleIn}>
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
            <CardHeader className="relative items-center text-center">
              <span className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                <Trophy className="size-6" />
              </span>
              <CardTitle className="text-2xl">¿Cómo te llamamos?</CardTitle>
              <CardDescription>
                Elegí un nombre para aparecer en el ranking. Es lo único que
                necesitamos para arrancar.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-5"
                noValidate
              >
                <motion.div variants={fadeUp} className="flex flex-col gap-2">
                  <Label htmlFor="username">Tu nombre</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      autoComplete="nickname"
                      autoFocus
                      placeholder="Toto, Martu, Pipe…"
                      className="pl-6"
                      aria-invalid={!!errors.username}
                      {...register("username")}
                    />
                  </div>
                  {errors.username && (
                    <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-destructive">
                      {errors.username.message}
                    </span>
                  )}
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Entrando…" : "Entrar al prode"}
                    {!isSubmitting && <ArrowRight />}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
            <div className="relative border-t border-border/40 p-5 text-center">
              <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Sin mail · sin contraseña · sin vueltas
              </span>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
