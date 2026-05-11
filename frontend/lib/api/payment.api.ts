import { apiSlice } from "./api-slice";
import type {
  ApiSuccess,
  InstructorStats,
  Payment,
  PurchasedEnrollment,
  ReceiptData,
} from "@/types";

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
  reused?: boolean;
}

export interface SalesListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SalesListResponse {
  items: Payment[];
  meta: SalesListMeta;
}

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    createCheckoutSession: build.mutation<CheckoutSessionResponse, { courseId: string }>({
      query: (body) => ({ url: "/payments/checkout-session", method: "POST", body }),
      transformResponse: (resp: ApiSuccess<CheckoutSessionResponse>) => resp.data,
    }),

    getPaymentBySession: build.query<{ payment: Payment }, string>({
      query: (sessionId) => `/payments/by-session/${sessionId}`,
      transformResponse: (resp: ApiSuccess<{ payment: Payment }>) => resp.data,
      providesTags: (result) =>
        result ? [{ type: "Payment" as const, id: result.payment._id }] : [],
    }),

    listMyPayments: build.query<{ payments: Payment[] }, void>({
      query: () => `/payments/me`,
      transformResponse: (resp: ApiSuccess<{ payments: Payment[] }>) => resp.data,
      providesTags: (result) =>
        result
          ? [
              ...result.payments.map((p) => ({ type: "Payment" as const, id: p._id })),
              { type: "Payment" as const, id: "LIST" },
            ]
          : [{ type: "Payment" as const, id: "LIST" }],
    }),

    getReceiptData: build.query<{ receipt: ReceiptData }, string>({
      query: (paymentId) => `/payments/${paymentId}/receipt-data`,
      transformResponse: (resp: ApiSuccess<{ receipt: ReceiptData }>) => resp.data,
      providesTags: (_res, _err, paymentId) => [{ type: "Payment", id: paymentId }],
    }),

    getStudentPurchases: build.query<{ enrollments: PurchasedEnrollment[] }, void>({
      query: () => `/payments/student/purchases`,
      transformResponse: (resp: ApiSuccess<{ enrollments: PurchasedEnrollment[] }>) => resp.data,
      providesTags: (result) =>
        result
          ? [
              ...result.enrollments.map((e) => ({ type: "Enrollment" as const, id: e._id })),
              { type: "Enrollment" as const, id: "LIST" },
            ]
          : [{ type: "Enrollment" as const, id: "LIST" }],
    }),

    getInstructorStats: build.query<{ stats: InstructorStats }, void>({
      query: () => `/payments/instructor/stats`,
      transformResponse: (resp: ApiSuccess<{ stats: InstructorStats }>) => resp.data,
      providesTags: [{ type: "InstructorStats", id: "ME" }],
    }),

    getInstructorSales: build.query<SalesListResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.page) qs.set("page", String(params.page));
        if (params?.limit) qs.set("limit", String(params.limit));
        const s = qs.toString();
        return `/payments/instructor/sales${s ? `?${s}` : ""}`;
      },
      transformResponse: (resp: ApiSuccess<Payment[]> & { meta: SalesListMeta }) => ({
        items: resp.data,
        meta: resp.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({ type: "Payment" as const, id: p._id })),
              { type: "Payment" as const, id: "SALES" },
            ]
          : [{ type: "Payment" as const, id: "SALES" }],
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetPaymentBySessionQuery,
  useListMyPaymentsQuery,
  useGetReceiptDataQuery,
  useLazyGetReceiptDataQuery,
  useGetStudentPurchasesQuery,
  useGetInstructorStatsQuery,
  useGetInstructorSalesQuery,
} = paymentApi;
