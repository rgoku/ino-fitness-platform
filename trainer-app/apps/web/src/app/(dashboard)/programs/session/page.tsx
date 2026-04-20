'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Play, Pause, RotateCcw, Check, Trophy,
  Timer, Dumbbell, Plus, Minus, ChevronDown, ChevronUp,
  Flame, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SetLog {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  isPR: boolean;
}

interface ExerciseSession {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  sets: SetLog[];
  expanded: boolean;
}

const SAMPLE_EXERCISES: ExerciseSession[] = [
  { id: 'e1', name: 'Barbell Bench Press', targetSets: 4, targetReps: '6-8', restSeconds: 120, sets: [], expanded: true },
  { id: 'e2', name: 'Incline Dumbbell Press', targetSets: 3, targetReps: '8-10', restSeconds: 90, sets: [], expanded: false },
  { id: 'e3', name: 'Cable Flys', targetSets: 3, targetReps: '12-15', restSeconds: 60, sets: [], expanded: false },
  { id: 'e4', name: 'Overhead Press', targetSets: 3, targetReps: '8-10', restSeconds: 90, sets: [], expanded: false },
  { id: 'e5', name: 'Tricep Pushdown', targetSets: 3, targetReps: '12-15', restSeconds: 60, sets: [], expanded: false },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WorkoutSessionPage() {
  const [exercises, setExercises] = useState<ExerciseSession[]>(
    SAMPLE_EXERCISES.map((ex) => ({
      ...ex,
      sets: Array.from({ length: ex.targetSets }, (_, i) => ({
        setNumber: i + 1, reps: 0, weight: 0, completed: false, isPR: false,
      })),
    }))
  );
  const [sessionTime, setSessionTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState('e1');
  const [showPRCelebration, setShowPRCelebration] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Session timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSessionTime((t) => t + 1), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  // Rest timer
  useEffect(() => {
    if (isResting && restTimer > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer((t) => {
          if (t <= 1) {
            setIsResting(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); };
  }, [isResting, restTimer]);

  const toggleExercise = (id: string) => {
    setExercises((prev) => prev.map((ex) =>
      ex.id === id ? { ...ex, expanded: !ex.expanded } : ex
    ));
    setActiveExerciseId(id);
  };

  const updateSet = (exerciseId: string, setIdx: number, field: 'reps' | 'weight', delta: number) => {
    setExercises((prev) => prev.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const newSets = [...ex.sets];
      newSets[setIdx] = {
        ...newSets[setIdx],
        [field]: Math.max(0, newSets[setIdx][field] + delta),
      };
      return { ...ex, sets: newSets };
    }));
  };

  const completeSet = useCallback((exerciseId: string, setIdx: number) => {
    setExercises((prev) => {
      const updated = prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSets = [...ex.sets];
        const set = newSets[setIdx];

        // PR detection: check if this weight × reps is higher than any previous
        const prevBest = newSets
          .filter((s, i) => i !== setIdx && s.completed)
          .reduce((best, s) => Math.max(best, s.weight * s.reps), 0);
        const currentScore = set.weight * set.reps;
        const isPR = currentScore > prevBest && set.weight > 0 && set.reps > 0;

        newSets[setIdx] = { ...set, completed: true, isPR };

        if (isPR) {
          setShowPRCelebration(ex.name);
          setTimeout(() => setShowPRCelebration(null), 3000);
        }

        return { ...ex, sets: newSets };
      });
      return updated;
    });

    // Start rest timer
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      setRestTimer(exercise.restSeconds);
      setIsResting(true);
    }

    if (!isRunning) setIsRunning(true);
  }, [exercises, isRunning]);

  const totalSetsCompleted = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0
  );
  const totalVolume = exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).reduce((v, s) => v + s.weight * s.reps, 0), 0
  );

  return (
    <div className="space-y-4 max-w-2xl mx-auto animate-slide-up">
      {/* Back */}
      <Link href="/programs" className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
        <ChevronLeft size={16} /> Back
      </Link>

      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-2 text-[var(--color-text-primary)]">Push Day</h1>
          <p className="text-body-sm text-[var(--color-text-secondary)]">
            {exercises.length} exercises • {totalSetsCompleted} sets logged
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-tertiary)] px-3 py-2">
            <Timer size={14} className="text-[var(--color-text-tertiary)]" />
            <span className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{formatTime(sessionTime)}</span>
          </div>
          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            icon={isRunning ? <Pause size={14} /> : <Play size={14} />}
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>

      {/* Rest Timer Overlay */}
      {isResting && (
        <Card className="border-brand-500/30 bg-brand-50/10 dark:bg-brand-900/10">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10">
                <RotateCcw size={18} className="text-brand-500" />
              </div>
              <div>
                <p className="text-sub-sm text-[var(--color-text-primary)]">Rest Timer</p>
                <p className="text-heading-2 tabular-nums text-brand-500">{formatTime(restTimer)}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setIsResting(false); setRestTimer(0); }}>
              Skip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* PR Celebration */}
      {showPRCelebration && (
        <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 text-center animate-scale-in">
          <div className="flex items-center justify-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            <span className="text-sub-md text-amber-600 dark:text-amber-400">New PR!</span>
            <Trophy size={20} className="text-amber-500" />
          </div>
          <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">{showPRCelebration}</p>
        </div>
      )}

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] p-3 text-center">
          <Dumbbell size={14} className="mx-auto mb-1 text-[var(--color-text-tertiary)]" />
          <p className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">{totalSetsCompleted}</p>
          <p className="text-body-xs text-[var(--color-text-tertiary)]">Sets</p>
        </div>
        <div className="rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] p-3 text-center">
          <Flame size={14} className="mx-auto mb-1 text-orange-500" />
          <p className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">{Math.round(totalVolume).toLocaleString()}</p>
          <p className="text-body-xs text-[var(--color-text-tertiary)]">Volume (kg)</p>
        </div>
        <div className="rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] p-3 text-center">
          <Timer size={14} className="mx-auto mb-1 text-[var(--color-text-tertiary)]" />
          <p className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">{formatTime(sessionTime)}</p>
          <p className="text-body-xs text-[var(--color-text-tertiary)]">Duration</p>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        {exercises.map((ex, exIdx) => {
          const completedSets = ex.sets.filter((s) => s.completed).length;
          const isComplete = completedSets === ex.sets.length;

          return (
            <Card key={ex.id} className={cn('overflow-hidden', isComplete && 'opacity-60')}>
              {/* Exercise Header */}
              <button
                onClick={() => toggleExercise(ex.id)}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-body-sm font-semibold tabular-nums',
                  isComplete
                    ? 'bg-success-50 text-success-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]'
                )}>
                  {isComplete ? <Check size={16} /> : exIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sub-sm text-[var(--color-text-primary)]">{ex.name}</p>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">
                    {ex.targetSets} × {ex.targetReps} • {completedSets}/{ex.targetSets} done
                  </p>
                </div>
                {ex.expanded ? <ChevronUp size={16} className="text-[var(--color-text-tertiary)]" /> : <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />}
              </button>

              {/* Sets */}
              {ex.expanded && (
                <div className="border-t border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] px-4 py-3">
                  {/* Header */}
                  <div className="grid grid-cols-[40px_1fr_1fr_60px] gap-2 mb-2 text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    <span>Set</span>
                    <span className="text-center">Weight (kg)</span>
                    <span className="text-center">Reps</span>
                    <span />
                  </div>

                  {/* Set Rows */}
                  {ex.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={cn(
                        'grid grid-cols-[40px_1fr_1fr_60px] gap-2 items-center py-2 rounded-lg',
                        set.completed && 'opacity-50'
                      )}
                    >
                      {/* Set number */}
                      <div className="flex items-center justify-center">
                        <span className={cn(
                          'text-body-sm font-medium tabular-nums',
                          set.completed ? 'text-success-500' : 'text-[var(--color-text-tertiary)]'
                        )}>
                          {set.isPR && <Trophy size={12} className="inline mr-1 text-amber-500" />}
                          {set.setNumber}
                        </span>
                      </div>

                      {/* Weight */}
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateSet(ex.id, setIdx, 'weight', -2.5)}
                          disabled={set.completed}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-14 text-center text-sub-sm tabular-nums text-[var(--color-text-primary)]">
                          {set.weight}
                        </span>
                        <button
                          onClick={() => updateSet(ex.id, setIdx, 'weight', 2.5)}
                          disabled={set.completed}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Reps */}
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateSet(ex.id, setIdx, 'reps', -1)}
                          disabled={set.completed}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-10 text-center text-sub-sm tabular-nums text-[var(--color-text-primary)]">
                          {set.reps}
                        </span>
                        <button
                          onClick={() => updateSet(ex.id, setIdx, 'reps', 1)}
                          disabled={set.completed}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Complete button */}
                      <div className="flex justify-center">
                        {set.completed ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-500/10">
                            <Check size={14} className="text-success-500" />
                          </div>
                        ) : (
                          <button
                            onClick={() => completeSet(ex.id, setIdx)}
                            disabled={set.reps === 0 || set.weight === 0}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Finish Workout */}
      <Button variant="primary" size="xl" className="w-full" icon={<Sparkles size={16} />}>
        Finish Workout
      </Button>
    </div>
  );
}
