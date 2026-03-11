import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      setAuth: (token, user) => set({ token, user, role: user?.role }),
      logout: () => set({ token: null, user: null, role: null }),
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    { name: 'mlm-auth', partialize: (s) => ({ token: s.token, user: s.user, role: s.role }) }
  )
);
