import axios from "axios";
import { handleFrontendError } from "../common/errorHandler";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Normalize error shape so frontend code can safely read `error.message`
interface NormalizedError extends Error {
  status?: number;
}

instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message || error?.message || "Request failed";

    const normalized: NormalizedError = new Error(message);
    normalized.status = error?.response?.status;
    handleFrontendError(normalized);

    return Promise.reject(normalized);
  }
);

export default instance;
