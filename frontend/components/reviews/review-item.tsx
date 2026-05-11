"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/reviews/star-rating";
import { ReviewForm } from "@/components/reviews/review-form";
import { useDeleteReviewMutation } from "@/lib/api/review.api";
import { formatDate, getInitials } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewItemProps {
  review: Review;
  courseId: string;
  isOwner?: boolean;
  showCourseLabel?: boolean;
}

interface FetchError {
  status?: number;
  data?: { message?: string };
}

export function ReviewItem({ review, courseId, isOwner, showCourseLabel }: ReviewItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation();

  const user = review.user;
  const profileImage = user?.profileImage;
  const avatarUrl =
    typeof profileImage === "object" && profileImage !== null ? profileImage.url ?? null : null;
  const name = user?.name ?? "Anonymous";

  const courseTitle =
    typeof review.course === "object" && review.course !== null
      ? (review.course as { title?: string }).title
      : null;

  const handleDelete = async () => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    try {
      await deleteReview({ id: review._id, courseId }).unwrap();
      toast.success("Review deleted");
    } catch (err) {
      const e = err as FetchError;
      toast.error("Delete failed", { description: e?.data?.message || "Please try again." });
    }
  };

  if (editing) {
    return (
      <div className="rounded-xs border bg-muted/20 p-2">
        <ReviewForm
          mode="edit"
          courseId={courseId}
          reviewId={review._id}
          initialRating={review.rating}
          initialComment={review.comment}
          onCancel={() => setEditing(false)}
          onSubmitted={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xs border p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{name}</p>
            {review.isEdited ? (
              <Badge variant="outline" className="rounded-xs text-[10px]">
                Edited
              </Badge>
            ) : null}
            {isOwner ? (
              <Badge variant="outline" className="rounded-xs text-[10px]">
                Your review
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StarRating value={review.rating} size="sm" />
            <span>· {formatDate(review.createdAt)}</span>
          </div>
          {showCourseLabel && courseTitle ? (
            <p className="text-xs text-muted-foreground">on {courseTitle}</p>
          ) : null}
          <p className="whitespace-pre-line pt-1 text-sm leading-relaxed">{review.comment}</p>
        </div>
        {isOwner ? (
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xs"
              onClick={() => setEditing(true)}
              aria-label="Edit review"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xs text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete review"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
