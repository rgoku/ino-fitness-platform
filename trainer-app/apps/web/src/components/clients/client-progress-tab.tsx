'use client';

import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
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

  if (!sets || sets.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No progress data"
        description="Workout logs will appear here as the client trains."
      />
    );
  }

  // Group sets by date
  const grouped = sets.reduce<Record<string, typeof sets>>((acc, set) => {
    const date = new Date(set.completed_at).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(set);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-brand-500" />
            Recent Workout Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, dateSets]) => (
              <div key={date}>
                <p className="mb-2 text-xs font-medium text-[var(--color-text-tertiary)]">
                  {formatDate(date)}
                </p>
                <div className="space-y-1">
                  {dateSets.map((set) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between rounded-lg bg-surface-secondary px-3 py-2"
                    >
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {set.exercise_name}
                      </span>
                      <span className="text-sm text-[var(--color-text-secondary)]">
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
    </div>
  );
}
