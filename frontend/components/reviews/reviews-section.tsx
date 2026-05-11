"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Lock, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingSummaryCard } from "@/components/reviews/rating-summary";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewItem } from "@/components/reviews/review-item";
import { ReviewList } from "@/components/reviews/review-list";
import { useListMyReviewsQuery } from "@/lib/api/review.api";
import { useAppSelector } from "@/store/hooks";

interface ReviewsSectionProps {
  courseId: string;
  isEnrolled: boolean;
}

export function ReviewsSection({ courseId, isEnrolled }: ReviewsSectionProps) {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthed = !!user;
  const userId = user?._id || user?.id || null;

  const { data: myReviewsData, isLoading: myReviewsLoading } = useListMyReviewsQuery(undefined, {
    skip: !isAuthed,
  });

  const ownReview = useMemo(() => {
    if (!myReviewsData) return null;
    return (
      myReviewsData.items.find((r) => {
        const c = typeof r.course === "object" ? r.course?._id : r.course;
        return c === courseId;
      }) ?? null
    );
  }, [myReviewsData, courseId]);

  return (
    <Card className="rounded-xs">
      <CardHeader className="flex flex-row items-center gap-2">
        <MessageSquareText className="h-5 w-5" />
        <CardTitle className="text-lg">Reviews & feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RatingSummaryCard courseId={courseId} />

        {isAuthed && isEnrolled ? (
          myReviewsLoading ? (
            <Skeleton className="h-40 w-full rounded-xs" />
          ) : ownReview ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Your review</p>
              <ReviewItem review={ownReview} courseId={courseId} isOwner />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Share your experience</p>
              <ReviewForm mode="create" courseId={courseId} />
            </div>
          )
        ) : (
          <div className="flex items-center gap-3 rounded-xs border border-dashed p-4 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              {isAuthed
                ? "Purchase this course to leave a review."
                : "Sign in and purchase this course to leave a review."}
            </span>
            {!isAuthed ? (
              <Button asChild size="sm" variant="outline" className="rounded-xs">
                <Link href="/login">Sign in</Link>
              </Button>
            ) : null}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium">All reviews</p>
          <ReviewList courseId={courseId} excludeUserId={ownReview ? userId : null} />
        </div>
      </CardContent>
    </Card>
  );
}
