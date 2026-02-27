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
      <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
        Check-ins{checkIns && checkIns.length > 0 && (
          <span className="ml-2 text-base font-normal text-[var(--color-text-tertiary)]">{checkIns.length} pending</span>
        )}
      </h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !checkIns || checkIns.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="All caught up"
          description="Nothing to review right now. New check-ins land here as clients log their sessions."
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
