import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStorage } from './auth';

/**
 * NON-NEGOTIABLE RULE #1:
 * client.ts reads BASE_URL only from the environment variable.
 * Every other file imports this shared axios instance.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
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

// Request Interceptor: Attach Bearer JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle HTML responses, 401 & Silent Refresh
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns HTML (e.g. redirected to Django login or 404/500 HTML page)
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!DOCTYPE') ||
       response.data.trim().startsWith('<html') ||
       String(response.headers['content-type'] || '').includes('text/html'))
    ) {
      return Promise.reject(
        new Error('Invalid API response: Expected JSON but received HTML. The backend may be redirecting to a login page or misconfigured.')
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        authStorage.clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Attempt refresh
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        authStorage.setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        authStorage.clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
