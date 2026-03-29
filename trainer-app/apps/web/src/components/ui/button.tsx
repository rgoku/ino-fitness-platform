import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

const variants = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-xs hover:shadow-card',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] shadow-xs',
  ghost:
    'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]',
  danger:
    'bg-error-600 text-white hover:bg-error-500 active:bg-red-800 shadow-xs',
  outline:
    'border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-text-tertiary)]',
  accent:
    'bg-[var(--color-accent-soft)] text-brand-600 hover:bg-brand-100 dark:text-brand-400 dark:hover:bg-brand-900/30',
};

const sizes = {
  sm: 'h-8 px-3 text-body-xs gap-1.5',
  md: 'h-9 px-4 text-body-sm gap-2',
  lg: 'h-10 px-5 text-body-md gap-2',
  xl: 'h-11 px-6 text-body-md gap-2.5',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, type = 'button', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150',
          'disabled:pointer-events-none disabled:opacity-40',
          'focus-ring',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
