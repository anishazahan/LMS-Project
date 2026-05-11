"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { Loader2, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/lib/api/auth.api";
import { dashboardRouteFor, ROUTES } from "@/lib/constants";
import { loginSchema, type LoginValues } from "@/lib/validation/auth.schema";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { staggerChildren: 0.1, duration: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: yupResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const data = await login(values).unwrap();
      toast.success("Welcome back! Ready to keep learning?");
      const next = params.get("next");
      router.push(next || dashboardRouteFor(data.user.role));
    } catch (err) {
      // Handled by central middleware
    }
  });

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center container py-10">
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-fuchsia-500/10 blur-[120px] rounded-full -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[480px] space-y-8"
      >
        <div className="text-center space-y-3">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full bg-[#7C3AED]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#7C3AED]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            The future is personalized
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl font-black tracking-tighter"
          >
            Welcome{" "}
            <span className="italic bg-gradient-to-r from-[#7C3AED] to-fuchsia-500 bg-clip-text text-transparent">
              Back
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground font-medium"
          >
            Enter your credentials to access your AI-powered hub.
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-card/60 backdrop-blur-xl p-8 md:p-10 rounded-md border border-border/50 shadow-2xl shadow-purple-500/5"
        >
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="h-12 rounded-md bg-muted/30    focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
              />
              {errors.email && (
                <p className="text-xs text-destructive font-bold ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  Password
                </Label>
                <Link
                  href="#"
                  className="text-[10px] font-bold text-[#7C3AED] hover:underline uppercase tracking-widest"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="h-12 rounded-md bg-muted/30    focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
              />
              {errors.password && (
                <p className="text-xs text-destructive font-bold ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-md h-14 text-lg font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/20 gap-2.5 mt-2 transition-transform active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Log In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-muted/50 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              New to E-Study?{" "}
              <Link
                href={ROUTES.REGISTER}
                className="font-bold text-[#7C3AED] hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
