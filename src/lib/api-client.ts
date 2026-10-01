/**
 * api-client.ts — Axios instance with:
 *   1. JWT Bearer token attachment on every request
 *   2. Automatic access-token refresh on 401 (queues concurrent requests)
 *   3. Backend envelope unwrap: { success, data } → data
 *   4. Structured error rejection from backend error shape
 */

import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

// ── Instance ──────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,  // 30s — Vercel serverless cold-start can take up to 15s
  // Note: "Connection" header is a forbidden browser header — browsers set it automatically
});

// ── Request interceptor — attach Bearer token ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Refresh-queue state ───────────────────────────────────────────────────
// Shared across all concurrent requests so only ONE refresh call fires.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

// ── Extended config type to track retry flag ─────────────────────────────
interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// ── Response interceptor — envelope unwrap + 401 refresh ─────────────────
api.interceptors.response.use(
  // ✅ Success: unwrap backend's { success: true, data: T, meta? } envelope.
  // If meta is present (paginated list response), preserve the { data, meta } shape
  // so list hooks receive the full pagination info.
  // If the response is already raw data (e.g. health check), pass it through.
  (res) => {
    const body = res.data;
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      // Paginated: backend sent { success, data: T[], meta: {...} }
      if ("meta" in body && body.meta != null) {
        return { data: body.data, meta: body.meta };
      }
      // Single-resource: backend sent { success, data: T }
      return body.data;
    }
    // Raw response (health check, etc.)
    return body;
  },

  // ❌ Error handler
  async (error) => {
    const originalConfig = error.config as RetryableConfig;

    // ── 401 Unauthorized — try a single token refresh ─────────────────────
    if (error.response?.status === 401 && !originalConfig._retry) {
      // If another request is already refreshing, queue this one
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalConfig.headers = originalConfig.headers ?? {};
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return api(originalConfig);
        });
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        // Use a bare axios call (not our intercepted `api`) to avoid recursion
        const refreshRes = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        // Backend returns { success: true, data: { accessToken, refreshToken } }
        const newAccessToken: string = refreshRes.data?.data?.accessToken ?? refreshRes.data?.accessToken;

        // Persist new token
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Unblock all queued requests
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalConfig.headers = originalConfig.headers ?? {};
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalConfig);
      } catch (refreshError) {
        // Refresh itself failed — session is truly expired
        processQueue(refreshError, null);
        useAuthStore.getState().logout();

        // Only redirect + toast on the client side (no window on SSR)
        if (typeof window !== "undefined") {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Non-401 errors — shape a structured error object ──────────────────
    // Backend error shape: { success: false, error: { code, message, details? } }
    const backendError = error.response?.data?.error;
    const message: string = backendError?.message ?? error.message ?? "Something went wrong";

    return Promise.reject(
      Object.assign(error, {
        message,
        errorData: backendError ?? null,
      })
    );
  }
);

export default api;
