"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/ui.slice";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function DashboardHeader() {
  const dispatch = useAppDispatch();

  return (
    <header className="sticky top-0 z-30 flex h-[71px] items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
