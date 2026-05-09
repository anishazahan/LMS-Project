import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { TOKEN_STORAGE_KEY } from "@/lib/constants";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 30_000,
});

// Allow non-React modules to read the current token without circular Redux imports.
let memoryToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  memoryToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};
export const getAuthToken = () => {
  if (memoryToken) return memoryToken;
  if (typeof window !== "undefined") {
    memoryToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return memoryToken;
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type ErrorListener = (status: number, message: string) => void;
const errorListeners = new Set<ErrorListener>();
export const onApiError = (fn: ErrorListener) => {
  errorListeners.add(fn);
  return () => errorListeners.delete(fn);
};

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; details?: unknown }>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network error — please try again";

    if (status === 401 && typeof window !== "undefined") {
      setAuthToken(null);
    }

    errorListeners.forEach((fn) => fn(status, message));

    return Promise.reject({
      status,
      message,
      details: error.response?.data?.details,
      raw: error,
    });
  }
);
