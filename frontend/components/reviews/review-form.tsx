"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/reviews/star-rating";
import {
  useAddReviewMutation,
  useUpdateReviewMutation,
} from "@/lib/api/review.api";

type Mode = "create" | "edit";

interface ReviewFormProps {
  mode: Mode;
  courseId: string;
  reviewId?: string;
  initialRating?: number;
  initialComment?: string;
  onCancel?: () => void;
  onSubmitted?: () => void;
}

interface FetchError {
  status?: number;
  data?: { message?: string; code?: string };
}

const MAX_COMMENT = 2000;

export function ReviewForm({
  mode,
  courseId,
  reviewId,
  initialRating = 0,
  initialComment = "",
  onCancel,
  onSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [comment, setComment] = useState<string>(initialComment);
  const [addReview, addState] = useAddReviewMutation();
  const [updateReview, updateState] = useUpdateReviewMutation();
  const isLoading = addState.isLoading || updateState.isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }
    if (comment.trim().length === 0) {
      toast.error("Please write a short comment");
      return;
    }

    try {
      if (mode === "create") {
        await addReview({ courseId, rating, comment: comment.trim() }).unwrap();
        toast.success("Review submitted");
      } else if (reviewId) {
        await updateReview({ id: reviewId, courseId, rating, comment: comment.trim() }).unwrap();
        toast.success("Review updated");
      }
      onSubmitted?.();
    } catch (err) {
      const e = err as FetchError;
      const msg = e?.data?.message || "Could not submit review";
      if (e?.status === 403) toast.error("Purchase required", { description: msg });
      else if (e?.status === 409) toast.warning("Already reviewed", { description: msg });
      else toast.error("Failed", { description: msg });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xs border p-4">
      <div>
        <p className="mb-1 text-sm font-medium">Your rating</p>
        <StarRating value={rating} onChange={setRating} size="lg" interactive />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Your comment</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
          placeholder="Share what you liked, what could improve, or what you learned…"
          rows={4}
          className="rounded-xs"
        />
        <p className="text-right text-xs text-muted-foreground">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="rounded-xs">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Submit Review" : "Save Changes"}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xs"
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
