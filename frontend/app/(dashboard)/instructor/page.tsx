"use client";

import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { ReviewItem } from "@/components/reviews/review-item";
import { StarRating } from "@/components/reviews/star-rating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetInstructorCoursesQuery } from "@/lib/api/course.api";
import {
  useGetInstructorSalesQuery,
  useGetInstructorStatsQuery,
  useGetStudentPurchasesQuery,
  useListMyPaymentsQuery,
} from "@/lib/api/payment.api";
import { useGetInstructorReviewAnalyticsQuery } from "@/lib/api/review.api";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  DollarSign,
  MessageSquareText,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function InstructorDashboardPage() {
  const { data: statsData, isLoading: statsLoading } =
    useGetInstructorStatsQuery();
  const { data: coursesData, isLoading: coursesLoading } =
    useGetInstructorCoursesQuery();
  const { data: salesData, isLoading: salesLoading } =
    useGetInstructorSalesQuery({ page: 1, limit: 20 });
  const { data: purchasesData, isLoading: purchasesLoading } =
    useGetStudentPurchasesQuery();
  const { data: myPaymentsData, isLoading: myPaymentsLoading } =
    useListMyPaymentsQuery();
  const { data: reviewAnalyticsData, isLoading: reviewAnalyticsLoading } =
    useGetInstructorReviewAnalyticsQuery();

  const stats = statsData?.stats;
  const courses = coursesData?.data ?? [];
  const sales = salesData?.items ?? [];
  const purchased = purchasesData?.enrollments ?? [];
  const myPayments = myPaymentsData?.payments ?? [];
  const reviewAnalytics = reviewAnalyticsData?.analytics;
  const currency = stats?.currency?.toUpperCase() || "USD";

  const thisMonth = (() => {
    if (!stats?.monthlyBreakdown?.length) return 0;
    const now = new Date();
    const cur = stats.monthlyBreakdown.find(
      (m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1,
    );
    return cur?.revenue ?? 0;
  })();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground">
          Overview
        </h1>

        <p className="text-sm font-medium text-muted-foreground leading-relaxed flex items-center gap-2">
          Track your courses, sales, and revenue in
          <span className="flex items-center gap-1 text-[#7C3AED] font-bold italic">
            real-time{" "}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C3AED]"></span>
            </span>
          </span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          loading={statsLoading}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Total Sales"
          value={stats?.totalSales ?? 0}
          loading={statsLoading}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0, currency)}
          loading={statsLoading}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(thisMonth, currency)}
          loading={statsLoading}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Reviews & feedback</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Reviews"
            value={reviewAnalytics?.totalReviews ?? 0}
            loading={reviewAnalyticsLoading}
            icon={<MessageSquareText className="h-4 w-4" />}
          />
          <Card className="rounded-xs">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardDescription>Average Rating</CardDescription>
                <span className="text-muted-foreground">
                  <Star className="h-4 w-4" />
                </span>
              </div>
              <CardTitle className="text-3xl">
                {reviewAnalyticsLoading ? (
                  <Skeleton className="h-8 w-20 rounded-xs" />
                ) : (
                  (reviewAnalytics?.avgRating ?? 0).toFixed(1)
                )}
              </CardTitle>
              <div className="pt-1">
                <StarRating value={reviewAnalytics?.avgRating ?? 0} size="sm" />
              </div>
            </CardHeader>
          </Card>
          <Card className="rounded-xs">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <CardDescription>Most-reviewed course</CardDescription>
                <span className="text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                </span>
              </div>
              <CardTitle className="line-clamp-1 text-base">
                {reviewAnalyticsLoading ? (
                  <Skeleton className="h-6 w-32 rounded-xs" />
                ) : (
                  (reviewAnalytics?.mostReviewed?.[0]?.title ?? "—")
                )}
              </CardTitle>
              {reviewAnalytics?.mostReviewed?.[0] ? (
                <p className="text-xs text-muted-foreground">
                  {reviewAnalytics.mostReviewed[0].reviewCount} review
                  {reviewAnalytics.mostReviewed[0].reviewCount === 1
                    ? ""
                    : "s"}{" "}
                  · {reviewAnalytics.mostReviewed[0].rating.toFixed(1)}★
                </p>
              ) : null}
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent feedback</p>
            {reviewAnalyticsLoading ? (
              <Skeleton className="h-40 w-full rounded-xs" />
            ) : !reviewAnalytics?.recentFeedback?.length ? (
              <div className="rounded-xs border border-dashed p-6 text-center text-sm text-muted-foreground">
                No reviews yet. As students leave feedback, it&apos;ll appear
                here.
              </div>
            ) : (
              <div className="space-y-2">
                {reviewAnalytics.recentFeedback.slice(0, 5).map((r) => {
                  const cid =
                    typeof r.course === "object" && r.course
                      ? (r.course as { _id: string })._id
                      : (r.course as string);
                  return (
                    <ReviewItem
                      key={r._id}
                      review={r}
                      courseId={cid}
                      showCourseLabel
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Most reviewed</p>
            {reviewAnalyticsLoading ? (
              <Skeleton className="h-40 w-full rounded-xs" />
            ) : !reviewAnalytics?.mostReviewed?.length ? (
              <div className="rounded-xs border border-dashed p-6 text-center text-sm text-muted-foreground">
                No data yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xs border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Course</th>
                      <th className="px-3 py-2 font-medium">Reviews</th>
                      <th className="px-3 py-2 font-medium">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewAnalytics.mostReviewed.map((c) => (
                      <tr key={c._id} className="border-t">
                        <td className="px-3 py-2">
                          <Link
                            href={`/instructor/courses/${c._id}`}
                            className="line-clamp-1 hover:underline"
                          >
                            {c.title}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {c.reviewCount}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {c.rating.toFixed(1)}★
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My created courses</h2>
          <Button asChild variant="outline" size="sm" className="rounded-xs">
            <Link href="/instructor/courses">
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {coursesLoading ? (
          <Skeleton className="h-40 w-full rounded-xs" />
        ) : courses.length === 0 ? (
          <Card className="rounded-xs">
            <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <BookOpen className="h-5 w-5" />
              You haven&apos;t created any courses yet.
              <Button asChild className="rounded-xs">
                <Link href="/instructor/courses/new">
                  Create your first course
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((c) => (
              <Link key={c._id} href={`/instructor/courses/${c._id}`}>
                <Card className="rounded-xs transition-shadow hover:shadow-md">
                  <CardHeader className="space-y-2 p-4">
                    <CardTitle className="line-clamp-2 text-base">
                      {c.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {c.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between p-4 pt-0 text-xs">
                    <span className="text-muted-foreground">
                      {c.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(c.price, currency)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Sales — recent</h2>
        {salesLoading ? (
          <Skeleton className="h-40 w-full rounded-xs" />
        ) : (
          <PaymentHistoryTable
            payments={sales}
            showStudentColumn
            emptyText="No sales yet. Your students' purchases will appear here."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">My purchased courses</h2>
        {purchasesLoading ? (
          <Skeleton className="h-32 w-full rounded-xs" />
        ) : purchased.length === 0 ? (
          <Card className="rounded-xs">
            <CardContent className="p-6 text-sm text-muted-foreground">
              You haven&apos;t purchased any courses from other instructors yet.{" "}
              <Link href="/courses" className="text-primary hover:underline">
                Browse the catalog
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {purchased.map((e) => (
              <Card key={e._id} className="rounded-xs">
                <CardContent className="space-y-2 p-4">
                  <p className="line-clamp-2 font-medium">{e.course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Progress: {Math.round(e.progress)}%
                  </p>
                  <Button asChild size="sm" className="w-full rounded-xs">
                    <Link href={`/courses/${e.course._id}`}>
                      Continue Learning
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">My payment history</h2>
        {myPaymentsLoading ? (
          <Skeleton className="h-32 w-full rounded-xs" />
        ) : (
          <PaymentHistoryTable
            payments={myPayments}
            emptyText="You haven't made any purchases yet."
          />
        )}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  loading,
  icon,
}: {
  title: string;
  value: number | string;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-xs">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <CardTitle className="text-3xl">
          {loading ? <Skeleton className="h-8 w-20 rounded-xs" /> : value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
