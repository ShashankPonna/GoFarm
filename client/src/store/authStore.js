import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),

      setToken: (token) => set({ token }),

      logout: async () => {
        try {
          await signOut(auth);
        } catch (e) {
          console.warn('Firebase sign out error:', e);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'gofarm-auth',
    }
  )
);
