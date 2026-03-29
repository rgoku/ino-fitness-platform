'use client';

import Link from 'next/link';
import { ChevronLeft, Mail, Calendar, MessageSquare } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { MockClient } from '@/lib/mock-data';

const statusVariant = {
  active: 'success',
  'at-risk': 'danger',
  inactive: 'default',
} as const;

interface ClientHeaderProps {
  client: MockClient;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  return (
    <div>
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors mb-6"
      >
        <ChevronLeft size={16} strokeWidth={1.6} />
        Clients
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} src={client.avatar_url} size="xl" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-heading-2 text-[var(--color-text-primary)]">
                {client.name}
              </h1>
              <Badge variant={statusVariant[client.status]} dot>
                {client.status === 'at-risk' ? 'At Risk' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
            </div>
            <div className="mt-1.5 flex items-center gap-4 text-body-sm text-[var(--color-text-secondary)]">
              {client.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={13} strokeWidth={1.6} className="text-[var(--color-text-tertiary)]" />
                  {client.email}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={1.6} className="text-[var(--color-text-tertiary)]" />
                Joined {formatDate(client.joinedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="md" icon={<MessageSquare size={14} />}>
            Message
          </Button>
          <Button variant="primary" size="md">
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
