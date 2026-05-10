import { apiSlice } from "./api-slice";
import type { ApiSuccess, Course, PublicInstructor } from "@/types";
import type { CourseListMeta } from "./course.api";

export interface PublicInstructorQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedInstructors {
  data: PublicInstructor[];
  meta: CourseListMeta;
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) search.append(k, String(v));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const instructorApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    listPublicInstructors: build.query<PaginatedInstructors, PublicInstructorQuery | void>({
      query: (params) =>
        `/users/instructors${buildQuery((params ?? {}) as Record<string, string | number | undefined>)}`,
      transformResponse: (resp: ApiSuccess<PublicInstructor[]> & { meta: CourseListMeta }) => ({
        data: resp.data,
        meta: resp.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((i) => ({ type: "PublicInstructor" as const, id: i._id })),
              { type: "PublicInstructor" as const, id: "LIST" },
            ]
          : [{ type: "PublicInstructor" as const, id: "LIST" }],
    }),
    getPublicInstructor: build.query<
      { instructor: PublicInstructor; courses: Course[] },
      string
    >({
      query: (id) => `/users/instructors/${id}`,
      transformResponse: (resp: ApiSuccess<{ instructor: PublicInstructor; courses: Course[] }>) =>
        resp.data,
      providesTags: (_res, _err, id) => [{ type: "PublicInstructor", id }],
    }),
  }),
});

export const { useListPublicInstructorsQuery, useGetPublicInstructorQuery } = instructorApi;
