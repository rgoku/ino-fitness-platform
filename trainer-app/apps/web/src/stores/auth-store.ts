'use client';

import { create } from 'zustand';

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
}

// Mock coach user for development
const MOCK_COACH: AuthUser = {
  id: 'coach-1',
  email: 'sarah@inocoach.com',
  name: 'Sarah Mitchell',
  role: 'trainer',
  avatar_url: undefined,
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: MOCK_COACH,
  isLoading: false,
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
