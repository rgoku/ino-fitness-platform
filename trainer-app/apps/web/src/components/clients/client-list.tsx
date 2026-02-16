'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { MockClient } from '@/lib/mock-data';

const statusVariant = {
  active: 'success',
  'at-risk': 'warning',
  inactive: 'danger',
} as const;

interface ClientListProps {
  clients: MockClient[];
}

export function ClientList({ clients }: ClientListProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-secondary">
            <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Client</th>
            <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
            <th className="hidden px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] md:table-cell">Compliance</th>
            <th className="hidden px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] lg:table-cell">Streak</th>
            <th className="hidden px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] sm:table-cell">Last Active</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-border last:border-0 transition-colors hover:bg-surface-secondary">
              <td className="px-4 py-3">
                <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                  <Avatar name={client.name} src={client.avatar_url} size="sm" />
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{client.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{client.email}</p>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[client.status]}>
                  {client.status === 'at-risk' ? 'At Risk' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-surface-tertiary">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${client.compliance}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">{client.compliance}%</span>
                </div>
              </td>
              <td className="hidden px-4 py-3 lg:table-cell">
                <span className="text-[var(--color-text-secondary)]">
                  {client.currentStreak > 0 ? `${client.currentStreak}d` : '—'}
                </span>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {formatRelativeTime(client.lastActive)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
