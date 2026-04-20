'use client';

import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { MuscleHeatmap, mockMuscleData } from '@/components/progress/muscle-heatmap';
import { useClientLoggedSets } from '@/hooks/use-workouts';
import { formatDate } from '@/lib/utils';

interface ClientProgressTabProps {
  clientId: string;
}

export function ClientProgressTab({ clientId }: ClientProgressTabProps) {
  const { data: sets, isLoading } = useClientLoggedSets(clientId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  // Group sets by date
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
      {/* Muscle Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-50 dark:bg-brand-900/20">
                <TrendingUp size={12} className="text-brand-600 dark:text-brand-400" />
              </div>
              Muscle Heatmap
            </CardTitle>
            <span className="text-body-xs text-[var(--color-text-tertiary)]">Last 30 days</span>
          </div>
        </CardHeader>
        <CardContent>
          <MuscleHeatmap data={mockMuscleData} />
        </CardContent>
      </Card>

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
