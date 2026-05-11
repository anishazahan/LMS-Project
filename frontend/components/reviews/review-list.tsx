"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewItem } from "@/components/reviews/review-item";
import { useListCourseReviewsQuery } from "@/lib/api/review.api";

interface ReviewListProps {
  courseId: string;
  excludeUserId?: string | null;
  pageSize?: number;
}

export function ReviewList({ courseId, excludeUserId, pageSize = 5 }: ReviewListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useListCourseReviewsQuery({
    courseId,
    page,
    limit: pageSize,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xs" />
        ))}
      </div>
    );
  }

  const items = (data?.items ?? []).filter((r) => {
    if (!excludeUserId) return true;
    const uid = typeof r.user === "object" && r.user ? r.user._id : null;
    return uid !== excludeUserId;
  });
  const meta = data?.meta;

  if (items.length === 0 && page === 1) {
    return (
      <div className="rounded-xs border border-dashed p-8 text-center text-sm text-muted-foreground">
        No reviews yet. Be the first to share your experience.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <ReviewItem key={r._id} review={r} courseId={courseId} />
      ))}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages} — {meta.total} review
            {meta.total === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xs"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
