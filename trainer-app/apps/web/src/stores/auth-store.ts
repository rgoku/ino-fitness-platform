'use client';

import { create } from 'zustand';
import { api, USE_API } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'trainer' | 'admin';
  avatar_url?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

// Mock coach user for development
const MOCK_COACH: AuthUser = {
  id: 'coach-1',
  email: 'sarah@inocoach.com',
  name: 'Sarah Mitchell',
  role: 'trainer',
  avatar_url: undefined,
};

function getInitialUser(): AuthUser | null {
  if (!USE_API) return MOCK_COACH;
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('ino_auth_user');
  const token = localStorage.getItem('ino_auth_token');
  if (stored && token) {
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }
  return null;
}

function getInitialAuth(): boolean {
  if (!USE_API) return true;
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('ino_auth_token');
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: getInitialUser(),
  isLoading: false,
  isAuthenticated: getInitialAuth(),

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      if (!USE_API) {
        // Mock login for dev mode
        await new Promise((r) => setTimeout(r, 500));
        if (email === 'sarah@inocoach.com' && password === 'password') {
          set({ user: MOCK_COACH, isAuthenticated: true, isLoading: false });
          return;
        }
        throw new Error('Invalid email or password');
      }

      const data = await api.post<{
        access_token: string;
        refresh_token?: string;
        user: AuthUser;
      }>('/api/v1/auth/login', { email, password });

      api.setToken(data.access_token);
      if (data.refresh_token && typeof window !== 'undefined') {
        localStorage.setItem('ino_refresh_token', data.refresh_token);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('ino_auth_user', JSON.stringify(data.user));
      }

      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    api.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ino_refresh_token');
      localStorage.removeItem('ino_auth_user');
    }
    set({ user: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    if (!USE_API) {
      set({ user: MOCK_COACH, isAuthenticated: true });
      return;
    }

    const stored = localStorage.getItem('ino_auth_user');
    const token = localStorage.getItem('ino_auth_token');
    if (stored && token) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        set({ user, isAuthenticated: true });
      } catch {
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
