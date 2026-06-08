'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Save, UserPlus } from 'lucide-react';
import { useTemplate } from '@/hooks/use-templates';
import { ExerciseRow } from '@/components/programs/exercise-row';
import { AssignProgramDialog } from '@/components/programs/assign-program-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MockTemplateExercise } from '@/lib/mock-data';

export default function ProgramEditorPage() {
  const params = useParams();
  const templateId = params.id as string;
  const { data: template, isLoading } = useTemplate(templateId);
  const [exercises, setExercises] = useState<MockTemplateExercise[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize exercises from query data
  if (template?.exercises && !initialized) {
    setExercises(template.exercises);
    setInitialized(true);
  }

  const handleUpdate = useCallback((id: string, field: string, value: string | number) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }, []);

  const handleAdd = () => {
    const newEx: MockTemplateExercise = {
      id: `te${Date.now()}`,
      template_id: templateId,
      exercise_name: '',
      sets: 3,
      reps: '8-12',
      rest_seconds: 90,
      notes: '',
      order_index: exercises.length,
    };
    setExercises((prev) => [...prev, newEx]);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-sub-md font-semibold text-[var(--color-text-primary)]">Program not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/programs"
        className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Programs
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
            {template.name}
          </h1>
          <div className="mt-1.5 flex items-center gap-3">
            <Badge>{template.weeks}w &times; {template.days_per_week}d</Badge>
            <span className="text-body-sm text-[var(--color-text-secondary)]">
              {template.description}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setAssignOpen(true)}>
            <UserPlus size={14} />
            Assign
          </Button>
          <Button size="sm" onClick={handleSave} loading={saving}>
            <Save size={14} />
            Save
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Column headers — grid matches ExerciseRow exactly */}
        <div className="grid grid-cols-[20px_24px_1fr_64px_80px_72px_28px_28px] items-center gap-2 border-b border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] px-3 py-2.5">
          <span />
          <span className="text-body-xs font-medium text-[var(--color-text-tertiary)]">#</span>
          <span className="text-body-xs font-medium text-[var(--color-text-tertiary)]">Exercise</span>
          <span className="text-body-xs font-medium text-[var(--color-text-tertiary)] text-center">Sets</span>
          <span className="text-body-xs font-medium text-[var(--color-text-tertiary)] text-center">Reps</span>
          <span className="text-body-xs font-medium text-[var(--color-text-tertiary)] text-center">Rest (s)</span>
          <span />
          <span />
        </div>

        <div className="divide-y divide-[var(--color-border-light)]">
          {exercises.map((exercise, i) => (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              index={i}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <button
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-2 border-t border-dashed border-[var(--color-border)] p-3 text-body-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-brand-500 transition-colors"
        >
          <Plus size={16} />
          Add Exercise
        </button>
      </Card>

      <AssignProgramDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        templateName={template.name}
      />
    </div>
  );
}
