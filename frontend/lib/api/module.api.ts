import { apiSlice } from "./api-slice";
import type { ApiSuccess, Module } from "@/types";

export interface CreateModuleBody {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface UpdateModuleBody {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export const moduleApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getModulesByCourse: build.query<{ modules: Module[] }, string>({
      query: (courseId) => `/modules/course/${courseId}`,
      transformResponse: (resp: ApiSuccess<{ modules: Module[] }>) => resp.data,
      providesTags: (result, _err, courseId) =>
        result
          ? [
              ...result.modules.map((m) => ({ type: "Module" as const, id: m._id })),
              { type: "Module" as const, id: `course-${courseId}` },
            ]
          : [{ type: "Module" as const, id: `course-${courseId}` }],
    }),
    createModule: build.mutation<{ module: Module }, CreateModuleBody>({
      query: (body) => ({ url: "/modules", method: "POST", body }),
      transformResponse: (resp: ApiSuccess<{ module: Module }>) => resp.data,
      invalidatesTags: (_res, _err, { courseId }) => [
        { type: "Module", id: `course-${courseId}` },
        { type: "Course", id: courseId },
        { type: "InstructorCourse", id: courseId },
      ],
    }),
    updateModule: build.mutation<
      { module: Module },
      { id: string; courseId: string; body: UpdateModuleBody }
    >({
      query: ({ id, body }) => ({ url: `/modules/${id}`, method: "PATCH", body }),
      transformResponse: (resp: ApiSuccess<{ module: Module }>) => resp.data,
      invalidatesTags: (_res, _err, { id, courseId }) => [
        { type: "Module", id },
        { type: "Module", id: `course-${courseId}` },
      ],
    }),
    deleteModule: build.mutation<void, { id: string; courseId: string }>({
      query: ({ id }) => ({ url: `/modules/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, { id, courseId }) => [
        { type: "Module", id },
        { type: "Module", id: `course-${courseId}` },
        { type: "Course", id: courseId },
      ],
    }),
    publishModule: build.mutation<
      { module: Module },
      { id: string; courseId: string; isPublished: boolean }
    >({
      query: ({ id, isPublished }) => ({
        url: `/modules/${id}/publish`,
        method: "PATCH",
        body: { isPublished },
      }),
      transformResponse: (resp: ApiSuccess<{ module: Module }>) => resp.data,
      invalidatesTags: (_res, _err, { id, courseId }) => [
        { type: "Module", id },
        { type: "Module", id: `course-${courseId}` },
      ],
    }),
  }),
});

export const {
  useGetModulesByCourseQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useDeleteModuleMutation,
  usePublishModuleMutation,
} = moduleApi;
