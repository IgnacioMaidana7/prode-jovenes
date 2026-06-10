import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/prode/BrandLogo";
import { useLogin } from "@/stores/auth.store";
import { fadeUp, scaleIn, staggerContainer, staggerItem } from "@/lib/motion";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function LoginView() {
  const login = useLogin();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "hincha@prode.ar", password: "pasosxd" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await login(values.email, values.password);
    navigate("/");
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
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Demostrá que sos el que más sabe de fútbol.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-5"
                noValidate
              >
                <motion.div variants={fadeUp} className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="pl-6"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-destructive">
                      {errors.email.message}
                    </span>
                  )}
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link
                      to="#"
                      className="font-mono-label text-[0.65rem] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
                    >
                      ¿Olvidaste?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className="pl-6"
                      aria-invalid={!!errors.password}
                      {...register("password")}
                    />
                  </div>
                  {errors.password && (
                    <span className="font-mono-label text-[0.65rem] uppercase tracking-wider text-destructive">
                      {errors.password.message}
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
                    {isSubmitting ? "Ingresando…" : "Ingresar"}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
            <div className="relative border-t border-border/40 p-5 text-center">
              <span className="text-sm text-muted-foreground">
                ¿No tenés cuenta?{" "}
                <Link
                  to="#"
                  className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  Registrate
                </Link>
              </span>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
