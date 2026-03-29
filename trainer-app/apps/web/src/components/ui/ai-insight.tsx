'use client';

import { cn } from '@/lib/utils';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronRight } from 'lucide-react';

type InsightType = 'suggestion' | 'alert' | 'trend' | 'insight';

interface AIInsightProps {
  type?: InsightType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const typeConfig = {
  suggestion: {
    icon: Lightbulb,
    iconBg: 'bg-brand-50 dark:bg-brand-900/20',
    iconColor: 'text-brand-600 dark:text-brand-400',
    border: 'border-brand-200/60 dark:border-brand-800/40',
    bg: 'bg-brand-50/40 dark:bg-brand-950/20',
  },
  alert: {
    icon: AlertTriangle,
    iconBg: 'bg-warning-50 dark:bg-amber-900/20',
    iconColor: 'text-warning-600 dark:text-amber-400',
    border: 'border-warning-200/60 dark:border-amber-800/40',
    bg: 'bg-warning-50/40 dark:bg-amber-950/20',
  },
  trend: {
    icon: TrendingUp,
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    bg: 'bg-blue-50/40 dark:bg-blue-950/20',
  },
  insight: {
    icon: Sparkles,
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200/60 dark:border-purple-800/40',
    bg: 'bg-purple-50/40 dark:bg-purple-950/20',
  },
};

export function AIInsight({ type = 'insight', title, description, action, className }: AIInsightProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors duration-150',
        config.border,
        config.bg,
        className
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            config.iconBg
          )}
        >
          <Icon size={16} className={config.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles size={12} className="text-brand-500" />
            <span className="text-body-xs font-medium text-brand-600 dark:text-brand-400">AI Insight</span>
          </div>
          <p className="text-sub-sm text-[var(--color-text-primary)]">{title}</p>
          <p className="mt-0.5 text-body-sm text-[var(--color-text-secondary)]">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 inline-flex items-center gap-1 text-body-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              {action.label}
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Compact AI insight for inline use */
export function AIInsightInline({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-lg bg-brand-50/50 dark:bg-brand-950/20 px-3 py-2', className)}>
      <Sparkles size={14} className="shrink-0 text-brand-500" />
      <p className="text-body-xs text-brand-700 dark:text-brand-300">{message}</p>
    </div>
  );
}
