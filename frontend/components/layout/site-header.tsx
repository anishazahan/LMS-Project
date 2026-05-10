import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5" />
          <span>EDUCART</span>
        </Link>

        <nav className="ml-8 hidden md:flex items-center gap-6 text-sm">
          <Link href="/courses" className="text-foreground/70 hover:text-foreground transition">
            Courses
          </Link>
          <Link href="/instructors" className="text-foreground/70 hover:text-foreground transition">
            Instructors
          </Link>
          <Link href="/about" className="text-foreground/70 hover:text-foreground transition">
            About
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
