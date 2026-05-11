"use client";

import { InstructorSummaryCard } from "@/components/public/instructor-summary-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPublicInstructorsQuery } from "@/lib/api/instructor.api";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function PublicInstructorsPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isFetching } = useListPublicInstructorsQuery({
    page,
    limit: 12,
    search: debounced || undefined,
  });

  const instructors = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="container space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Instructors</h1>
        <p className="text-sm text-muted-foreground">
          Meet the instructors teaching on E-Study.
        </p>
      </header>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search instructors..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="rounded-xs pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xs" />
          ))}
        </div>
      ) : instructors.length === 0 ? (
        <div className="rounded-xs border border-dashed p-10 text-center text-sm text-muted-foreground">
          No instructors found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((i) => (
            <InstructorSummaryCard key={i._id} instructor={i} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages} — {meta.total} instructor
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
