import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-surface-secondary p-3">
          <Icon size={24} className="text-[var(--color-text-tertiary)]" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">{description}</p>
      {action && (
        <Button variant="primary" size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
