import { apiSlice } from "./api-slice";
import type { ApiSuccess, Lesson } from "@/types";

export interface CreateLessonBody {
  title: string;
  description?: string;
  videoUrl: string;
  duration?: number;
  isFreePreview?: boolean;
  isPublished?: boolean;
  order?: number;
}

export type UpdateLessonBody = Partial<CreateLessonBody>;

const moduleTag = (courseId: string, moduleId: string) =>
  [
    { type: "Module" as const, id: moduleId },
    { type: "Module" as const, id: `course-${courseId}` },
  ];

export const lessonApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    createLesson: build.mutation<
      { lesson: Lesson },
      { moduleId: string; courseId: string; body: CreateLessonBody }
    >({
      query: ({ moduleId, body }) => ({
        url: `/modules/${moduleId}/lessons`,
        method: "POST",
        body,
      }),
      transformResponse: (resp: ApiSuccess<{ lesson: Lesson }>) => resp.data,
      invalidatesTags: (_res, _err, { moduleId, courseId }) => moduleTag(courseId, moduleId),
    }),
    updateLesson: build.mutation<
      { lesson: Lesson },
      { moduleId: string; lessonId: string; courseId: string; body: UpdateLessonBody }
    >({
      query: ({ moduleId, lessonId, body }) => ({
        url: `/modules/${moduleId}/lessons/${lessonId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (resp: ApiSuccess<{ lesson: Lesson }>) => resp.data,
      invalidatesTags: (_res, _err, { moduleId, courseId }) => moduleTag(courseId, moduleId),
    }),
    deleteLesson: build.mutation<
      void,
      { moduleId: string; lessonId: string; courseId: string }
    >({
      query: ({ moduleId, lessonId }) => ({
        url: `/modules/${moduleId}/lessons/${lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { moduleId, courseId }) => moduleTag(courseId, moduleId),
    }),
    publishLesson: build.mutation<
      { lesson: Lesson },
      { moduleId: string; lessonId: string; courseId: string; isPublished: boolean }
    >({
      query: ({ moduleId, lessonId, isPublished }) => ({
        url: `/modules/${moduleId}/lessons/${lessonId}/publish`,
        method: "PATCH",
        body: { isPublished },
      }),
      transformResponse: (resp: ApiSuccess<{ lesson: Lesson }>) => resp.data,
      invalidatesTags: (_res, _err, { moduleId, courseId }) => moduleTag(courseId, moduleId),
    }),
  }),
});

export const {
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  usePublishLessonMutation,
} = lessonApi;
