"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  onTogglePublish: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function CourseCard({ course, onTogglePublish, onDelete }: CourseCardProps) {
  const thumb = course.thumbnail?.url;

  return (
    <Card className="overflow-hidden rounded-xs">
      <Link href={`/instructor/courses/${course._id}`} className="block">
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {thumb ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={thumb} alt={course.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No thumbnail
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0 p-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="line-clamp-1 text-base">
            <Link href={`/instructor/courses/${course._id}`} className="hover:underline">
              {course.title}
            </Link>
          </CardTitle>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {course.shortDescription}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xs" aria-label="Course actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xs">
            <DropdownMenuItem asChild>
              <Link href={`/instructor/courses/${course._id}`}>
                <Pencil className="h-4 w-4" />
                Manage
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublish(course)}>
              {course.isPublished ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Publish
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(course)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex items-center justify-between p-4 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={course.isPublished ? "default" : "secondary"}
            className="rounded-xs"
          >
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
          <Badge variant="outline" className="rounded-xs capitalize">
            {course.level}
          </Badge>
          <Badge variant="outline" className="rounded-xs capitalize">
            {course.category.replace("-", " ")}
          </Badge>
        </div>
        <span className="text-sm font-semibold">{formatCurrency(course.price)}</span>
      </CardContent>
    </Card>
  );
}
