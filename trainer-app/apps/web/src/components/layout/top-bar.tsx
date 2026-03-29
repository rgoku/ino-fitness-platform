'use client';

import { Search, Sun, Moon, Menu, Command } from 'lucide-react';
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[var(--color-border-light)] bg-[var(--color-surface)]/80 backdrop-blur-xl px-4 lg:px-8">
      {/* Mobile menu */}
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] lg:hidden transition-colors"
      >
        <Menu size={18} strokeWidth={1.6} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={15}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
        <input
          type="text"
          placeholder="Search clients, programs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] py-2 pl-9 pr-12 text-body-sm',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
            'transition-all duration-150',
            'focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50'
          )}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[var(--color-text-tertiary)]">
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-body-xs font-medium">
            <Command size={10} /> K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] transition-colors duration-100"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={1.6} /> : <Moon size={16} strokeWidth={1.6} />}
        </button>

        <NotificationPanel />
      </div>
    </header>
  );
}
