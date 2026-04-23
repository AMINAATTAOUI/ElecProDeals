import axios from 'axios';
import { encryptedStorage } from '@/lib/mmkvStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.access_token',
  REFRESH_TOKEN: 'auth.refresh_token',
} as const;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor — attach Bearer token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = encryptedStorage.getString(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — refresh token rotation on 401 ──────────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token as string),
  );
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config;
    const status = error.response?.status;

    // Only attempt refresh on 401, and not on auth endpoints themselves
    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest.url?.includes('/auth/')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;
    const refreshToken = encryptedStorage.getString(STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      isRefreshing = false;
      flushQueue(error, null);
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
      );

      encryptedStorage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      encryptedStorage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      flushQueue(null, data.accessToken);

      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      // Clear stored tokens — force re-login
      encryptedStorage.delete(STORAGE_KEYS.ACCESS_TOKEN);
      encryptedStorage.delete(STORAGE_KEYS.REFRESH_TOKEN);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
