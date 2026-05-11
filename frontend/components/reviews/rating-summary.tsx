"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/reviews/star-rating";
import { useGetRatingSummaryQuery } from "@/lib/api/review.api";

interface RatingSummaryCardProps {
  courseId: string;
}

export function RatingSummaryCard({ courseId }: RatingSummaryCardProps) {
  const { data, isLoading } = useGetRatingSummaryQuery(courseId);

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 rounded-xs border p-4 sm:grid-cols-[180px,1fr]">
        <Skeleton className="h-24 w-full rounded-xs" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full rounded-xs" />
          ))}
        </div>
      </div>
    );
  }

  const { avg, count, distribution } = data;
  const max = Math.max(1, ...Object.values(distribution));

  return (
    <div className="grid gap-6 rounded-xs border p-4 sm:grid-cols-[180px,1fr]">
      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-4xl font-bold leading-none">{avg.toFixed(1)}</p>
        <div className="mt-2">
          <StarRating value={avg} size="md" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {count} review{count === 1 ? "" : "s"}
        </p>
      </div>

      <div className="space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((bucket) => {
          const n = distribution[String(bucket) as "1" | "2" | "3" | "4" | "5"];
          const pct = (n / max) * 100;
          return (
            <div key={bucket} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-muted-foreground">{bucket}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-xs bg-muted">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
