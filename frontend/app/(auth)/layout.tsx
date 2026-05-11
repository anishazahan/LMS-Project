"use client";

import { dashboardRouteFor } from "@/lib/constants";
import { useAppSelector } from "@/store/hooks";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hydrated, status, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (hydrated && status === "authenticated" && user) {
      router.replace(dashboardRouteFor(user.role));
    }
  }, [hydrated, status, user, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 mt-4 items-center">
        <Link href="/" className="group flex items-center gap-3 w-fit">
          <motion.div
            whileHover={{ rotate: -12, scale: 1.1 }}
            className="flex h-10 w-10 items-center justify-center rounded bg-[#7C3AED] shadow-lg shadow-purple-500/30"
          >
            <GraduationCap className="h-6 w-6 text-white" />
          </motion.div>
          <span className="text-2xl font-black tracking-tighter italic bg-gradient-to-br from-foreground via-foreground to-[#7C3AED] bg-clip-text text-transparent">
            E-Study
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
