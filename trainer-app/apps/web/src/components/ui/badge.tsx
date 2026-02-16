import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
