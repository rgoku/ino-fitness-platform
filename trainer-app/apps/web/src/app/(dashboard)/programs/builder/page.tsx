'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Sparkles, Dumbbell, Clock, Target, Trash2,
  GripVertical, Play, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { parseExercises, enrichExercises, type ParsedExercise } from '@/lib/exercise-parser';

type BuildStatus = 'idle' | 'building' | 'done' | 'error';

export default function AIWorkoutBuilderPage() {
  const [workoutName, setWorkoutName] = useState('');
  const [exerciseInput, setExerciseInput] = useState('');
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [builtExercises, setBuiltExercises] = useState<ParsedExercise[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Live parsing preview
  const parsedPreview = useMemo(() => {
    return parseExercises(exerciseInput);
  }, [exerciseInput]);

  const handleBuild = useCallback(async () => {
    if (!exerciseInput.trim()) {
      setErrorMessage('Enter at least one exercise');
      setBuildStatus('error');
      return;
    }
    if (!workoutName.trim()) {
      setErrorMessage('Give your workout a name');
      setBuildStatus('error');
      return;
    }

    setBuildStatus('building');
    setErrorMessage('');

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 1800));

    try {
      const parsed = parseExercises(exerciseInput);
      const enriched = enrichExercises(parsed);
      setBuiltExercises(enriched);
      setBuildStatus('done');
    } catch {
      setErrorMessage('Failed to parse exercises. Check your input format.');
      setBuildStatus('error');
    }
  }, [exerciseInput, workoutName]);

  const handleRemoveExercise = (id: string) => {
    setBuiltExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleReset = () => {
    setBuildStatus('idle');
    setBuiltExercises([]);
    setErrorMessage('');
  };

  const totalSets = builtExercises.reduce((sum, ex) => sum + ex.sets, 0);
  const muscleGroups = [...new Set(builtExercises.flatMap((ex) => ex.muscleGroups || []))];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/programs"
        className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <ChevronLeft size={16} strokeWidth={1.6} />
        Programs
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
            <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-heading-2 text-[var(--color-text-primary)]">AI Workout Builder</h1>
            <p className="text-body-sm text-[var(--color-text-secondary)]">
              Type exercises naturally — we'll add videos, coaching cues, and descriptions
            </p>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <Card>
        <CardContent className="space-y-5">
          {/* Workout Name */}
          <Input
            label="Workout Name"
            placeholder="e.g. Push Day, Upper Body A, Leg Hypertrophy"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />

          {/* Exercise Input */}
          <div className="space-y-1.5">
            <label className="block text-body-sm font-medium text-[var(--color-text-primary)]">
              Exercises
            </label>
            <textarea
              value={exerciseInput}
              onChange={(e) => {
                setExerciseInput(e.target.value);
                if (buildStatus === 'error') setBuildStatus('idle');
              }}
              placeholder={`bench press 4x8\ncable flys 3x12-15 @RPE7\noverhead press 3x10 - strict form\ntricep pushdown 4x12, 60s rest`}
              rows={6}
              className={cn(
                'block w-full rounded-lg border bg-[var(--color-surface)] px-4 py-3 text-body-md font-mono text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-tertiary)]',
                'transition-colors duration-150 resize-y',
                'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
                buildStatus === 'error' ? 'border-error-500' : 'border-[var(--color-border)]',
              )}
            />
            <p className="text-body-xs text-[var(--color-text-tertiary)]">
              Supports: sets×reps, @RPE, rest time, notes after dash. Separate with commas or newlines.
            </p>
          </div>

          {/* Error message */}
          {buildStatus === 'error' && errorMessage && (
            <div className="flex items-center gap-2 text-error-500">
              <AlertCircle size={14} />
              <span className="text-body-sm">{errorMessage}</span>
            </div>
          )}

          {/* Live preview of parsed exercises */}
          {parsedPreview.length > 0 && buildStatus !== 'done' && (
            <div className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] p-3">
              <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                Preview ({parsedPreview.length} exercises detected)
              </p>
              <div className="space-y-1">
                {parsedPreview.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 text-body-xs">
                    <span className="w-5 text-[var(--color-text-tertiary)] tabular-nums">{i + 1}.</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{ex.name}</span>
                    <span className="text-[var(--color-text-tertiary)]">{ex.sets}×{ex.reps}</span>
                    {ex.rpe && <Badge variant="info">RPE {ex.rpe}</Badge>}
                    {ex.rest && <Badge variant="default">{ex.rest}</Badge>}
                    {ex.notes && <span className="text-[var(--color-text-tertiary)] italic">— {ex.notes}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Build button */}
          <Button
            onClick={buildStatus === 'done' ? handleReset : handleBuild}
            loading={buildStatus === 'building'}
            icon={buildStatus === 'done' ? <CheckCircle2 size={16} /> : <Sparkles size={16} />}
            size="xl"
            className="w-full"
          >
            {buildStatus === 'building' ? 'Building workout...' : buildStatus === 'done' ? 'Build Another' : 'Build with AI'}
          </Button>
        </CardContent>
      </Card>

      {/* Built Results */}
      {buildStatus === 'done' && builtExercises.length > 0 && (
        <>
          {/* Summary */}
          <div className="flex items-center gap-3">
            <Badge variant="success" dot>Built successfully</Badge>
            <span className="text-body-xs text-[var(--color-text-tertiary)]">
              {builtExercises.length} exercises • {totalSets} total sets
            </span>
          </div>

          {/* Muscle groups targeted */}
          {muscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {muscleGroups.map((mg) => (
                <Badge key={mg} variant="brand">{mg}</Badge>
              ))}
            </div>
          )}

          {/* Exercise cards */}
          <div className="space-y-3">
            {builtExercises.map((ex, i) => (
              <Card key={ex.id} className="overflow-hidden transition-all hover:shadow-card-hover">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Number */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-body-sm font-semibold text-brand-600 dark:text-brand-400 tabular-nums">
                      {i + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sub-md text-[var(--color-text-primary)]">{ex.name}</h3>
                        <button
                          onClick={() => handleRemoveExercise(ex.id)}
                          className="rounded-md p-1 text-[var(--color-text-tertiary)] hover:text-error-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Description */}
                      {ex.description && (
                        <p className="mt-1 text-body-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {ex.description}
                        </p>
                      )}

                      {/* Sets / Reps / RPE / Rest */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-secondary)] px-2.5 py-1.5">
                          <Dumbbell size={12} className="text-[var(--color-text-tertiary)]" />
                          <span className="text-body-xs font-medium tabular-nums text-[var(--color-text-primary)]">
                            {ex.sets} × {ex.reps}
                          </span>
                        </div>
                        {ex.rpe && (
                          <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5">
                            <Target size={12} className="text-blue-500" />
                            <span className="text-body-xs font-medium text-blue-700 dark:text-blue-300">
                              RPE {ex.rpe}
                            </span>
                          </div>
                        )}
                        {ex.rest && (
                          <div className="flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-secondary)] px-2.5 py-1.5">
                            <Clock size={12} className="text-[var(--color-text-tertiary)]" />
                            <span className="text-body-xs font-medium text-[var(--color-text-primary)]">
                              {ex.rest} rest
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Muscle groups */}
                      {ex.muscleGroups && ex.muscleGroups.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {ex.muscleGroups.map((mg) => (
                            <Badge key={mg} variant="outline">{mg}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Coaching Cues */}
                      {ex.coachingCues && ex.coachingCues.length > 0 && (
                        <div className="mt-3 rounded-lg bg-brand-50/50 dark:bg-brand-900/10 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles size={12} className="text-brand-500" />
                            <span className="text-body-xs font-medium text-brand-600 dark:text-brand-400">Coaching Cues</span>
                          </div>
                          <ol className="space-y-0.5">
                            {ex.coachingCues.map((cue, j) => (
                              <li key={j} className="text-body-xs text-[var(--color-text-secondary)] flex gap-1.5">
                                <span className="text-brand-400 shrink-0">{j + 1}.</span>
                                {cue}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Notes */}
                      {ex.notes && (
                        <p className="mt-2 text-body-xs italic text-[var(--color-text-tertiary)]">
                          Note: {ex.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Save actions */}
          <div className="flex gap-3">
            <Button variant="primary" size="lg" className="flex-1">
              Save as Program Template
            </Button>
            <Button variant="secondary" size="lg">
              Assign to Client
            </Button>
          </div>
        </>
      )}

      {/* Building animation */}
      {buildStatus === 'building' && (
        <div className="flex flex-col items-center py-12">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
              <Sparkles size={24} className="text-brand-500 animate-pulse-soft" />
            </div>
          </div>
          <p className="mt-4 text-sub-md text-[var(--color-text-primary)]">Building your workout...</p>
          <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
            Adding coaching cues, muscle groups, and descriptions
          </p>
        </div>
      )}
    </div>
  );
}
