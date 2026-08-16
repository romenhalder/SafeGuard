// ============================================
// SAFEGUARD — Auth Store
// Real JWT login via auth-service (POST /api/auth/admin/login)
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { extractData } from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/api/auth/admin/login', { email, password });
          const data = extractData(res);

          // AuthResponse shape: { token, refreshToken, tokenType, user: { id, email, name, role, ... } }
          const token = data.token ?? data.accessToken;
          const user = data.user ?? {
            id: data.id,
            email: data.email ?? email,
            name: data.name ?? data.fullName,
            role: data.role,
            stationId: data.stationId ?? null,
            stationName: data.stationName ?? null,
            badge: data.badge ?? data.badgeId ?? null,
          };

          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
          return { success: true };
        } catch (err) {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            (err.code === 'ERR_NETWORK'
              ? 'Cannot reach backend. Make sure services are running (run .\\start-local.ps1).'
              : 'Invalid credentials or server error.');
          set({ isLoading: false, error: msg });
          return { success: false };
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } catch {
          // ignore logout errors
        } finally {
          set({ user: null, token: null, isAuthenticated: false, error: null });
        }
      },

      clearError: () => set({ error: null }),

      // Role checks
      isOC: () => get().user?.role === 'OC',
      isSP: () => get().user?.role === 'SP',
      isSuperAdmin: () => get().user?.role === 'SUPER_ADMIN',
      canSeeAllStations: () => ['SP', 'SUPER_ADMIN'].includes(get().user?.role),
      getUserStationId: () => get().user?.stationId,
    }),
    {
      name: 'safeguard-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

