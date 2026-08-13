// ============================================
// SAFEGUARD — Auth Store
// ============================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MOCK_USERS = {
  'oc@safeguard.gov': {
    id: 'usr-oc-001', email: 'oc@safeguard.gov', name: 'Supt. Debashis Roy',
    role: 'OC', stationId: 'st-001', stationName: 'Lalbazar HQ',
    avatar: null, badge: 'OC-1001',
  },
  'sp@safeguard.gov': {
    id: 'usr-sp-001', email: 'sp@safeguard.gov', name: 'SP Ananya Bose',
    role: 'SP', stationId: null, stationName: 'Kolkata District',
    avatar: null, badge: 'SP-0042',
  },
  'admin@safeguard.gov': {
    id: 'usr-adm-001', email: 'admin@safeguard.gov', name: 'Super Admin',
    role: 'SUPER_ADMIN', stationId: null, stationName: 'National HQ',
    avatar: null, badge: 'ADM-0001',
  },
};

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
        // Simulate API call to auth-service:8081
        await new Promise(r => setTimeout(r, 800));

        const mockUser = MOCK_USERS[email.toLowerCase()];
        if (mockUser && password === 'safeguard123') {
          const token = `mock-jwt-${Date.now()}-${mockUser.role}`;
          set({ user: mockUser, token, isAuthenticated: true, isLoading: false, error: null });
          return { success: true };
        } else {
          set({ isLoading: false, error: 'Invalid credentials. Use oc@safeguard.gov / sp@safeguard.gov / admin@safeguard.gov with password: safeguard123' });
          return { success: false };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),

      // Role checks
      isOC: () => get().user?.role === 'OC',
      isSP: () => get().user?.role === 'SP',
      isSuperAdmin: () => get().user?.role === 'SUPER_ADMIN',
      canSeeAllStations: () => ['SP', 'SUPER_ADMIN'].includes(get().user?.role),
      getUserStationId: () => get().user?.stationId,
    }),
    { name: 'safeguard-auth', partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }) }
  )
);
