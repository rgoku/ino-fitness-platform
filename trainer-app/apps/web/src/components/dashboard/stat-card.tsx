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
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  return (
    <div className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors duration-100 hover:bg-[var(--color-surface-secondary)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">
          {label}
        </p>
        <div
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md',
            iconColor || 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]'
          )}
        >
          <Icon size={15} strokeWidth={1.8} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">{value}</p>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs',
              trend.direction === 'up' && 'text-emerald-600 dark:text-emerald-400',
              trend.direction === 'down' && 'text-red-600 dark:text-red-400',
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
