"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseForm, type CourseFormValues } from "@/components/courses/course-form";
import { ConfirmDialog } from "@/components/courses/confirm-dialog";
import { ModuleSection } from "@/components/courses/module-section";
import {
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  usePublishCourseMutation,
  useUploadCourseThumbnailMutation,
} from "@/lib/api/course.api";
import {
  useGetModulesByCourseQuery,
  useCreateModuleMutation,
} from "@/lib/api/module.api";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [creatingModule, setCreatingModule] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: courseData, isLoading: loadingCourse } = useGetCourseByIdQuery(id);
  const { data: modulesData, isLoading: loadingModules } = useGetModulesByCourseQuery(id);

  const [updateCourse, updateState] = useUpdateCourseMutation();
  const [deleteCourse, deleteState] = useDeleteCourseMutation();
  const [publishCourse] = usePublishCourseMutation();
  const [uploadThumbnail, uploadState] = useUploadCourseThumbnailMutation();
  const [createModule, createModuleState] = useCreateModuleMutation();

  if (loadingCourse) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3 rounded-xs" />
        <Skeleton className="h-64 w-full rounded-xs" />
      </div>
    );
  }

  const course = courseData?.course;
  if (!course) {
    return (
      <Card className="rounded-xs">
        <CardHeader>
          <CardTitle>Course not found</CardTitle>
          <CardDescription>This course may have been deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-xs">
            <Link href="/instructor/courses">Back to courses</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const modules = (modulesData?.modules ?? []).slice().sort((a, b) => a.order - b.order);
  const hasPaidEnrollments = (course.paidEnrollmentCount ?? 0) > 0;
  const deleteBlocked = course.isPublished || hasPaidEnrollments;
  const deleteBlockedReason = course.isPublished
    ? "Unpublish the course before deleting."
    : hasPaidEnrollments
      ? "Cannot delete — students have purchased this course."
      : undefined;

  const handleUpdateCourse = async (values: CourseFormValues) => {
    try {
      await updateCourse({ id, body: values }).unwrap();
      if (thumbnailFile) {
        try {
          await uploadThumbnail({ id, file: thumbnailFile }).unwrap();
          setThumbnailFile(null);
        } catch {
          toast.error("Course saved, but thumbnail upload failed.");
        }
      }
      toast.success("Course updated");
    } catch {
      /* */
    }
  };

  const handleTogglePublish = async () => {
    try {
      await publishCourse({ id, isPublished: !course.isPublished }).unwrap();
      toast.success(course.isPublished ? "Course unpublished" : "Course published");
    } catch {
      /* */
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse(id).unwrap();
      toast.success("Course deleted");
      router.push("/instructor/courses");
    } catch {
      /* */
    }
  };

  const handleCreateModule = async (values: { title: string; description: string }) => {
    try {
      await createModule({ courseId: id, ...values }).unwrap();
      toast.success("Module added");
      setCreatingModule(false);
    } catch {
      /* */
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="rounded-xs">
            <Link href="/instructor/courses">
              <ArrowLeft className="h-4 w-4" />
              All courses
            </Link>
          </Button>
          <h1 className="mt-2 text-2xl font-semibold">{course.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge
              variant={course.isPublished ? "default" : "secondary"}
              className="rounded-xs"
            >
              {course.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge variant="outline" className="rounded-xs capitalize">
              {course.level}
            </Badge>
            <Badge variant="outline" className="rounded-xs capitalize">
              {course.category.replace("-", " ")}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleTogglePublish} variant="outline" className="rounded-xs">
            {course.isPublished ? (
              <>
                <EyeOff className="h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Publish
              </>
            )}
          </Button>
          <Button
            onClick={() => setConfirmDelete(true)}
            variant="destructive"
            disabled={deleteBlocked}
            title={deleteBlockedReason}
            className="rounded-xs"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="curriculum" className="space-y-4">
        <TabsList className="rounded-xs">
          <TabsTrigger value="curriculum" className="rounded-xs">
            Curriculum
          </TabsTrigger>
          <TabsTrigger value="details" className="rounded-xs">
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-4">
          <Card className="rounded-xs">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Modules &amp; lessons</CardTitle>
                <CardDescription>
                  Group lessons into modules. Each lesson is a YouTube-backed video.
                </CardDescription>
              </div>
              <Button onClick={() => setCreatingModule(true)} className="rounded-xs">
                <Plus className="h-4 w-4" />
                Add module
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingModules ? (
                <Skeleton className="h-24 w-full rounded-xs" />
              ) : modules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No modules yet. Add your first module to start building the curriculum.
                </p>
              ) : (
                modules.map((m) => (
                  <ModuleSection key={m._id} module={m} courseId={id} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle>Course details</CardTitle>
              <CardDescription>Edit course information and thumbnail.</CardDescription>
            </CardHeader>
            <CardContent>
              <CourseForm
                initial={course}
                thumbnailUrl={course.thumbnail?.url ?? null}
                thumbnailFile={thumbnailFile}
                onThumbnailFileChange={setThumbnailFile}
                onSubmit={handleUpdateCourse}
                submitting={updateState.isLoading || uploadState.isLoading}
                submitLabel="Save changes"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={creatingModule} onOpenChange={setCreatingModule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add module</DialogTitle>
            <DialogDescription>Group related lessons under a module.</DialogDescription>
          </DialogHeader>
          <NewModuleForm
            onSubmit={handleCreateModule}
            submitting={createModuleState.isLoading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete course?"
        description="This permanently removes the course and all of its modules and lessons."
        destructive
        loading={deleteState.isLoading}
        confirmLabel="Delete"
        onConfirm={handleDeleteCourse}
      />
    </div>
  );
}

function NewModuleForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (values: { title: string; description: string }) => void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim().length < 3) {
          setError("Title must be at least 3 characters");
          return;
        }
        setError(null);
        onSubmit({ title: title.trim(), description: description.trim() });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="new-module-title">Title</Label>
        <Input
          id="new-module-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          className="rounded-xs"
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-module-description">Description</Label>
        <Textarea
          id="new-module-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-xs"
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={submitting} className="rounded-xs">
          {submitting ? "Adding..." : "Add module"}
        </Button>
      </DialogFooter>
    </form>
  );
}
