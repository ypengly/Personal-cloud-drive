import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/auth-store";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // send the httpOnly refresh cookie
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post("/api/auth/refresh", {}, { withCredentials: true });
  useAuthStore.getState().setAccessToken(data.accessToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/register");

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken();
        const token = await refreshPromise;
        refreshPromise = null;
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        return api.request(original);
      } catch (refreshError) {
        refreshPromise = null;
        useAuthStore.getState().clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { error?: { message?: string } })?.error?.message ?? fallback;
  }
  return fallback;
}
