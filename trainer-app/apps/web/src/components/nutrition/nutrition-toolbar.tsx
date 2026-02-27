'use client';

import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NutritionToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  evidenceFilter: string;
  onEvidenceFilterChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  onGenerateClick: () => void;
}

const evidenceOptions = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'Strong' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'preliminary', label: 'Preliminary' },
];

export function NutritionToolbar({
  search,
  onSearchChange,
  evidenceFilter,
  onEvidenceFilterChange,
  sourceFilter,
  onSourceFilterChange,
  onGenerateClick,
}: NutritionToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <Search
          size={15}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
        <input
          type="text"
          placeholder="Search plans or clients..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-8 pr-3 py-1.5',
            'text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
            'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]'
          )}
        />
      </div>

      {/* Evidence filter — segmented buttons */}
      <div className="flex rounded-lg border border-[var(--color-border)] overflow-hidden">
        {evidenceOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onEvidenceFilterChange(opt.value)}
            className={cn(
              'px-2.5 py-1.5 text-xs font-medium transition-colors',
              evidenceFilter === opt.value
                ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Source filter */}
      <select
        value={sourceFilter}
        onChange={(e) => onSourceFilterChange(e.target.value)}
        className={cn(
          'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5',
          'text-xs font-medium text-[var(--color-text-secondary)]',
          'focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]',
          'cursor-pointer'
        )}
      >
        <option value="all">All sources</option>
        <option value="ai">AI-generated</option>
        <option value="coach">Coach-written</option>
      </select>

      {/* Generate button */}
      <Button size="sm" onClick={onGenerateClick} className="ml-auto">
        <Plus size={14} />
        Generate Plan
      </Button>
    </div>
  );
}
