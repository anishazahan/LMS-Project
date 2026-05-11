"use client";

import { CourseCta } from "@/components/payments/course-cta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Course, User } from "@/types";
import { Star } from "lucide-react";
import Link from "next/link";

interface Props {
  course: Course;
  hideInstructor?: boolean;
}

export function CourseSummaryCard({ course, hideInstructor }: Props) {
  const thumb = course.thumbnail?.url;
  const instructor =
    typeof course.instructor === "object" && course.instructor !== null
      ? (course.instructor as Pick<User, "_id" | "name">)
      : null;
  const instructorName = instructor?.name ?? null;

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-xs transition-shadow hover:shadow-lg">
      <Link href={`/courses/${course._id}`} className="block">
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {thumb ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumb}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No thumbnail
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="space-y-2 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-xs capitalize">
            {course.category.replace("-", " ")}
          </Badge>
          <Badge variant="outline" className="rounded-xs capitalize">
            {course.level}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-base">
          <Link href={`/courses/${course._id}`} className="hover:underline">
            {course.title}
          </Link>
        </CardTitle>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {course.shortDescription}
        </p>
      </CardHeader>
      <CardContent className="mt-auto space-y-2 p-4 pt-0">
        {!hideInstructor && instructorName ? (
          <p className="text-xs text-muted-foreground">
            By{" "}
            <span className="italic font-semibold text-gray-700">
              {instructorName}
            </span>{" "}
          </p>
        ) : null}
        {course.rating !== undefined && course.rating > 0 ? (
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium">{course.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({course.reviewCount ?? 0})
            </span>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t border-opacity-10 p-4">
        <div className="flex w-full items-center justify-between">
          <span className="text-base font-semibold">
            {formatCurrency(course.price)}
          </span>
          <Button variant="outline" size="sm" className="rounded-xs">
            <Link href={`/courses/${course._id}`}>View</Link>
          </Button>
        </div>
        <CourseCta course={course} size="sm" fullWidth />
      </CardFooter>
    </Card>
  );
}
