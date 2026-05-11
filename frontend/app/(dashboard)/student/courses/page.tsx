"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStudentPurchasesQuery } from "@/lib/api/payment.api";
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function StudentCoursesPage() {
  const { data, isLoading } = useGetStudentPurchasesQuery();
  const enrollments = data?.enrollments ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground">
          My{" "}
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-fuchsia-500">
            Courses
          </span>
        </h1>

        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground leading-relaxed">
          <p>Every course you&apos;ve purchased and pick on. </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xs" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <Card className="rounded-xs">
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You haven&apos;t purchased any courses yet.
            </p>
            <Button asChild className="rounded-xs">
              <Link href="/courses">Browse courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments?.map((e) => {
            const c = e?.course;
            const thumb = c?.thumbnail?.url;
            const progress = Math.min(100, Math.max(0, e.progress));
            const instructorName =
              typeof c?.instructor === "object" && c?.instructor !== null
                ? (c?.instructor as { name?: string }).name
                : null;

            return (
              <Card key={e._id} className="overflow-hidden rounded-xs">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {thumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={thumb}
                      alt={c?.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No thumbnail
                    </div>
                  )}
                </div>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-medium">{c?.title}</p>
                      {instructorName ? (
                        <p className="text-xs text-muted-foreground">
                          By {instructorName}
                        </p>
                      ) : null}
                    </div>
                    {progress >= 100 ? (
                      <Badge className="rounded-xs bg-emerald-600 hover:bg-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </Badge>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-xs bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <Button asChild className="w-full rounded-xs">
                    <Link href={`/courses/${c?._id}`}>
                      <BookOpen className="h-4 w-4" />
                      Continue Learning
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
