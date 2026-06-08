'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Save, UserPlus, Sparkles, Wand2, Loader2 } from 'lucide-react';
import { useTemplate } from '@/hooks/use-templates';
import { ExerciseRow } from '@/components/programs/exercise-row';
import { AssignProgramDialog } from '@/components/programs/assign-program-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { parseExercises, enrichExercises } from '@/lib/exercise-parser';
import type { MockTemplateExercise } from '@/lib/mock-data';

export default function ProgramEditorPage() {
  const params = useParams();
  const templateId = params.id as string;
  const { data: template, isLoading } = useTemplate(templateId);
  const [exercises, setExercises] = useState<MockTemplateExercise[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [generatorInput, setGeneratorInput] = useState('');
  const [generating, setGenerating] = useState(false);

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

  const handleGenerate = async () => {
    if (!generatorInput.trim()) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));

    const parsed = parseExercises(generatorInput);
    const enriched = enrichExercises(parsed);

    const newExercises: MockTemplateExercise[] = enriched.map((ex, i) => ({
      id: `te${Date.now()}-${i}`,
      template_id: templateId,
      exercise_name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: ex.rest ? parseInt(ex.rest) || 90 : 90,
      notes: [
        ex.coachingCues?.slice(0, 2).join('. '),
        ex.notes,
      ].filter(Boolean).join(' — '),
      order_index: exercises.length + i,
      video_url: ex.videoUrl,
    }));

    setExercises((prev) => [...prev, ...newExercises]);
    setGenerating(false);
    setGeneratorInput('');
    setGeneratorOpen(false);
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

      {/* AI Program Generator */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setGeneratorOpen(!generatorOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
              <Wand2 size={15} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sub-sm font-medium text-[var(--color-text-primary)]">AI Program Generator</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">
                Type exercises naturally — AI fills in sets, reps, notes, and videos
              </p>
            </div>
          </div>
          <Badge variant="brand">AI</Badge>
        </button>

        {generatorOpen && (
          <div className="border-t border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] p-4 space-y-3 animate-fade-in">
            <textarea
              value={generatorInput}
              onChange={(e) => setGeneratorInput(e.target.value)}
              placeholder={`Type or paste your workout — one exercise per line:\n\nbench press 4x8\nincline dumbbell press 3x10\ncable flys 3x15 - slow squeeze\noverhead press 3x8 @RPE8\ntricep pushdown 4x12, 60s rest`}
              rows={7}
              className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-body-sm font-mono text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
            />

            {generatorInput.trim() && (
              <div className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface)] p-3">
                <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] mb-1.5">
                  Preview — {parseExercises(generatorInput).length} exercises detected
                </p>
                <div className="space-y-1">
                  {parseExercises(generatorInput).map((ex, i) => (
                    <div key={i} className="flex items-center gap-2 text-body-xs">
                      <span className="w-4 tabular-nums text-[var(--color-text-tertiary)]">{i + 1}.</span>
                      <span className="font-medium text-[var(--color-text-primary)]">{ex.name}</span>
                      <span className="text-[var(--color-text-tertiary)]">{ex.sets} × {ex.reps}</span>
                      {ex.rpe && <Badge variant="info">RPE {ex.rpe}</Badge>}
                      {ex.rest && <span className="text-[var(--color-text-tertiary)]">{ex.rest}</span>}
                      {ex.notes && <span className="text-[var(--color-text-tertiary)] italic">— {ex.notes}</span>}
                      {ex.muscleGroups && ex.muscleGroups.length > 0 && (
                        <span className="text-brand-500">{ex.muscleGroups.join(', ')}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <p className="flex-1 text-body-xs text-[var(--color-text-tertiary)]">
                AI adds coaching cues, muscle groups, and matches exercise videos automatically.
              </p>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={!generatorInput.trim() || generating}
              >
                {generating ? (
                  <><Loader2 size={14} className="animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={14} /> Generate & Add</>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AssignProgramDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        templateName={template.name}
      />
    </div>
  );
}
