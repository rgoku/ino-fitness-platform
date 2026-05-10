'use client';

import { Search, Sun, Moon, Menu, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme-store';
import { useSidebarStore } from '@/stores/sidebar-store';
import { NotificationPanel } from './notification-panel';

interface TopBarProps {
  onOpenCommandPalette?: () => void;
}

export function TopBar({ onOpenCommandPalette }: TopBarProps) {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-[var(--color-border-light)] bg-[var(--color-surface)]/80 backdrop-blur-xl px-4 lg:px-8">
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] lg:hidden transition-colors"
      >
        <Menu size={18} strokeWidth={1.6} />
      </button>

      {/* Search — opens command palette */}
      <button
        onClick={onOpenCommandPalette}
        className={cn(
          'group relative flex-1 max-w-md flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] py-2 pl-9 pr-12 text-left transition-all duration-150',
          'hover:border-brand-500/50 hover:bg-[var(--color-surface)]'
        )}
      >
        <Search
          size={15}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] group-hover:text-brand-500 transition-colors"
        />
        <span className="text-body-sm text-[var(--color-text-tertiary)]">Search clients, programs...</span>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[var(--color-text-tertiary)]">
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-body-xs font-medium">
            <Command size={10} /> K
          </kbd>
        </div>
      </button>

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
