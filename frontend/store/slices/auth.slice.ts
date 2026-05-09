import { createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "@/lib/api/auth.api";
import { userApi } from "@/lib/api/user.api";
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/lib/constants";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  hydrated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  hydrated: false,
  error: null,
};

const persistToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const persistUser = (user: User | null) => {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_STORAGE_KEY);
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrate(state) {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const userRaw = localStorage.getItem(USER_STORAGE_KEY);
      if (token && userRaw) {
        try {
          state.token = token;
          state.user = JSON.parse(userRaw) as User;
          state.status = "authenticated";
        } catch {
          persistToken(null);
          persistUser(null);
          state.status = "unauthenticated";
        }
      } else {
        state.status = "unauthenticated";
      }
      state.hydrated = true;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated";
      state.error = null;
      persistToken(null);
      persistUser(null);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      persistUser(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(
          authApi.endpoints.login.matchPending,
          authApi.endpoints.register.matchPending,
        ),
        (state) => {
          state.status = "loading";
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          authApi.endpoints.login.matchFulfilled,
          authApi.endpoints.register.matchFulfilled,
        ),
        (state, action) => {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.status = "authenticated";
          state.error = null;
          persistToken(action.payload.token);
          persistUser(action.payload.user);
        },
      )
      .addMatcher(
        isAnyOf(
          authApi.endpoints.login.matchRejected,
          authApi.endpoints.register.matchRejected,
        ),
        (state, action) => {
          state.status = "unauthenticated";
          const errPayload = action.payload as { data?: { message?: string } } | undefined;
          state.error =
            errPayload?.data?.message || action.error?.message || "Authentication failed";
        },
      )
      .addMatcher(
        isAnyOf(
          authApi.endpoints.me.matchFulfilled,
          userApi.endpoints.getMe.matchFulfilled,
        ),
        (state, action) => {
          state.user = action.payload.user;
          state.status = "authenticated";
          persistUser(action.payload.user);
        },
      )
      .addMatcher(userApi.endpoints.updateProfile.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        persistUser(action.payload.user);
      })
      .addMatcher(userApi.endpoints.uploadProfileImage.matchFulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, profileImage: action.payload.profileImage };
          persistUser(state.user);
        }
      })
      .addMatcher(userApi.endpoints.deleteProfileImage.matchFulfilled, (state) => {
        if (state.user) {
          state.user = { ...state.user, profileImage: { url: null, publicId: null } };
          persistUser(state.user);
        }
      });
  },
});

export const { hydrate, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
