"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStudentPurchasesQuery } from "@/lib/api/payment.api";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  const { data, isLoading } = useGetStudentPurchasesQuery();
  const enrollments = data?.enrollments ?? [];

  const inProgress = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100,
  );
  const completed = enrollments.filter((e) => e.progress >= 100).length;
  const recent = enrollments
    .slice()
    .sort(
      (a, b) =>
        new Date(b.enrollmentDate).getTime() -
        new Date(a.enrollmentDate).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl  font-black tracking-tighter text-foreground">
          Welcome{" "}
          <span className="italic bg-gradient-to-r from-emerald-500 via-[#7C3AED] to-fuchsia-500 bg-clip-text text-transparent">
            back
          </span>
        </h1>

        <p className="max-w-md text-sm md:text-base font-medium text-muted-foreground leading-relaxed">
          Pick up where you left off.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xs">
          <CardHeader>
            <CardDescription>Purchased courses</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded-xs" />
              ) : (
                enrollments.length
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xs">
          <CardHeader>
            <CardDescription>In progress</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded-xs" />
              ) : (
                inProgress.length
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xs">
          <CardHeader>
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded-xs" />
              ) : (
                completed
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Continue where you left off</h2>
          <Button asChild variant="outline" size="sm" className="rounded-xs">
            <Link href="/student/courses">
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xs" />
            ))}
          </div>
        ) : recent.length === 0 ? (
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
            {recent?.map((e) => {
              const c = e.course;
              const progress = Math.min(100, Math.max(0, e.progress));
              return (
                <Card key={e._id} className="rounded-xs">
                  <CardContent className="space-y-3 p-4">
                    <p className="line-clamp-2 font-medium">{c?.title}</p>
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
                    <Button asChild size="sm" className="w-full rounded-xs">
                      <Link href={`/courses/${c?._id}`}>
                        <BookOpen className="h-4 w-4" />
                        Continue Learning
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
