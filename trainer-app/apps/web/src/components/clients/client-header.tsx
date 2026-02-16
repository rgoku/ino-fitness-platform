'use client';

import Link from 'next/link';
import { ChevronLeft, Mail, Calendar } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { MockClient } from '@/lib/mock-data';

const statusVariant = {
  active: 'success',
  'at-risk': 'warning',
  inactive: 'danger',
} as const;

interface ClientHeaderProps {
  client: MockClient;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  return (
    <div>
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-4"
      >
        <ChevronLeft size={16} />
        Back to Clients
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} src={client.avatar_url} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                {client.name}
              </h1>
              <Badge variant={statusVariant[client.status]}>
                {client.status === 'at-risk' ? 'At Risk' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
              {client.email && (
                <span className="flex items-center gap-1">
                  <Mail size={13} />
                  {client.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                Joined {formatDate(client.joinedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
