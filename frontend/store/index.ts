import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "@/lib/api/api-slice";
import authReducer from "./slices/auth.slice";
import uiReducer from "./slices/ui.slice";
import { errorToastMiddleware } from "./middleware/error-toast";

// Eagerly register all injected endpoints so HMR / lazy component loads can't
// leave the middleware with a stale definitions map.
import "@/lib/api/auth.api";
import "@/lib/api/user.api";
import "@/lib/api/course.api";
import "@/lib/api/module.api";
import "@/lib/api/lesson.api";
import "@/lib/api/instructor.api";
import "@/lib/api/payment.api";
import "@/lib/api/review.api";

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefault) =>
      getDefault().concat(apiSlice.middleware, errorToastMiddleware),
    devTools: process.env.NODE_ENV !== "production",
  });
  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
