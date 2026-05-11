"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarOpen } from "@/store/slices/ui.slice";
import { motion } from "framer-motion";
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNav: NavItem[] = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/payments", label: "Payment History", icon: CreditCard },
  { href: "/student/profile", label: "Profile", icon: Settings },
];

const instructorNav: NavItem[] = [
  { href: "/instructor", label: "Overview", icon: LayoutDashboard },
  { href: "/instructor/courses", label: "Courses", icon: BookOpen },
  { href: "/instructor/students", label: "Students", icon: Users },
  { href: "/instructor/profile", label: "Profile", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const open = useAppSelector((s) => s.ui.sidebarOpen);

  const items = role === ROLES.INSTRUCTOR ? instructorNav : studentNav;

  return (
    <>
      {open && (
        <div
          aria-hidden
          onClick={() => dispatch(setSidebarOpen(false))}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[70px] items-center justify-between px-4">
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
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 p-3">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
