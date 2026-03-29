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
import { ProgressBar } from '@/components/ui/progress-bar';

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
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="mt-2 h-3 w-40" />
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
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-warning-50 dark:bg-amber-900/20">
              <AlertTriangle size={12} strokeWidth={2} className="text-warning-600 dark:text-amber-400" />
            </div>
            Needs Attention
          </CardTitle>
          <Badge variant="warning" dot>
            {needsAttention.length} clients
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {needsAttention.length === 0 ? (
          <EmptyState
            title="Everyone's on track"
            description="No flags right now. Nice work."
            className="py-8"
          />
        ) : (
          <div className="space-y-1">
            {needsAttention.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="group flex items-center gap-3 rounded-lg p-3 -mx-1 transition-all duration-100 hover:bg-[var(--color-surface-hover)]"
              >
                <Avatar name={client.name} src={client.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sub-sm text-[var(--color-text-primary)] truncate">
                    {client.name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {client.flags.slice(0, 2).map((flag, i) => (
                      <Badge key={i} variant={client.status === 'at-risk' ? 'danger' : 'warning'} dot>
                        {flag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={client.compliance}
                      size="sm"
                      variant={client.compliance < 50 ? 'error' : client.compliance < 75 ? 'warning' : 'brand'}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-body-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                    <Clock size={11} strokeWidth={1.6} />
                    {formatRelativeTime(client.lastActive)}
                  </span>
                  <span className="text-body-xs font-medium tabular-nums text-[var(--color-text-secondary)]">
                    {client.compliance}%
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  strokeWidth={1.6}
                  className="text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0"
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
