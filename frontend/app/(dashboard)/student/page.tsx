"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import {
  useGetStudentPurchasesQuery,
  useListMyPaymentsQuery,
} from "@/lib/api/payment.api";

export default function StudentDashboardPage() {
  const { data: purchasesData, isLoading: purchasesLoading } = useGetStudentPurchasesQuery();
  const { data: paymentsData, isLoading: paymentsLoading } = useListMyPaymentsQuery();

  const enrollments = purchasesData?.enrollments ?? [];
  const payments = paymentsData?.payments ?? [];

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const completed = enrollments.filter((e) => e.progress >= 100).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xs">
          <CardHeader>
            <CardDescription>Purchased courses</CardDescription>
            <CardTitle className="text-3xl">
              {purchasesLoading ? <Skeleton className="h-8 w-12 rounded-xs" /> : enrollments.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xs">
          <CardHeader>
            <CardDescription>In progress</CardDescription>
            <CardTitle className="text-3xl">
              {purchasesLoading ? <Skeleton className="h-8 w-12 rounded-xs" /> : inProgress}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xs">
          <CardHeader>
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">
              {purchasesLoading ? <Skeleton className="h-8 w-12 rounded-xs" /> : completed}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Purchased courses</h2>
          <Button asChild variant="outline" size="sm" className="rounded-xs">
            <Link href="/courses">Browse more</Link>
          </Button>
        </div>

        {purchasesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
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
            {enrollments.map((e) => {
              const c = e.course;
              const thumb = c.thumbnail?.url;
              const progress = Math.min(100, Math.max(0, e.progress));
              const instructorName =
                typeof c.instructor === "object" && c.instructor !== null
                  ? (c.instructor as { name?: string }).name
                  : null;

              return (
                <Card key={e._id} className="overflow-hidden rounded-xs">
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {thumb ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={thumb} alt={c.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium">{c.title}</p>
                        {instructorName ? (
                          <p className="text-xs text-muted-foreground">By {instructorName}</p>
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
                      <Link href={`/courses/${c._id}`}>
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
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Payment history</h2>
        {paymentsLoading ? (
          <Skeleton className="h-40 w-full rounded-xs" />
        ) : (
          <PaymentHistoryTable
            payments={payments}
            emptyText="No payments yet. Purchase a course to see receipts here."
          />
        )}
      </section>
    </div>
  );
}
