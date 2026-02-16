'use client';

import { Dumbbell, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientWorkouts } from '@/hooks/use-workouts';

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
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
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
      />
    );
  }

  return (
    <div className="space-y-2">
      {workouts.map((workout) => (
        <Card key={workout.id}>
          <button
            onClick={() => setExpanded(expanded === workout.id ? null : workout.id)}
            className="flex w-full items-center gap-3 p-4 text-left"
          >
            {expanded === workout.id ? (
              <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />
            ) : (
              <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />
            )}
            <div className="flex-1">
              <p className="font-medium text-[var(--color-text-primary)]">{workout.name}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {workout.week && `Week ${workout.week}`}
                {workout.day && ` • Day ${workout.day}`}
                {` • ${workout.exercises.length} exercises`}
              </p>
            </div>
            <Badge variant="info">{workout.exercises.length} exercises</Badge>
          </button>

          {expanded === workout.id && (
            <CardContent className="border-t border-border pt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--color-text-tertiary)]">
                    <th className="pb-2 font-medium">Exercise</th>
                    <th className="pb-2 font-medium">Sets</th>
                    <th className="pb-2 font-medium">Reps</th>
                    <th className="pb-2 font-medium">RPE</th>
                    <th className="pb-2 font-medium">Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {workout.exercises.map((ex) => (
                    <tr key={ex.id} className="border-t border-border/50">
                      <td className="py-2 font-medium text-[var(--color-text-primary)]">{ex.exercise_name}</td>
                      <td className="py-2 text-[var(--color-text-secondary)]">{ex.sets ?? '—'}</td>
                      <td className="py-2 text-[var(--color-text-secondary)]">{ex.reps ?? '—'}</td>
                      <td className="py-2 text-[var(--color-text-secondary)]">{ex.rpe ?? '—'}</td>
                      <td className="py-2 text-[var(--color-text-secondary)]">{ex.rest ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
