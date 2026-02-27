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
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex-1 min-w-0 px-2 py-2.5 text-xs font-medium transition-colors text-center',
            activeTab === tab.id
              ? 'text-brand-500'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          <span className="flex items-center justify-center gap-1">
            <span className="truncate">{tab.label}</span>
            {undefined !== tab.count && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] shrink-0',
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
