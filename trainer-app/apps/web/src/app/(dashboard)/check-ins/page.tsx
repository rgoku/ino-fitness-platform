'use client';

import { ClipboardCheck } from 'lucide-react';
import { useCheckIns } from '@/hooks/use-check-ins';
import { CheckInCard } from '@/components/check-ins/check-in-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckInsPage() {
  const { data: checkIns, isLoading } = useCheckIns();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Check-ins</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Review client workout submissions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !checkIns || checkIns.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No check-ins to review"
          description="Client workout logs will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {checkIns.map((checkIn) => (
            <CheckInCard key={`${checkIn.clientId}-${checkIn.date}`} checkIn={checkIn} />
          ))}
        </div>
      )}
    </div>
  );
}
