'use client';

import Link from 'next/link';
import { Calendar, Dumbbell, Globe, Lock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MockTemplate } from '@/lib/mock-data';

interface ProgramCardProps {
  template: MockTemplate;
  onDelete?: (id: string) => void;
}

export function ProgramCard({ template, onDelete }: ProgramCardProps) {
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-card-hover hover-limitless">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link href={`/programs/${template.id}`}>
            <h3 className="font-semibold text-[var(--color-text-primary)] hover:text-brand-500 transition-colors truncate">
              {template.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {template.description}
          </p>
        </div>
        <Badge variant={template.is_public ? 'info' : 'default'} className="ml-2 shrink-0">
          {template.is_public ? (
            <span className="flex items-center gap-1"><Globe size={10} /> Public</span>
          ) : (
            <span className="flex items-center gap-1"><Lock size={10} /> Private</span>
          )}
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {template.weeks}w &times; {template.days_per_week}d
        </span>
        <span className="flex items-center gap-1">
          <Dumbbell size={12} />
          {template.exercise_count} exercises
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border">
        <Link
          href={`/programs/${template.id}`}
          className="text-xs font-medium text-brand-500 hover:text-brand-600"
        >
          Edit Program
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(template.id)}
            className="ml-auto rounded-md p-1 text-[var(--color-text-tertiary)] hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </Card>
  );
}
