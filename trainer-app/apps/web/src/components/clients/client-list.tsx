'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { formatRelativeTime } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { MockClient } from '@/lib/mock-data';

const statusVariant = {
  active: 'success',
  'at-risk': 'danger',
  inactive: 'default',
} as const;

interface ClientListProps {
  clients: MockClient[];
}

export function ClientList({ clients }: ClientListProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="border-b border-[var(--color-border-light)]">
            <th className="px-5 py-3 text-left text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Client</th>
            <th className="px-5 py-3 text-left text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
            <th className="hidden px-5 py-3 text-left text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider md:table-cell">Compliance</th>
            <th className="hidden px-5 py-3 text-left text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider lg:table-cell">Streak</th>
            <th className="hidden px-5 py-3 text-left text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider sm:table-cell">Last Active</th>
            <th className="w-10 px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="group border-b border-[var(--color-border-light)] last:border-0 transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <td className="px-5 py-3.5">
                <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                  <Avatar name={client.name} src={client.avatar_url} size="md" />
                  <div>
                    <p className="text-sub-sm text-[var(--color-text-primary)]">{client.name}</p>
                    <p className="text-body-xs text-[var(--color-text-tertiary)]">{client.email}</p>
                  </div>
                </Link>
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={statusVariant[client.status]} dot>
                  {client.status === 'at-risk' ? 'At Risk' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              </td>
              <td className="hidden px-5 py-3.5 md:table-cell">
                <div className="flex items-center gap-3 max-w-[140px]">
                  <ProgressBar
                    value={client.compliance}
                    size="sm"
                    variant={client.compliance >= 80 ? 'brand' : client.compliance >= 60 ? 'warning' : 'error'}
                    className="flex-1"
                  />
                  <span className="text-body-xs font-medium tabular-nums text-[var(--color-text-secondary)]">{client.compliance}%</span>
                </div>
              </td>
              <td className="hidden px-5 py-3.5 lg:table-cell">
                <span className="text-body-sm tabular-nums text-[var(--color-text-secondary)]">
                  {client.currentStreak > 0 ? `${client.currentStreak}d` : '--'}
                </span>
              </td>
              <td className="hidden px-5 py-3.5 sm:table-cell">
                <span className="text-body-xs text-[var(--color-text-tertiary)]">
                  {formatRelativeTime(client.lastActive)}
                </span>
              </td>
              <td className="px-3 py-3.5">
                <ChevronRight
                  size={14}
                  strokeWidth={1.6}
                  className="text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
