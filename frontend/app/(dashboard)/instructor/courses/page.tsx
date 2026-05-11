"use client";

import { ConfirmDialog } from "@/components/courses/confirm-dialog";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteCourseMutation,
  useGetInstructorCoursesQuery,
  usePublishCourseMutation,
} from "@/lib/api/course.api";
import type { Course } from "@/types";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
];

export default function InstructorCoursesPage() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "unpublished">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null);

  // tiny debounce — local only, no extra lib
  useMemo(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isFetching } = useGetInstructorCoursesQuery({
    page,
    limit: 12,
    search: debounced || undefined,
    status,
  });

  const [deleteCourse, deleteState] = useDeleteCourseMutation();
  const [publishCourse] = usePublishCourseMutation();

  const courses = data?.data ?? [];
  const meta = data?.meta;

  const handleTogglePublish = async (course: Course) => {
    try {
      await publishCourse({
        id: course._id,
        isPublished: !course.isPublished,
      }).unwrap();
      toast.success(
        course.isPublished ? "Course unpublished" : "Course published",
      );
    } catch {
      /* */
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCourse(pendingDelete._id).unwrap();
      toast.success("Course deleted");
      setPendingDelete(null);
    } catch {
      /* */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            My{" "}
            <span className="italic bg-gradient-to-r from-[#7C3AED] to-fuchsia-500 bg-clip-text text-transparent">
              Courses
            </span>
          </h1>

          <p className="max-w-md text-sm md:text-base font-medium text-muted-foreground leading-relaxed">
            Create, edit, and publish courses you teach. Manage your
          </p>
        </div>
        <Button asChild className="rounded-xs">
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4" />
            New course
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="rounded-xs pl-9"
          />
        </div>
        <div className="w-48">
          <Select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as typeof status);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xs" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xs border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">No courses yet.</p>
          <Button asChild className="mt-4 rounded-xs">
            <Link href="/instructor/courses/new">
              <Plus className="h-4 w-4" />
              Create your first course
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard
              key={c._id}
              course={c}
              onTogglePublish={handleTogglePublish}
              onDelete={setPendingDelete}
            />
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => (open ? null : setPendingDelete(null))}
        title="Delete course?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" and all of its modules will be removed permanently.`
            : ""
        }
        destructive
        loading={deleteState.isLoading}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
