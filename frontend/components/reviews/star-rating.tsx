"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
  ariaLabel?: string;
}

const SIZE_MAP = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
} as const;

export function StarRating({
  value,
  onChange,
  size = "md",
  interactive = false,
  className,
  ariaLabel,
}: StarRatingProps) {
  const sizeClass = SIZE_MAP[size];
  const stars = [1, 2, 3, 4, 5] as const;

  if (!interactive) {
    return (
      <div
        className={cn("flex items-center gap-0.5", className)}
        aria-label={ariaLabel ?? `Rating ${value} out of 5`}
      >
        {stars.map((n) => {
          const filled = n <= Math.round(value);
          return (
            <Star
              key={n}
              className={cn(
                sizeClass,
                filled ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/40"
              )}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? "Select rating"}
      className={cn("flex items-center gap-1", className)}
    >
      {stars.map((n) => {
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === value}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => onChange?.(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft" && n > 1) onChange?.(n - 1);
              if (e.key === "ArrowRight" && n < 5) onChange?.(n + 1);
            }}
            className="rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Star
              className={cn(
                sizeClass,
                "transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40 hover:text-amber-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
