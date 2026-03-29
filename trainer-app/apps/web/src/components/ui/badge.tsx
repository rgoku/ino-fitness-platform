import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]',
  success: 'bg-success-50 text-success-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  warning: 'bg-warning-50 text-warning-700 dark:bg-amber-900/20 dark:text-amber-400',
  danger: 'bg-error-50 text-error-700 dark:bg-red-900/20 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400',
  outline: 'border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent',
};

const dotColors: Record<string, string> = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-error-500',
  info: 'bg-blue-500',
  brand: 'bg-brand-500',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  dot?: boolean;
}

export function Badge({ className, variant = 'default', dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-body-xs font-medium leading-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant] || 'bg-[var(--color-text-tertiary)]')} />
      )}
      {children}
    </span>
  );
}
