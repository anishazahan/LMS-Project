"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role } from "@/lib/constants";
import { ROUTES, dashboardRouteFor } from "@/lib/constants";

interface AuthGuardProps {
  children: React.ReactNode;
  allow?: Role[];
}

export function AuthGuard({ children, allow }: AuthGuardProps) {
  const router = useRouter();
  const { hydrated, status, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!hydrated) return;
    if (status !== "authenticated") {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (allow && user && !allow.includes(user.role)) {
      router.replace(dashboardRouteFor(user.role));
    }
  }, [hydrated, status, user, allow, router]);

  if (!hydrated || status === "loading" || status === "idle") {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (status !== "authenticated") return null;
  if (allow && user && !allow.includes(user.role)) return null;

  return <>{children}</>;
}
