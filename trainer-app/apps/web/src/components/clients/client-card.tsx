'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CardInteractive } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Flame, Dumbbell } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { MockClient } from '@/lib/mock-data';

const statusVariant = {
  active: 'success',
  'at-risk': 'danger',
  inactive: 'default',
} as const;

interface ClientCardProps {
  client: MockClient;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={`/clients/${client.id}`}>
      <CardInteractive className="p-5">
        <div className="flex items-start gap-3">
          <Avatar name={client.name} src={client.avatar_url} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sub-sm text-[var(--color-text-primary)] truncate">
                {client.name}
              </p>
              <Badge variant={statusVariant[client.status]} dot>
                {client.status === 'at-risk' ? 'At Risk' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
            </div>
            <p className="text-body-xs text-[var(--color-text-tertiary)] truncate">{client.email}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-body-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <Dumbbell size={12} strokeWidth={1.6} />
            <span className="tabular-nums">{client.workoutsCompleted}/{client.workoutsAssigned}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Flame size={12} strokeWidth={1.6} className={cn(client.currentStreak > 7 && 'text-orange-500')} />
            <span className="tabular-nums">{client.currentStreak}d</span>
          </span>
          <span className="ml-auto text-body-xs text-[var(--color-text-tertiary)]">
            {formatRelativeTime(client.lastActive)}
          </span>
        </div>

        <div className="mt-3">
          <ProgressBar
            value={client.compliance}
            size="sm"
            label="Compliance"
            showValue
            variant={client.compliance >= 80 ? 'brand' : client.compliance >= 60 ? 'warning' : 'error'}
          />
        </div>
      </CardInteractive>
    </Link>
  );
}
