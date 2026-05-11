import { apiSlice } from "./api-slice";
import type {
  ApiSuccess,
  InstructorReviewAnalytics,
  RatingSummary,
  Review,
} from "@/types";

export interface ReviewListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReviewListResponse {
  items: Review[];
  meta: ReviewListMeta;
}

export interface AddReviewBody {
  rating: number;
  comment: string;
}

export interface UpdateReviewBody {
  rating?: number;
  comment?: string;
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) search.append(k, String(v));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    listCourseReviews: build.query<
      ReviewListResponse,
      { courseId: string; page?: number; limit?: number }
    >({
      query: ({ courseId, page, limit }) =>
        `/reviews/course/${courseId}${buildQuery({ page, limit })}`,
      transformResponse: (resp: ApiSuccess<Review[]> & { meta: ReviewListMeta }) => ({
        items: resp.data,
        meta: resp.meta,
      }),
      providesTags: (result, _err, { courseId }) =>
        result
          ? [
              ...result.items.map((r) => ({ type: "Review" as const, id: r._id })),
              { type: "Review" as const, id: `LIST-${courseId}` },
            ]
          : [{ type: "Review" as const, id: `LIST-${courseId}` }],
    }),

    getRatingSummary: build.query<RatingSummary, string>({
      query: (courseId) => `/reviews/course/${courseId}/summary`,
      transformResponse: (resp: ApiSuccess<{ summary: RatingSummary }>) => resp.data.summary,
      providesTags: (_res, _err, courseId) => [{ type: "RatingSummary", id: courseId }],
    }),

    getTestimonials: build.query<{ items: Review[] }, { limit?: number } | void>({
      query: (params) => `/reviews/testimonials${buildQuery(params ?? {})}`,
      transformResponse: (resp: ApiSuccess<{ items: Review[] }>) => resp.data,
      providesTags: [{ type: "Testimonials", id: "LIST" }],
    }),

    listMyReviews: build.query<{ items: Review[] }, void>({
      query: () => `/reviews/me`,
      transformResponse: (resp: ApiSuccess<{ items: Review[] }>) => resp.data,
      providesTags: [{ type: "MyReviews", id: "LIST" }],
    }),

    getInstructorReviewAnalytics: build.query<
      { analytics: InstructorReviewAnalytics },
      void
    >({
      query: () => `/reviews/instructor/analytics`,
      transformResponse: (resp: ApiSuccess<{ analytics: InstructorReviewAnalytics }>) => resp.data,
      providesTags: [{ type: "InstructorReviewAnalytics", id: "ME" }],
    }),

    addReview: build.mutation<{ review: Review }, { courseId: string } & AddReviewBody>({
      query: ({ courseId, ...body }) => ({
        url: `/reviews/course/${courseId}`,
        method: "POST",
        body,
      }),
      transformResponse: (resp: ApiSuccess<{ review: Review }>) => resp.data,
      invalidatesTags: (_res, _err, { courseId }) => [
        { type: "Review", id: `LIST-${courseId}` },
        { type: "RatingSummary", id: courseId },
        { type: "PublicCourse", id: courseId },
        { type: "Course", id: courseId },
        { type: "MyReviews", id: "LIST" },
        { type: "Testimonials", id: "LIST" },
        { type: "InstructorReviewAnalytics", id: "ME" },
      ],
    }),

    updateReview: build.mutation<
      { review: Review },
      { id: string; courseId: string } & UpdateReviewBody
    >({
      query: ({ id, rating, comment }) => ({
        url: `/reviews/${id}`,
        method: "PATCH",
        body: { rating, comment },
      }),
      transformResponse: (resp: ApiSuccess<{ review: Review }>) => resp.data,
      invalidatesTags: (_res, _err, { id, courseId }) => [
        { type: "Review", id },
        { type: "Review", id: `LIST-${courseId}` },
        { type: "RatingSummary", id: courseId },
        { type: "PublicCourse", id: courseId },
        { type: "Course", id: courseId },
        { type: "MyReviews", id: "LIST" },
        { type: "Testimonials", id: "LIST" },
        { type: "InstructorReviewAnalytics", id: "ME" },
      ],
    }),

    deleteReview: build.mutation<{ id: string }, { id: string; courseId: string }>({
      query: ({ id }) => ({ url: `/reviews/${id}`, method: "DELETE" }),
      transformResponse: (resp: ApiSuccess<{ id: string }>) => resp.data,
      invalidatesTags: (_res, _err, { id, courseId }) => [
        { type: "Review", id },
        { type: "Review", id: `LIST-${courseId}` },
        { type: "RatingSummary", id: courseId },
        { type: "PublicCourse", id: courseId },
        { type: "Course", id: courseId },
        { type: "MyReviews", id: "LIST" },
        { type: "Testimonials", id: "LIST" },
        { type: "InstructorReviewAnalytics", id: "ME" },
      ],
    }),
  }),
});

export const {
  useListCourseReviewsQuery,
  useGetRatingSummaryQuery,
  useGetTestimonialsQuery,
  useListMyReviewsQuery,
  useGetInstructorReviewAnalyticsQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
