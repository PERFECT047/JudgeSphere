import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { handleFrontendError } from "../common/errorHandler";
import { store } from "../app/store";
import { env as clientEnv } from "@repo/env/client";
import { HttpStatus } from "@repo/dto";

/** Extended config with optional retry flag */
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const instance = axios.create({
  baseURL: clientEnv.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/** Routes that should NOT trigger token refresh on 401 */
const AUTH_ROUTES = ["/user/login", "/user/signup"];

instance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

instance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Don't intercept 401 on login/signup — let the error flow to the thunk
    if (
      error.response?.status === HttpStatus.UNAUTHORIZED &&
      !originalRequest._retry &&
      !AUTH_ROUTES.some((route) => originalRequest.url?.includes(route))
    ) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token: string | null) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{ token: string }>(
          `${clientEnv.VITE_API_URL}/user/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data;

        // Store the new token
        localStorage.setItem("token", token);
        store.dispatch({ type: "auth/updateToken", payload: token });

        originalRequest.headers.Authorization = `Bearer ${token}`;
        processQueue(null, token);
        isRefreshing = false;

        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("token");
        store.dispatch({ type: "auth/logout" });
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    const axiosError = error as AxiosError<{ message?: string }>;
    const message =
      axiosError.response?.data?.message || error.message || "Request failed";

    handleFrontendError(message);

    return Promise.reject(error);
  }
);

export default instance;