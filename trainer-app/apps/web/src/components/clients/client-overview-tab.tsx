'use client';

import { Dumbbell, Flame, Target, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { AIInsightInline } from '@/components/ui/ai-insight';
import type { MockClient } from '@/lib/mock-data';

interface ClientOverviewTabProps {
  client: MockClient;
}

export function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  const stats = [
    {
      label: 'Completed',
      value: client.workoutsCompleted,
      icon: Dumbbell,
      iconBg: 'bg-brand-50 dark:bg-brand-900/20',
      iconColor: 'text-brand-600 dark:text-brand-400',
    },
    {
      label: 'Assigned',
      value: client.workoutsAssigned,
      icon: Target,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Streak',
      value: `${client.currentStreak}d`,
      icon: Flame,
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Compliance',
      value: `${client.compliance}%`,
      icon: Trophy,
      iconBg: 'bg-brand-50 dark:bg-brand-900/20',
      iconColor: 'text-brand-600 dark:text-brand-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon size={16} className={stat.iconColor} />
              </div>
              <div>
                <p className="text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">{stat.label}</p>
                <p className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Compliance Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp size={14} className="text-brand-500" />
            Weekly Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar
            value={client.compliance}
            size="lg"
            showValue
            variant={client.compliance >= 80 ? 'brand' : client.compliance >= 50 ? 'warning' : 'error'}
          />
          <AIInsightInline
            message={
              client.compliance >= 80
                ? 'Great consistency. Consider increasing training volume by 5-10%.'
                : 'Consistency is below target. A simplified program could help.'
            }
            className="mt-4"
          />
        </CardContent>
      </Card>

      {/* Flags */}
      {client.flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-body-sm">Active Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {client.flags.map((flag, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Badge variant={client.status === 'at-risk' ? 'danger' : 'warning'} dot>
                    {flag}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={14} className="text-[var(--color-text-tertiary)]" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-body-sm">
            <div>
              <dt className="text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Email</dt>
              <dd className="text-[var(--color-text-primary)]">{client.email}</dd>
            </div>
            <div>
              <dt className="text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Status</dt>
              <dd>
                <Badge
                  variant={client.status === 'active' ? 'success' : client.status === 'at-risk' ? 'danger' : 'default'}
                  dot
                >
                  {client.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Joined</dt>
              <dd className="text-[var(--color-text-primary)]">
                {new Date(client.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </dd>
            </div>
            <div>
              <dt className="text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Goal</dt>
              <dd className="text-[var(--color-text-primary)]">{(client as any).goal || 'Not set'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
