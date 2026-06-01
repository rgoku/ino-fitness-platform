'use client';

import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { MuscleHeatmapPro } from '@/components/body-analysis/MuscleHeatmapPro';
import type { MuscleVolume } from '@/components/body-analysis/core';
import { useClientLoggedSets } from '@/hooks/use-workouts';
import { formatDate } from '@/lib/utils';

interface ClientProgressTabProps {
  clientId: string;
}

// Mock data — replace with backend aggregation later
const THIS_WEEK: MuscleVolume = {
  chest: 12, 'upper-back': 9, 'lower-back': 4,
  deltoids: 7, biceps: 5, triceps: 5,
  forearm: 2, abs: 6, obliques: 3,
  quadriceps: 11, hamstring: 8, gluteal: 9,
  calves: 4, trapezius: 6, adductors: 3, tibialis: 2,
};
const LAST_WEEK: MuscleVolume = {
  chest: 10, 'upper-back': 8, 'lower-back': 5,
  deltoids: 6, biceps: 4, triceps: 6,
  forearm: 2, abs: 5, obliques: 2,
  quadriceps: 8, hamstring: 6, gluteal: 7,
  calves: 3, trapezius: 5, adductors: 2, tibialis: 1,
};

export function ClientProgressTab({ clientId }: ClientProgressTabProps) {
  const { data: sets, isLoading } = useClientLoggedSets(clientId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const grouped = sets
    ? sets.reduce<Record<string, typeof sets>>((acc, set) => {
        const date = new Date(set.completed_at).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(set);
        return acc;
      }, {})
    : {};

  return (
    <div className="space-y-6">
      {/* Muscle Heatmap Pro */}
      <MuscleHeatmapPro thisWeek={THIS_WEEK} lastWeek={LAST_WEEK} />

      {/* Recent Workout Logs */}
      {sets && sets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/20">
                <TrendingUp size={12} className="text-blue-600 dark:text-blue-400" />
              </div>
              Recent Workout Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(grouped).map(([date, dateSets]) => (
                <div key={date}>
                  <p className="mb-2 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    {formatDate(date)}
                  </p>
                  <div className="space-y-1">
                    {dateSets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between rounded-lg bg-[var(--color-surface-secondary)] px-3 py-2"
                      >
                        <span className="text-body-sm font-medium text-[var(--color-text-primary)]">
                          {set.exercise_name}
                        </span>
                        <span className="text-body-sm tabular-nums text-[var(--color-text-secondary)]">
                          {set.weight ? `${set.weight}kg x ${set.reps}` : `${set.reps} reps`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={TrendingUp}
          title="No workout logs yet"
          description="Workout logs will appear here as the client trains."
        />
      )}
    </div>
  );
}
