'use client';

import { Search, Sun, Moon, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { NotificationPanel } from './notification-panel';
import { useState } from 'react';

export function TopBar() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-md p-1.5 text-[var(--color-text-secondary)] hover:bg-surface-secondary lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
        <input
          type="text"
          placeholder="Search clients, programs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-border bg-surface-secondary py-1.5 pl-9 pr-3 text-sm',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
            'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
          )}
        />
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-surface-secondary hover:text-[var(--color-text-primary)] transition-colors"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <NotificationPanel />
      </div>
    </header>
  );
}
