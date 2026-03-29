'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

const barColors = {
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  neutral: 'bg-[var(--color-text-tertiary)]',
};

const barSizes = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue,
  size = 'md',
  variant = 'brand',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-body-xs text-[var(--color-text-secondary)]">{label}</span>
          )}
          {showValue && (
            <span className="text-body-xs font-medium tabular-nums text-[var(--color-text-primary)]">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-[var(--color-surface-tertiary)]', barSizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/** Circular progress ring for macros, goals, etc. */
interface MetricRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  unit?: string;
  variant?: 'brand' | 'blue' | 'orange' | 'purple';
  className?: string;
}

const ringColors = {
  brand: 'stroke-brand-500',
  blue: 'stroke-blue-500',
  orange: 'stroke-orange-500',
  purple: 'stroke-purple-500',
};

export function MetricRing({
  value,
  max,
  size = 80,
  strokeWidth = 6,
  label,
  unit,
  variant = 'brand',
  className,
}: MetricRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(value / max, 1);
  const offset = circumference - percentage * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-[var(--color-surface-tertiary)]"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={cn(ringColors[variant], 'transition-all duration-700 ease-out')}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sub-md tabular-nums text-[var(--color-text-primary)]">
            {Math.round(value)}
          </span>
          {unit && (
            <span className="text-body-xs text-[var(--color-text-tertiary)]">{unit}</span>
          )}
        </div>
      </div>
      <span className="text-body-xs text-[var(--color-text-secondary)]">{label}</span>
    </div>
  );
}
