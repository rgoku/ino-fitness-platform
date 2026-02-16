'use client';

import { Activity, Dumbbell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecentLoggedSets } from '@/hooks/use-workouts';
import { formatRelativeTime } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export function RecentActivity() {
  const { data: sets, isLoading } = useRecentLoggedSets(8);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-1.5 h-3 w-36" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={16} className="text-brand-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!sets || sets.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No activity yet"
            description="Client workout logs will appear here."
            className="py-6"
          />
        ) : (
          <div className="space-y-1">
            {sets.map((set) => (
              <div
                key={set.id}
                className="flex items-center gap-3 rounded-lg p-2"
              >
                <Avatar name={set.client_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-text-primary)] truncate">
                    <span className="font-medium">{set.client_name}</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">
                    {set.exercise_name}
                    {set.weight ? ` — ${set.weight}kg x ${set.reps}` : ` — ${set.reps} reps`}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[var(--color-text-tertiary)]">
                  {formatRelativeTime(set.completed_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
