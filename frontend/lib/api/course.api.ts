import { apiSlice } from "./api-slice";
import type { ApiSuccess, Course, CourseCategory, CourseLevel } from "@/types";

export interface CourseListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCourses {
  data: Course[];
  meta: CourseListMeta;
}

export interface PublicCourseQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: CourseCategory;
  level?: CourseLevel;
  instructor?: string;
}

export interface InstructorCourseQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "published" | "unpublished";
}

export interface CreateCourseBody {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  category?: CourseCategory;
  level?: CourseLevel;
}

export type UpdateCourseBody = Partial<CreateCourseBody> & {
  isPublished?: boolean;
};

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) search.append(k, String(v));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    listPublicCourses: build.query<PaginatedCourses, PublicCourseQuery | void>({
      query: (params) => `/courses${buildQuery((params ?? {}) as Record<string, string | number | undefined>)}`,
      transformResponse: (resp: ApiSuccess<Course[]> & { meta: CourseListMeta }) => ({
        data: resp.data,
        meta: resp.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({ type: "PublicCourse" as const, id: c._id })),
              { type: "PublicCourse" as const, id: "LIST" },
            ]
          : [{ type: "PublicCourse" as const, id: "LIST" }],
    }),
    getPublicCourseById: build.query<{ course: Course }, string>({
      query: (id) => `/courses/${id}`,
      transformResponse: (resp: ApiSuccess<{ course: Course }>) => resp.data,
      providesTags: (_res, _err, id) => [{ type: "PublicCourse", id }],
    }),
    getInstructorCourses: build.query<PaginatedCourses, InstructorCourseQuery | void>({
      query: (params) => `/courses/instructor/me${buildQuery((params ?? {}) as Record<string, string | number | undefined>)}`,
      transformResponse: (resp: ApiSuccess<Course[]> & { meta: CourseListMeta }) => ({
        data: resp.data,
        meta: resp.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({ type: "InstructorCourse" as const, id: c._id })),
              { type: "InstructorCourse" as const, id: "LIST" },
            ]
          : [{ type: "InstructorCourse" as const, id: "LIST" }],
    }),
    getCourseById: build.query<{ course: Course }, string>({
      query: (id) => `/courses/${id}`,
      transformResponse: (resp: ApiSuccess<{ course: Course }>) => resp.data,
      providesTags: (_res, _err, id) => [
        { type: "Course", id },
        { type: "InstructorCourse", id },
      ],
    }),
    createCourse: build.mutation<{ course: Course }, CreateCourseBody>({
      query: (body) => ({ url: "/courses", method: "POST", body }),
      transformResponse: (resp: ApiSuccess<{ course: Course }>) => resp.data,
      invalidatesTags: [{ type: "InstructorCourse", id: "LIST" }],
    }),
    updateCourse: build.mutation<{ course: Course }, { id: string; body: UpdateCourseBody }>({
      query: ({ id, body }) => ({ url: `/courses/${id}`, method: "PATCH", body }),
      transformResponse: (resp: ApiSuccess<{ course: Course }>) => resp.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Course", id },
        { type: "InstructorCourse", id },
        { type: "InstructorCourse", id: "LIST" },
      ],
    }),
    deleteCourse: build.mutation<void, string>({
      query: (id) => ({ url: `/courses/${id}`, method: "DELETE" }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Course", id },
        { type: "InstructorCourse", id },
        { type: "InstructorCourse", id: "LIST" },
      ],
    }),
    publishCourse: build.mutation<{ course: Course }, { id: string; isPublished: boolean }>({
      query: ({ id, isPublished }) => ({
        url: `/courses/${id}/publish`,
        method: "PATCH",
        body: { isPublished },
      }),
      transformResponse: (resp: ApiSuccess<{ course: Course }>) => resp.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Course", id },
        { type: "InstructorCourse", id },
        { type: "InstructorCourse", id: "LIST" },
      ],
    }),
    uploadCourseThumbnail: build.mutation<
      { thumbnail: { url: string | null; publicId: string | null } },
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const fd = new FormData();
        fd.append("image", file);
        return { url: `/courses/${id}/thumbnail`, method: "POST", body: fd };
      },
      transformResponse: (
        resp: ApiSuccess<{ thumbnail: { url: string | null; publicId: string | null } }>
      ) => resp.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Course", id },
        { type: "InstructorCourse", id },
      ],
    }),
  }),
});

export const {
  useListPublicCoursesQuery,
  useGetPublicCourseByIdQuery,
  useGetInstructorCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  usePublishCourseMutation,
  useUploadCourseThumbnailMutation,
} = courseApi;
