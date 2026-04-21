'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Calendar, TrendingUp, Play, Check, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const COHORTS = [
  {
    id: 'co1', name: '8-Week Summer Shred',
    startDate: '2026-04-01', endDate: '2026-05-27',
    currentWeek: 3, totalWeeks: 8,
    members: 28, capacity: 30, price: 199,
    avgCompliance: 87, status: 'active',
    avatars: ['Emma D.', 'James W.', 'Sophie T.', 'Tom B.', 'Maria S.'],
  },
  {
    id: 'co2', name: 'Strength Foundations',
    startDate: '2026-05-01', endDate: '2026-06-26',
    currentWeek: 0, totalWeeks: 8,
    members: 18, capacity: 25, price: 149,
    avgCompliance: 0, status: 'upcoming',
    avatars: ['Ryan P.', 'Nina P.', 'Hannah L.'],
  },
  {
    id: 'co3', name: 'PPL Hypertrophy Block',
    startDate: '2026-02-01', endDate: '2026-03-28',
    currentWeek: 8, totalWeeks: 8,
    members: 24, capacity: 30, price: 199,
    avgCompliance: 92, status: 'completed',
    avatars: ['Alex C.', 'Mike J.', 'Carlos R.'],
  },
];

export default function CohortsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const filtered = COHORTS.filter((c) => filter === 'all' || c.status === filter);
  const totalRevenue = COHORTS.reduce((sum, c) => sum + c.price * c.members, 0);
  const activeMembers = COHORTS.filter((c) => c.status === 'active').reduce((s, c) => s + c.members, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Cohorts</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Coach 20-30 clients at once through structured group programs.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>New Cohort</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' },
          { label: 'Active Members', value: activeMembers.toString(), icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'Running Cohorts', value: COHORTS.filter((c) => c.status === 'active').length.toString(), icon: Play, color: 'bg-success-50 text-success-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
          { label: 'Avg Compliance', value: '87%', icon: TrendingUp, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
        ].map((s) => (
          <Card key={s.label} className="hover-limitless">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">{s.label}</span>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.color}`}>
                  <s.icon size={14} />
                </div>
              </div>
              <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'active', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-1.5 text-body-xs font-medium capitalize transition-colors',
              filter === f ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            )}
          >
            {f} {f !== 'all' && `(${COHORTS.filter((c) => c.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Cohort cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((co) => (
          <Card key={co.id} className="hover-limitless">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={co.status === 'active' ? 'success' : co.status === 'upcoming' ? 'info' : 'default'} dot>
                      {co.status}
                    </Badge>
                    <span className="text-body-xs text-[var(--color-text-tertiary)]">
                      ${co.price} · {co.members}/{co.capacity} seats
                    </span>
                  </div>
                  <h3 className="text-sub-md text-[var(--color-text-primary)]">{co.name}</h3>
                  <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">
                    <Calendar size={10} className="inline mr-1" />
                    {new Date(co.startDate).toLocaleDateString()} → {new Date(co.endDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-heading-2 tabular-nums text-brand-500">
                  ${(co.price * co.members).toLocaleString()}
                </p>
              </div>

              {/* Week progress */}
              {co.status === 'active' && (
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-body-xs">
                    <span className="text-[var(--color-text-tertiary)]">Week {co.currentWeek} of {co.totalWeeks}</span>
                    <span className="text-[var(--color-text-primary)] font-medium">{Math.round((co.currentWeek / co.totalWeeks) * 100)}%</span>
                  </div>
                  <ProgressBar value={co.currentWeek} max={co.totalWeeks} size="sm" variant="brand" />
                </div>
              )}

              {/* Avatar stack + compliance */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-light)]">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {co.avatars.slice(0, 4).map((name) => (
                      <div key={name} className="ring-2 ring-[var(--color-surface)] rounded-full">
                        <Avatar name={name} size="sm" />
                      </div>
                    ))}
                  </div>
                  <span className="text-body-xs text-[var(--color-text-tertiary)]">
                    +{co.members - 4} more
                  </span>
                </div>
                {co.avgCompliance > 0 && (
                  <div className="flex items-center gap-1 text-body-xs">
                    <TrendingUp size={11} className="text-success-500" />
                    <span className="tabular-nums text-[var(--color-text-primary)]">{co.avgCompliance}% compliance</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
