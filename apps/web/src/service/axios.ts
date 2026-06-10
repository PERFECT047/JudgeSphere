import axios from "axios";
import { handleFrontendError } from "../common/errorHandler";
import { store } from "../app/store";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

interface NormalizedError extends Error {
  status?: number;
}

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          const state = store.getState();
          const token = state.auth.token;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<{ token: string }>(
          `${import.meta.env.VITE_API_URL}/user/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data;

        originalRequest.headers.Authorization = `Bearer ${token}`;
        processQueue(null, token);
        isRefreshing = false;

        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    const message =
      error?.response?.data?.message || error?.message || "Request failed";

    const normalized: NormalizedError = new Error(message);
    normalized.status = error?.response?.status;
    handleFrontendError(normalized);

    return Promise.reject(normalized);
  }
);

export default instance;
