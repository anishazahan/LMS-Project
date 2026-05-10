"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm, type CourseFormValues } from "@/components/courses/course-form";
import {
  useCreateCourseMutation,
  useUploadCourseThumbnailMutation,
} from "@/lib/api/course.api";

export default function NewCoursePage() {
  const router = useRouter();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [createCourse, createState] = useCreateCourseMutation();
  const [uploadThumbnail, uploadState] = useUploadCourseThumbnailMutation();

  const handleSubmit = async (values: CourseFormValues) => {
    try {
      const { course } = await createCourse(values).unwrap();
      if (thumbnailFile) {
        try {
          await uploadThumbnail({ id: course._id, file: thumbnailFile }).unwrap();
        } catch {
          toast.error("Course saved, but thumbnail upload failed.");
        }
      }
      toast.success("Course created");
      router.push(`/instructor/courses/${course._id}`);
    } catch {
      /* */
    }
  };

  const submitting = createState.isLoading || uploadState.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="rounded-xs">
          <Link href="/instructor/courses">
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </Button>
      </div>

      <Card className="rounded-xs">
        <CardHeader>
          <CardTitle>Create course</CardTitle>
          <CardDescription>
            Set up the course details. You can add modules and lessons after saving.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm
            thumbnailFile={thumbnailFile}
            onThumbnailFileChange={setThumbnailFile}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Create course"
          />
        </CardContent>
      </Card>
    </div>
  );
}
