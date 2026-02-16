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
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Program not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/programs"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <ChevronLeft size={16} />
        Back to Programs
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            {template.name}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <Badge>{template.weeks}w &times; {template.days_per_week}d</Badge>
            <span className="text-sm text-[var(--color-text-secondary)]">
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

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-text-tertiary)]">
            <span className="w-6" />
            <span className="w-6">#</span>
            <span className="flex-1">Exercise</span>
            <span className="w-14 text-center">Sets</span>
            <span className="w-20 text-center">Reps</span>
            <span className="w-16 text-center">Rest (s)</span>
            <span className="w-8" />
          </div>
        </div>

        <div className="space-y-2">
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
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-[var(--color-text-secondary)] hover:border-brand-500 hover:text-brand-500 transition-colors"
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
