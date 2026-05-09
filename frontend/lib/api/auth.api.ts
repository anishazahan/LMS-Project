import { apiSlice } from "./api-slice";
import type { ApiSuccess, User } from "@/types";

interface AuthResponseData {
  token: string;
  user: User;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "student" | "instructor";
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponseData, LoginBody>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (resp: ApiSuccess<AuthResponseData>) => resp.data,
      invalidatesTags: ["Me"],
    }),
    register: build.mutation<AuthResponseData, RegisterBody>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (resp: ApiSuccess<AuthResponseData>) => resp.data,
      invalidatesTags: ["Me"],
    }),
    me: build.query<{ user: User }, void>({
      query: () => "/auth/me",
      transformResponse: (resp: ApiSuccess<{ user: User }>) => resp.data,
      providesTags: ["Me"],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useMeQuery, useLazyMeQuery } = authApi;
