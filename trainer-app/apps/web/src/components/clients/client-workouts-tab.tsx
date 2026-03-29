'use client';

import { Dumbbell, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientWorkouts } from '@/hooks/use-workouts';
import { Button } from '@/components/ui/button';

interface ClientWorkoutsTabProps {
  clientId: string;
}

export function ClientWorkoutsTab({ clientId }: ClientWorkoutsTabProps) {
  const { data: workouts, isLoading } = useClientWorkouts(clientId);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-18 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No workouts assigned"
        description="Assign a program to this client to get started."
        action={{ label: 'Assign Program', onClick: () => {} }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {workouts.map((workout) => (
        <Card key={workout.id} className="overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === workout.id ? null : workout.id)}
            className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
              {expanded === workout.id ? (
                <ChevronDown size={16} className="text-brand-600 dark:text-brand-400" />
              ) : (
                <ChevronRight size={16} className="text-brand-600 dark:text-brand-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sub-sm text-[var(--color-text-primary)]">{workout.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {workout.week && (
                  <span className="text-body-xs text-[var(--color-text-tertiary)]">
                    Week {workout.week}
                  </span>
                )}
                {workout.day && (
                  <span className="text-body-xs text-[var(--color-text-tertiary)]">
                    Day {workout.day}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="brand">
                <Dumbbell size={10} className="mr-1" />
                {workout.exercises.length}
              </Badge>
            </div>
          </button>

          {expanded === workout.id && (
            <CardContent className="border-t border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-body-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Exercise</th>
                      <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Sets</th>
                      <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Reps</th>
                      <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">RPE</th>
                      <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                        <Clock size={12} className="inline mr-1" />Rest
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {workout.exercises.map((ex) => (
                      <tr key={ex.id} className="border-t border-[var(--color-border-light)]">
                        <td className="py-3 text-sub-sm text-[var(--color-text-primary)]">{ex.exercise_name}</td>
                        <td className="py-3 text-body-sm tabular-nums text-[var(--color-text-secondary)]">{ex.sets ?? '--'}</td>
                        <td className="py-3 text-body-sm tabular-nums text-[var(--color-text-secondary)]">{ex.reps ?? '--'}</td>
                        <td className="py-3 text-body-sm tabular-nums text-[var(--color-text-secondary)]">{ex.rpe ?? '--'}</td>
                        <td className="py-3 text-body-sm text-[var(--color-text-secondary)]">{ex.rest ?? '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
