"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

const NAV_ITEMS = [
  { name: "Courses", href: "/courses" },
  { name: "Instructors", href: "/instructors" },
  { name: "About", href: "/about" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b shadow-sm bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container flex h-[80px] items-center justify-between">
        {/*  Logo  */}
        <Link href="/" className="group flex items-center gap-3">
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

        {/* Purple Active State Navigation */}
        <nav className="hidden md:flex items-center gap-2 p-1 rounded-full border bg-muted/30">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-5 py-3 text-sm transition-all duration-300 rounded-full",
                  isActive
                    ? "text-[#7C3AED] font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium",
                )}
              >
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="pill-shape"
                    className="absolute inset-0 z-0 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-full"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-8 w-px bg-border/60" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
