'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { direction: 'up' | 'down' | 'neutral'; value: string };
  iconColor?: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, iconColor, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <Skeleton className="h-3 w-20 mb-4" />
        <Skeleton className="h-7 w-14" />
      </div>
    );
  }

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  return (
    <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs transition-all duration-150 hover:shadow-card hover:border-[var(--color-text-tertiary)]/30">
      <div className="flex items-center justify-between mb-4">
        <p className="text-body-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          {label}
        </p>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150',
            iconColor || 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]'
          )}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">{value}</p>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-body-xs font-medium',
              trend.direction === 'up' && 'text-success-600 dark:text-emerald-400',
              trend.direction === 'down' && 'text-error-600 dark:text-red-400',
              trend.direction === 'neutral' && 'text-[var(--color-text-tertiary)]'
            )}
          >
            <TrendIcon size={12} strokeWidth={2} />
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
