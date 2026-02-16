'use client';

import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'text-brand-500'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <span className="flex items-center gap-1.5">
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs',
                  activeTab === tab.id
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'bg-surface-tertiary text-[var(--color-text-tertiary)]'
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
          )}
        </button>
      ))}
    </div>
  );
}
