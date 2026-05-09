import { apiSlice } from "./api-slice";
import type { ApiSuccess, User } from "@/types";

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface UpdateProfileBody {
  name?: string;
  bio?: string;
  socialLinks?: SocialLinks;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileImage {
  url: string | null;
  publicId: string | null;
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<{ user: User }, void>({
      query: () => "/users/me",
      transformResponse: (resp: ApiSuccess<{ user: User }>) => resp.data,
      providesTags: ["Me"],
    }),
    getUserById: build.query<{ user: User }, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (resp: ApiSuccess<{ user: User }>) => resp.data,
      providesTags: (_res, _err, id) => [{ type: "User", id }],
    }),
    updateProfile: build.mutation<{ user: User }, UpdateProfileBody>({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      transformResponse: (resp: ApiSuccess<{ user: User }>) => resp.data,
      invalidatesTags: ["Me"],
    }),
    changePassword: build.mutation<void, ChangePasswordBody>({
      query: (body) => ({ url: "/users/me/password", method: "PATCH", body }),
    }),
    uploadProfileImage: build.mutation<{ profileImage: ProfileImage }, File>({
      query: (file) => {
        const fd = new FormData();
        fd.append("image", file);
        return { url: "/users/me/profile-image", method: "POST", body: fd };
      },
      transformResponse: (resp: ApiSuccess<{ profileImage: ProfileImage }>) => resp.data,
      invalidatesTags: ["Me"],
    }),
    deleteProfileImage: build.mutation<void, void>({
      query: () => ({ url: "/users/me/profile-image", method: "DELETE" }),
      invalidatesTags: ["Me"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
} = userApi;
