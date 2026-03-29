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
    <div className={cn('flex gap-1 border-b border-[var(--color-border-light)]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative px-4 py-2.5 text-body-sm font-medium transition-colors duration-100 rounded-t-md',
            activeTab === tab.id
              ? 'text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          )}
        >
          <span className="flex items-center gap-1.5">
            <span>{tab.label}</span>
            {undefined !== tab.count && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-body-xs tabular-nums',
                  activeTab === tab.id
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]'
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-brand-500" />
          )}
        </button>
      ))}
    </div>
  );
}
