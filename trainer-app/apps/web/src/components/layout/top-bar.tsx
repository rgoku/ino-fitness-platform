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
    <header className="sticky top-0 z-30 flex h-11 items-center gap-3 bg-[var(--color-surface)] px-4 lg:px-6">
      {/* Mobile menu */}
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-[5px] p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] lg:hidden"
      >
        <Menu size={18} strokeWidth={1.8} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search
          size={15}
          strokeWidth={1.8}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'w-full rounded-md border-0 bg-[var(--color-surface-tertiary)] py-1 pl-8 pr-3 text-sm',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
            'focus:bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]'
          )}
        />
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={toggleTheme}
          className="rounded-[5px] p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] transition-colors duration-75"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
        </button>

        <NotificationPanel />
      </div>
    </header>
  );
}
