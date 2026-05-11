"use client";

import { dashboardRouteFor } from "@/lib/constants";
import { useAppSelector } from "@/store/hooks";
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
      <header className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5" />
          <span>E-Study</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
