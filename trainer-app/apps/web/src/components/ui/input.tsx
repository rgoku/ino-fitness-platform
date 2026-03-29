import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-tertiary)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-tertiary)]',
              'transition-colors duration-150',
              'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[var(--color-surface-secondary)]',
              error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : 'border-[var(--color-border)]',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-body-xs text-error-500">{error}</p>
        )}
        {hint && !error && (
          <p className="text-body-xs text-[var(--color-text-tertiary)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-body-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'block w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)]',
          'placeholder:text-[var(--color-text-tertiary)]',
          'transition-colors duration-150 resize-none',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
          error ? 'border-error-500' : 'border-[var(--color-border)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-body-xs text-error-500">{error}</p>}
    </div>
  );
}
