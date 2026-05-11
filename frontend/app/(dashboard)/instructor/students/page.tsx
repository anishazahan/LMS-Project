"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetInstructorSalesQuery } from "@/lib/api/payment.api";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { Course, Payment, User } from "@/types";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function InstructorStudentsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [search, setSearch] = useState("");
  const { data, isLoading, isFetching } = useGetInstructorSalesQuery({
    page,
    limit,
  });

  const meta = data?.meta;

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const student =
        typeof p.student === "object"
          ? (p.student as Pick<User, "name" | "email">)
          : null;
      const course = typeof p.course === "object" ? (p.course as Course) : null;
      return (
        student?.name?.toLowerCase().includes(q) ||
        student?.email?.toLowerCase().includes(q) ||
        course?.title?.toLowerCase().includes(q)
      );
    });
  }, [data?.items, search]);

  const itemsCount = data?.items?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
          My{" "}
          <span className="italic bg-gradient-to-r from-blue-600 via-[#7C3AED] to-fuchsia-500 bg-clip-text text-transparent">
            Students
          </span>
        </h1>

        <p className="max-w-lg text-sm md:text-base font-medium text-muted-foreground leading-relaxed">
          Manage and track everyone who has joined your learning circle
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or course…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xs pl-9"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xs" />
      ) : itemsCount === 0 ? (
        <div className="rounded-xs border border-dashed p-10 text-center text-sm text-muted-foreground">
          No students have purchased your courses yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xs border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Purchase Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: Payment) => {
                const student =
                  typeof p.student === "object"
                    ? (p.student as Pick<User, "name" | "email">)
                    : null;
                const course =
                  typeof p.course === "object" ? (p.course as Course) : null;
                return (
                  <tr key={p._id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {student ? getInitials(student.name) : "?"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {student?.name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student?.email ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-1 font-medium">
                        {course?.title ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(
                        p.amount,
                        (p.currency || "usd").toUpperCase(),
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(p.paidAt ?? p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="rounded-xs capitalize bg-emerald-600 hover:bg-emerald-600">
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                  >
                    No matches for &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages} — {meta.total} student
            {meta.total === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xs"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
