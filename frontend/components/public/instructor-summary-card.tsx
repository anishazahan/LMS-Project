"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { PublicInstructor } from "@/types";

interface Props {
  instructor: PublicInstructor;
}

export function InstructorSummaryCard({ instructor }: Props) {
  const avatarUrl =
    typeof instructor.profileImage === "object" ? instructor.profileImage?.url : null;

  return (
    <Link href={`/instructors/${instructor._id}`} className="block">
      <Card className="h-full rounded-xs transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center gap-3 p-4">
          <Avatar className="h-12 w-12">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={instructor.name} /> : null}
            <AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{instructor.name}</CardTitle>
            <p className="text-xs text-muted-foreground">Instructor</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {instructor.bio ? (
            <p className="line-clamp-3 text-xs text-muted-foreground">{instructor.bio}</p>
          ) : (
            <p className="text-xs italic text-muted-foreground">No bio yet.</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>
              {instructor.publishedCourseCount ?? 0} course
              {instructor.publishedCourseCount === 1 ? "" : "s"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
