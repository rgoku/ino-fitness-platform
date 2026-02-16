'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: (theme) =>
        set({ theme, resolvedTheme: resolveTheme(theme) }),
      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next = current === 'dark' ? 'light' : 'dark';
        set({ theme: next, resolvedTheme: next });
      },
    }),
    {
      name: 'ino-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.resolvedTheme = resolveTheme(state.theme);
        }
      },
    }
  )
);
