'use client';

import { GripVertical, Trash2 } from 'lucide-react';
import type { MockTemplateExercise } from '@/lib/mock-data';

interface ExerciseRowProps {
  exercise: MockTemplateExercise;
  index: number;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
}

export function ExerciseRow({ exercise, index, onUpdate, onDelete }: ExerciseRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-surface-secondary">
      <GripVertical size={14} className="shrink-0 text-[var(--color-text-tertiary)] cursor-grab" />
      <span className="w-6 shrink-0 text-xs text-[var(--color-text-tertiary)]">{index + 1}</span>

      <input
        type="text"
        value={exercise.exercise_name}
        onChange={(e) => onUpdate(exercise.id, 'exercise_name', e.target.value)}
        className="flex-1 min-w-0 rounded border-0 bg-transparent px-2 py-1 text-sm font-medium text-[var(--color-text-primary)] focus:bg-surface-secondary focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Exercise name"
      />

      <input
        type="number"
        value={exercise.sets}
        onChange={(e) => onUpdate(exercise.id, 'sets', parseInt(e.target.value) || 0)}
        className="w-14 rounded border border-border bg-surface px-2 py-1 text-center text-sm text-[var(--color-text-primary)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Sets"
        title="Sets"
      />

      <input
        type="text"
        value={exercise.reps}
        onChange={(e) => onUpdate(exercise.id, 'reps', e.target.value)}
        className="w-20 rounded border border-border bg-surface px-2 py-1 text-center text-sm text-[var(--color-text-primary)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Reps"
        title="Reps"
      />

      <input
        type="number"
        value={exercise.rest_seconds}
        onChange={(e) => onUpdate(exercise.id, 'rest_seconds', parseInt(e.target.value) || 0)}
        className="w-16 rounded border border-border bg-surface px-2 py-1 text-center text-sm text-[var(--color-text-primary)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Rest (s)"
        title="Rest (seconds)"
      />

      <button
        onClick={() => onDelete(exercise.id)}
        className="shrink-0 rounded-md p-1 text-[var(--color-text-tertiary)] hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
