"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseSummaryCard } from "@/components/public/course-summary-card";
import { useListPublicCoursesQuery } from "@/lib/api/course.api";
import type { CourseCategory, CourseLevel } from "@/types";

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "programming", label: "Programming" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "personal-development", label: "Personal development" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

const LEVEL_OPTIONS = [
  { value: "", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function PublicCoursesPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<CourseCategory | "">("");
  const [level, setLevel] = useState<CourseLevel | "">("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isFetching } = useListPublicCoursesQuery({
    page,
    limit: 12,
    search: debounced || undefined,
    category: category || undefined,
    level: level || undefined,
  });

  const courses = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="container space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">All courses</h1>
        <p className="text-sm text-muted-foreground">
          Explore courses taught by our instructors. Filter by category, level, or search by title.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="rounded-xs pl-9"
          />
        </div>
        <div className="w-44">
          <Select
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value as CourseCategory | "");
            }}
            options={CATEGORY_OPTIONS}
          />
        </div>
        <div className="w-40">
          <Select
            value={level}
            onChange={(e) => {
              setPage(1);
              setLevel(e.target.value as CourseLevel | "");
            }}
            options={LEVEL_OPTIONS}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xs" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xs border border-dashed p-10 text-center text-sm text-muted-foreground">
          No courses match your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseSummaryCard key={c._id} course={c} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {meta.page} of {meta.totalPages} — {meta.total} course
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
