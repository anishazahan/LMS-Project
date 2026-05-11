import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { TOKEN_STORAGE_KEY } from "@/lib/constants";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem("educart.user");
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Me",
    "User",
    "Course",
    "InstructorCourse",
    "Module",
    "Lesson",
    "PublicCourse",
    "PublicInstructor",
    "Payment",
    "Enrollment",
    "InstructorStats",
    "Review",
    "RatingSummary",
    "Testimonials",
    "MyReviews",
    "InstructorReviewAnalytics",
  ],
  endpoints: () => ({}),
});
