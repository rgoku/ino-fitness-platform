'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-7 w-16" />
          </div>
        </div>
      </Card>
    );
  }

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;

  return (
    <Card className="p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            iconColor || 'bg-brand-500/10 text-brand-500'
          )}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            {label}
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  trend.direction === 'up' && 'text-emerald-500',
                  trend.direction === 'down' && 'text-red-500',
                  trend.direction === 'neutral' && 'text-[var(--color-text-tertiary)]'
                )}
              >
                <TrendIcon size={12} />
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
