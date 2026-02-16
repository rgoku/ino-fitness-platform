'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      useThemeStore.getState().setTheme('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return <>{children}</>;
}
