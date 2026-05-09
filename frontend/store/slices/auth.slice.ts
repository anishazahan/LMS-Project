import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "@/lib/api/endpoints";
import { setAuthToken } from "@/lib/api/axios";
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

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (body: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.login(body);
    } catch (e) {
      const err = e as { message?: string };
      return rejectWithValue(err.message || "Login failed");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (
    body: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      role?: "student" | "instructor";
    },
    { rejectWithValue }
  ) => {
    try {
      return await authApi.register(body);
    } catch (e) {
      const err = e as { message?: string };
      return rejectWithValue(err.message || "Registration failed");
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  "auth/fetchMe",
  async (_: void, { rejectWithValue }) => {
    try {
      return await authApi.me();
    } catch (e) {
      const err = e as { message?: string };
      return rejectWithValue(err.message || "Failed to fetch user");
    }
  }
);

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
          setAuthToken(token);
        } catch {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
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
      setAuthToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (
      state: AuthState,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = "authenticated";
      state.error = null;
      setAuthToken(action.payload.token);
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload.user));
      }
    };

    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, handleAuthSuccess)
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = (action.payload as string) || "Login failed";
      })
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, handleAuthSuccess)
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = (action.payload as string) || "Registration failed";
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.status = "authenticated";
        if (typeof window !== "undefined") {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(action.payload.user));
        }
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.status = "unauthenticated";
        setAuthToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      });
  },
});

export const { hydrate, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
