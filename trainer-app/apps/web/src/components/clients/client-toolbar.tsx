'use client';

import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ClientToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  onAddClick: () => void;
}

export function ClientToolbar({ search, onSearchChange, view, onViewChange, onAddClick }: ClientToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-border bg-surface-secondary py-2 pl-9 pr-3 text-sm',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
            'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-border p-0.5">
          <button
            onClick={() => onViewChange('list')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              view === 'list'
                ? 'bg-surface-tertiary text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => onViewChange('grid')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              view === 'grid'
                ? 'bg-surface-tertiary text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
        <Button onClick={onAddClick} size="sm">
          <Plus size={14} />
          Add Client
        </Button>
      </div>
    </div>
  );
}
