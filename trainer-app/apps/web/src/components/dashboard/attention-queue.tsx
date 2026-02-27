'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useClients } from '@/hooks/use-clients';
import { formatRelativeTime } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export function AttentionQueue() {
  const { data: clients, isLoading } = useClients();

  const needsAttention = clients
    ?.filter((c) => c.flags.length > 0 || c.status === 'at-risk')
    .sort((a, b) => a.compliance - b.compliance) ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Needs Attention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="mt-1.5 h-3 w-40" />
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={14} strokeWidth={2} className="text-amber-500" />
            Needs Attention
          </CardTitle>
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {needsAttention.length} clients
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {needsAttention.length === 0 ? (
          <EmptyState
            title="Everyone's on track"
            description="No flags right now. Nice."
            className="py-6"
          />
        ) : (
          <div className="space-y-0.5">
            {needsAttention.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="group flex items-center gap-3 rounded-md p-2 -mx-1 transition-colors duration-75 hover:bg-[var(--color-surface-hover)]"
              >
                <Avatar name={client.name} src={client.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-text-primary)] truncate">
                    {client.name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {client.flags.slice(0, 2).map((flag, i) => (
                      <Badge key={i} variant={client.status === 'at-risk' ? 'danger' : 'warning'}>
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                    <Clock size={10} strokeWidth={1.8} />
                    {formatRelativeTime(client.lastActive)}
                  </span>
                  <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {client.compliance}%
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  strokeWidth={1.8}
                  className="text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-75 shrink-0"
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
