// ============================================
// SAFEGUARD — Centralized API Client
// All requests flow through the Vite proxy → API Gateway :8080
// ============================================
import axios from 'axios';

// Create the axios instance — baseURL is empty so Vite proxy handles routing
const api = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ────────────────────────────────────────────
// Injects the JWT Bearer token from persisted auth state on every request
api.interceptors.request.use(
  (config) => {
    // Read token directly from localStorage (authStore persists it there)
    try {
      const raw = localStorage.getItem('safeguard-auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────
// Normalises responses and handles 401 (expired token → auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login
      try {
        localStorage.removeItem('safeguard-auth');
      } catch {
        // ignore
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Helper ─────────────────────────────────────────────────────────
// Extracts the `data` field from the standard SafeGuard response wrapper:
// { "status": "SUCCESS", "data": {...}, "message": "..." }
export function extractData(response) {
  return response.data?.data ?? response.data;
}

export default api;
