"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuyNowButton } from "@/components/payments/buy-now-button";
import { useIsEnrolled } from "@/lib/use-is-enrolled";
import type { Course } from "@/types";

interface CourseCtaProps {
  course: Pick<Course, "_id" | "price" | "enrolledStudents" | "isEnrolled"> & {
    instructor: Course["instructor"];
  };
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
  buyLabel?: string;
  continueLabel?: string;
  continueHref?: string;
}

export function CourseCta({
  course,
  size = "default",
  fullWidth = false,
  buyLabel = "Buy Now",
  continueLabel = "Continue Learning",
  continueHref,
}: CourseCtaProps) {
  const enrolled = useIsEnrolled(course);
  const instructorId =
    typeof course.instructor === "object" && course.instructor !== null
      ? (course.instructor as { _id: string })._id
      : (course.instructor as string);

  if (enrolled) {
    return (
      <Button
        asChild
        size={size}
        className={`${fullWidth ? "w-full" : ""} rounded-xs`}
      >
        <Link href={continueHref ?? `/courses/${course._id}`}>
          <PlayCircle className="h-4 w-4" />
          {continueLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <BuyNowButton
      courseId={course._id}
      price={course.price}
      instructorId={instructorId}
      isEnrolled={false}
      size={size}
      fullWidth={fullWidth}
      label={buyLabel}
    />
  );
}
