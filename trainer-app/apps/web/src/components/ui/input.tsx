import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'block w-full rounded-lg border bg-surface px-3 py-2 text-sm text-[var(--color-text-primary)]',
          'placeholder:text-[var(--color-text-tertiary)]',
          'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-500' : 'border-border',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
