"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { useGetInstructorCoursesQuery } from "@/lib/api/course.api";
import {
  useGetInstructorSalesQuery,
  useGetInstructorStatsQuery,
  useGetStudentPurchasesQuery,
  useListMyPaymentsQuery,
} from "@/lib/api/payment.api";
import { formatCurrency } from "@/lib/utils";

export default function InstructorDashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useGetInstructorStatsQuery();
  const { data: coursesData, isLoading: coursesLoading } = useGetInstructorCoursesQuery();
  const { data: salesData, isLoading: salesLoading } = useGetInstructorSalesQuery({ page: 1, limit: 20 });
  const { data: purchasesData, isLoading: purchasesLoading } = useGetStudentPurchasesQuery();
  const { data: myPaymentsData, isLoading: myPaymentsLoading } = useListMyPaymentsQuery();

  const stats = statsData?.stats;
  const courses = coursesData?.data ?? [];
  const sales = salesData?.items ?? [];
  const purchased = purchasesData?.enrollments ?? [];
  const myPayments = myPaymentsData?.payments ?? [];
  const currency = stats?.currency?.toUpperCase() || "USD";

  const thisMonth = (() => {
    if (!stats?.monthlyBreakdown?.length) return 0;
    const now = new Date();
    const cur = stats.monthlyBreakdown.find(
      (m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1
    );
    return cur?.revenue ?? 0;
  })();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Instructor overview</h1>
        <p className="text-sm text-muted-foreground">
          Track your courses, sales, and revenue at a glance.
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
                <Link href="/instructor/courses/new">Create your first course</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((c) => (
              <Link key={c._id} href={`/instructor/courses/${c._id}`}>
                <Card className="rounded-xs transition-shadow hover:shadow-md">
                  <CardHeader className="space-y-2 p-4">
                    <CardTitle className="line-clamp-2 text-base">{c.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {c.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between p-4 pt-0 text-xs">
                    <span className="text-muted-foreground">
                      {c.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="font-medium">{formatCurrency(c.price, currency)}</span>
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
                    <Link href={`/courses/${e.course._id}`}>Continue Learning</Link>
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
