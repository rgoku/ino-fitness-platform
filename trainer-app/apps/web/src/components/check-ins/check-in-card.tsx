'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { CheckInGroup } from '@/hooks/use-check-ins';

interface CheckInCardProps {
  checkIn: CheckInGroup;
}

export function CheckInCard({ checkIn }: CheckInCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Link
          href={`/clients/${checkIn.clientId}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar name={checkIn.clientName} size="md" />
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">{checkIn.clientName}</p>
            <p className="text-xs text-[var(--color-text-tertiary)]">{formatDate(checkIn.date)}</p>
          </div>
        </Link>
        <Badge variant="info">{checkIn.sets.length} exercises</Badge>
      </div>

      <div className="space-y-1.5">
        {checkIn.sets.map((set) => (
          <div
            key={set.id}
            className="flex items-center justify-between rounded-md bg-surface-secondary px-3 py-2"
          >
            <span className="text-sm text-[var(--color-text-primary)]">{set.exercise_name}</span>
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {set.weight ? `${set.weight}kg x ${set.reps}` : `${set.reps} reps`}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
