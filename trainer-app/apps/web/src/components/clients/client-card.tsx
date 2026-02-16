'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Flame, Dumbbell } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { MockClient } from '@/lib/mock-data';

const statusVariant = {
  active: 'success',
  'at-risk': 'warning',
  inactive: 'danger',
} as const;

interface ClientCardProps {
  client: MockClient;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="p-4 transition-shadow hover:shadow-card-hover cursor-pointer">
        <div className="flex items-start gap-3">
          <Avatar name={client.name} src={client.avatar_url} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[var(--color-text-primary)] truncate">
                {client.name}
              </p>
              <Badge variant={statusVariant[client.status]}>
                {client.status === 'at-risk' ? 'At Risk' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] truncate">{client.email}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <Dumbbell size={12} />
            {client.workoutsCompleted}/{client.workoutsAssigned}
          </span>
          <span className="flex items-center gap-1">
            <Flame size={12} className={cn(client.currentStreak > 7 && 'text-orange-500')} />
            {client.currentStreak}d streak
          </span>
          <span className="ml-auto text-[var(--color-text-tertiary)]">
            {formatRelativeTime(client.lastActive)}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-text-tertiary)]">Compliance</span>
            <span className="font-medium text-[var(--color-text-secondary)]">{client.compliance}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-surface-tertiary">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                client.compliance >= 80 ? 'bg-emerald-500' : client.compliance >= 60 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${client.compliance}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
