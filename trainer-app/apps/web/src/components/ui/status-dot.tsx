import { cn } from '@/lib/utils';

type Status = 'active' | 'inactive' | 'at-risk' | 'overdue' | 'flagged' | 'new';

const statusStyles: Record<Status, { dot: string; label: string; text: string }> = {
  active:   { dot: 'bg-success-500', label: 'Active',   text: 'text-success-700 dark:text-emerald-400' },
  inactive: { dot: 'bg-[var(--color-text-tertiary)]', label: 'Inactive', text: 'text-[var(--color-text-tertiary)]' },
  'at-risk': { dot: 'bg-error-500', label: 'At Risk',  text: 'text-error-700 dark:text-red-400' },
  overdue:  { dot: 'bg-warning-500', label: 'Overdue',  text: 'text-warning-700 dark:text-amber-400' },
  flagged:  { dot: 'bg-warning-500', label: 'Flagged',  text: 'text-warning-700 dark:text-amber-400' },
  new:      { dot: 'bg-blue-500', label: 'New',      text: 'text-blue-700 dark:text-blue-400' },
};

interface StatusDotProps {
  status: Status;
  showLabel?: boolean;
  className?: string;
}

export function StatusDot({ status, showLabel, className }: StatusDotProps) {
  const config = statusStyles[status] || statusStyles.inactive;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('h-2 w-2 rounded-full', config.dot)} />
      {showLabel && (
        <span className={cn('text-body-xs font-medium', config.text)}>{config.label}</span>
      )}
    </span>
  );
}
