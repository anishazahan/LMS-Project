"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/lib/api/auth.api";
import { dashboardRouteFor, ROUTES } from "@/lib/constants";
import {
  registerSchema,
  type RegisterValues,
} from "@/lib/validation/auth.schema";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export function RegisterForm() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: { role: "student" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const data = await registerUser(values).unwrap();
      toast.success("Account created! Welcome to E-Study.");
      router.push(dashboardRouteFor(data.user.role));
    } catch (err) {
      // Central error middleware handles this, but we catch to prevent crash
    }
  });

  return (
    <div className=" min-h-[90vh] flex flex-row-reverse gap-6 items-center justify-center container pb-10 ">
      {/* Form Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8 max-w-lg mx-auto lg:mx-0 w-full"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Sparkles className="h-4 w-4" />
            JOIN THE REVOLUTION
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
            Unlock{" "}
            <span className="italic bg-gradient-to-r from-[#7C3AED] to-fuchsia-500 bg-clip-text text-transparent">
              New Skills
            </span>
            <br /> in Minutes.
          </h1>
          <p className="text-lg font-medium text-muted-foreground leading-relaxed">
            Create your account today to start learning or teaching on the
            E-Study AI Hub.
          </p>
        </motion.div>

        <motion.form
          variants={itemVariants}
          onSubmit={onSubmit}
          noValidate
          className="space-y-5 bg-card p-8 rounded-md border border-border/50 shadow-2xl shadow-purple-500/5"
        >
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
            >
              Full name
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="h-12 rounded-md bg-muted/30   focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            />
            {errors.name && (
              <p className="text-xs text-destructive font-bold">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="h-12 rounded-md bg-muted/30   focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            />
            {errors.email && (
              <p className="text-xs text-destructive font-bold">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="h-12 rounded-md bg-muted/30   focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
              />
              {errors.password && (
                <p className="text-xs text-destructive font-bold">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Confirm
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="h-12 rounded-md bg-muted/30   focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-bold">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Account Type
            </Label>
            <div className="flex gap-3">
              {[
                { value: "student", label: "Learn" },
                { value: "instructor", label: "Teach" },
              ].map((role) => (
                <label
                  key={role.value}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-2 py-3 transition-all has-[:checked]:border-[#7C3AED] has-[:checked]:bg-[#7C3AED]/5"
                >
                  <input
                    type="radio"
                    value={role.value}
                    {...register("role")}
                    className="h-4 w-4 accent-[#7C3AED]"
                  />
                  <span className="text-sm font-bold tracking-tight">
                    {role.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-md h-14 text-lg font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/20 gap-2 transition-transform active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Create Account"
            )}
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </Button>

          <p className="text-sm text-center font-medium text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-bold text-[#7C3AED] hover:underline"
            >
              Log in
            </Link>
          </p>
        </motion.form>
      </motion.div>

      {/* Image Section */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="relative hidden lg:block h-full w-full"
      >
        <div className="absolute inset-0 bg-[#7C3AED]/10 blur-[120px] rounded-md" />
        <div className="relative aspect-square w-full max-w-xl mx-auto rounded-md overflow-hidden border-8 border-white dark:border-background shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"
            alt="Students collaborating"
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#7C3AED]/40 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
