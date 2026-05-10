"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseSummaryCard } from "@/components/public/course-summary-card";
import { InstructorSummaryCard } from "@/components/public/instructor-summary-card";
import { useListPublicCoursesQuery } from "@/lib/api/course.api";
import { useListPublicInstructorsQuery } from "@/lib/api/instructor.api";

const FEATURED_LIMIT = 3;

export function FeaturedSections() {
  const { data: coursesData, isLoading: loadingCourses } = useListPublicCoursesQuery({
    page: 1,
    limit: FEATURED_LIMIT,
  });
  const { data: instructorsData, isLoading: loadingInstructors } = useListPublicInstructorsQuery({
    page: 1,
    limit: FEATURED_LIMIT,
  });

  const courses = coursesData?.data ?? [];
  const instructors = instructorsData?.data ?? [];

  return (
    <>
      <section className="container py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured courses</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A taste of what our instructors are teaching right now.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xs">
            <Link href="/courses">
              See all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loadingCourses ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xs" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xs border border-dashed p-10 text-center text-sm text-muted-foreground">
            No published courses yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseSummaryCard key={c._id} course={c} />
            ))}
          </div>
        )}
      </section>

      <section className="container pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Meet our instructors</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Learn from practitioners with real expertise.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xs">
            <Link href="/instructors">
              See all instructors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loadingInstructors ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xs" />
            ))}
          </div>
        ) : instructors.length === 0 ? (
          <div className="rounded-xs border border-dashed p-10 text-center text-sm text-muted-foreground">
            No instructors registered yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((i) => (
              <InstructorSummaryCard key={i._id} instructor={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
