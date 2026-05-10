'use client';

import { useState } from 'react';
import { Trophy, Flame, Dumbbell, TrendingUp, Medal, Crown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const LEADERS = {
  compliance: [
    { rank: 1, name: 'Emma D.', value: 97, unit: '%', streak: 22, change: 0 },
    { rank: 2, name: 'Hannah L.', value: 95, unit: '%', streak: 18, change: 1 },
    { rank: 3, name: 'James W.', value: 94, unit: '%', streak: 12, change: -1 },
    { rank: 4, name: 'Sophie T.', value: 91, unit: '%', streak: 15, change: 0 },
    { rank: 5, name: 'Nina P.', value: 89, unit: '%', streak: 10, change: 2 },
    { rank: 6, name: 'Maria S.', value: 88, unit: '%', streak: 8, change: -1 },
    { rank: 7, name: 'Tom B.', value: 83, unit: '%', streak: 6, change: 0 },
  ],
  volume: [
    { rank: 1, name: 'James W.', value: 18400, unit: 'kg', streak: 12, change: 0 },
    { rank: 2, name: 'Tom B.', value: 16200, unit: 'kg', streak: 6, change: 1 },
    { rank: 3, name: 'Ryan Park', value: 15800, unit: 'kg', streak: 4, change: -1 },
    { rank: 4, name: 'Alex Chen', value: 14900, unit: 'kg', streak: 0, change: 0 },
    { rank: 5, name: 'Emma D.', value: 13200, unit: 'kg', streak: 22, change: 2 },
  ],
  streak: [
    { rank: 1, name: 'Emma D.', value: 22, unit: 'days', streak: 22, change: 0 },
    { rank: 2, name: 'Hannah L.', value: 18, unit: 'days', streak: 18, change: 0 },
    { rank: 3, name: 'Sophie T.', value: 15, unit: 'days', streak: 15, change: 1 },
    { rank: 4, name: 'James W.', value: 12, unit: 'days', streak: 12, change: -1 },
    { rank: 5, name: 'Nina P.', value: 10, unit: 'days', streak: 10, change: 0 },
  ],
  prs: [
    { rank: 1, name: 'James W.', value: 8, unit: 'PRs', streak: 12, change: 0 },
    { rank: 2, name: 'Tom B.', value: 6, unit: 'PRs', streak: 6, change: 2 },
    { rank: 3, name: 'Ryan Park', value: 5, unit: 'PRs', streak: 4, change: 0 },
    { rank: 4, name: 'Alex Chen', value: 4, unit: 'PRs', streak: 0, change: -1 },
    { rank: 5, name: 'Sophie T.', value: 4, unit: 'PRs', streak: 15, change: 1 },
  ],
};

const tabs = [
  { id: 'compliance', label: 'Compliance' },
  { id: 'volume', label: 'Total Volume' },
  { id: 'streak', label: 'Longest Streak' },
  { id: 'prs', label: 'PRs This Month' },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof LEADERS>('compliance');
  const leaders = LEADERS[activeTab];

  const rankColors = (rank: number) => {
    if (rank === 1) return 'from-amber-400 to-amber-600 text-white';
    if (rank === 2) return 'from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'from-orange-500 to-amber-700 text-white';
    return 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Leaderboard</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Drive client motivation with friendly competition. Updated weekly.
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4">
        {[leaders[1], leaders[0], leaders[2]].filter(Boolean).map((leader, i) => {
          const actualRank = leader.rank;
          const isFirst = actualRank === 1;
          return (
            <Card
              key={leader.name}
              className={cn(
                'relative overflow-hidden',
                isFirst && 'glow-green border-brand-500/30'
              )}
            >
              <CardContent className="flex flex-col items-center text-center py-6">
                {isFirst && (
                  <Crown size={20} className="absolute top-3 right-3 text-amber-500" />
                )}
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold mb-3 bg-gradient-to-br',
                  rankColors(actualRank)
                )}>
                  {actualRank}
                </div>
                <Avatar name={leader.name} size="lg" />
                <p className="mt-3 text-sub-md text-[var(--color-text-primary)]">{leader.name}</p>
                <p className="text-heading-2 tabular-nums text-brand-500 mt-1">
                  {leader.value.toLocaleString()}
                  <span className="text-body-sm text-[var(--color-text-tertiary)] ml-1">{leader.unit}</span>
                </p>
                {leader.streak > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-body-xs text-orange-500">
                    <Flame size={12} />
                    {leader.streak}d streak
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as keyof typeof LEADERS)} />

      {/* Full Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy size={14} className="text-brand-500" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {leaders.map((leader) => (
              <div
                key={leader.name}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--color-surface-hover)]',
                  leader.rank <= 3 && 'bg-brand-50/30 dark:bg-brand-900/10'
                )}
              >
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-body-sm font-semibold tabular-nums',
                  leader.rank <= 3 ? `bg-gradient-to-br ${rankColors(leader.rank)}` : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]'
                )}>
                  {leader.rank <= 3 ? <Medal size={14} /> : leader.rank}
                </div>
                <Avatar name={leader.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sub-sm text-[var(--color-text-primary)]">{leader.name}</p>
                  {leader.streak > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Flame size={10} className="text-orange-500" />
                      <span className="text-body-xs text-[var(--color-text-tertiary)]">{leader.streak}d streak</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">
                    {leader.value.toLocaleString()}
                    <span className="text-body-xs text-[var(--color-text-tertiary)] ml-1">{leader.unit}</span>
                  </p>
                  {leader.change !== 0 && (
                    <span className={cn(
                      'text-body-xs font-medium',
                      leader.change > 0 ? 'text-success-500' : 'text-error-500'
                    )}>
                      {leader.change > 0 ? '▲' : '▼'} {Math.abs(leader.change)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insight Card */}
      <Card className="card-domain">
        <CardContent className="py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10">
              <TrendingUp size={16} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sub-md text-[var(--color-text-inverse)]">Weekly Insight</p>
              <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                <span className="text-brand-400">Emma D.</span> leads in compliance for the 3rd week in a row.
                Consider featuring her as a success story. <span className="text-brand-400">Tom B.</span> jumped 2 spots in volume — celebrate the milestone.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
