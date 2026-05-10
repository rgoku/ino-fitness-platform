'use client';

import { Plus, Trophy, Flame, Users, Calendar, DollarSign, Crown, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';

const CHALLENGES = [
  {
    id: 'ch1', name: '30-Day Summer Shred',
    type: 'transformation', startDate: '2026-04-01',
    daysLeft: 12, entryFee: 49,
    participants: 142, prize: 1500,
    leader: { name: 'Emma D.', score: 94 },
    me: { rank: 12, score: 78 },
  },
  {
    id: 'ch2', name: 'March Madness Squat Challenge',
    type: 'strength', startDate: '2026-03-01',
    daysLeft: 0, entryFee: 29,
    participants: 68, prize: 500,
    leader: { name: 'Tom B.', score: 225 },
    me: { rank: 4, score: 185 },
    completed: true,
  },
  {
    id: 'ch3', name: '100k Step Marathon',
    type: 'volume', startDate: '2026-04-15',
    daysLeft: 19, entryFee: 19,
    participants: 94, prize: 400,
    leader: { name: 'Hannah L.', score: 48200 },
    me: { rank: 8, score: 32100 },
  },
];

const TOP5 = [
  { rank: 1, name: 'Emma D.', score: 94, change: 0 },
  { rank: 2, name: 'James W.', score: 91, change: 1 },
  { rank: 3, name: 'Sophie T.', score: 89, change: -1 },
  { rank: 4, name: 'Maria S.', score: 86, change: 2 },
  { rank: 5, name: 'Ryan P.', score: 84, change: 0 },
];

export default function ChallengesPage() {
  const totalRevenue = CHALLENGES.reduce((s, c) => s + c.entryFee * c.participants, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Challenges</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Run paid transformation challenges. Entry fees + leaderboards = bulk revenue spikes.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Launch Challenge</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Entries', value: '304', icon: Users, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-success-50 text-success-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
          { label: 'Running', value: '2', icon: Flame, color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
          { label: 'Prize Pool', value: `$${CHALLENGES.reduce((s, c) => s + c.prize, 0).toLocaleString()}`, icon: Trophy, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
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

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CHALLENGES.map((ch) => (
          <Card key={ch.id} className="hover-limitless overflow-hidden">
            {/* Banner */}
            <div className={`relative h-24 ${ch.completed ? 'bg-gradient-to-br from-[var(--color-surface-tertiary)] to-[var(--color-surface-hover)]' : 'bg-gradient-to-br from-brand-500 to-cyan-500'} p-4`}>
              <div className="absolute top-3 right-3">
                {ch.completed ? (
                  <Badge variant="default">Completed</Badge>
                ) : ch.daysLeft <= 7 ? (
                  <Badge variant="warning" dot>{ch.daysLeft}d left</Badge>
                ) : (
                  <Badge variant="success" dot>{ch.daysLeft}d left</Badge>
                )}
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className={`text-sub-md ${ch.completed ? 'text-[var(--color-text-primary)]' : 'text-white'}`}>{ch.name}</h3>
                <p className={`text-body-xs ${ch.completed ? 'text-[var(--color-text-tertiary)]' : 'text-white/80'} capitalize`}>
                  {ch.type} · ${ch.entryFee} entry
                </p>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ch.participants}</p>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">Joined</p>
                </div>
                <div>
                  <p className="text-sub-md tabular-nums text-brand-500">${ch.prize}</p>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">Prize</p>
                </div>
                <div>
                  <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">#{ch.me.rank}</p>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">Your rank</p>
                </div>
              </div>

              {/* Leader */}
              <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 flex items-center gap-3">
                <Crown size={16} className="text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">Leading</p>
                  <p className="text-body-sm text-[var(--color-text-primary)] truncate">{ch.leader.name}</p>
                </div>
                <p className="text-sub-sm tabular-nums text-amber-600 dark:text-amber-400">{ch.leader.score.toLocaleString()}</p>
              </div>

              {!ch.completed && (
                <Button variant="primary" size="sm" className="w-full" icon={<Zap size={12} />}>
                  View Leaderboard
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Leaderboard */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-heading-3 text-[var(--color-text-primary)]">30-Day Summer Shred — Live Leaderboard</h2>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">Updated in real-time · 142 competitors</p>
            </div>
            <Badge variant="warning" dot>12 days left</Badge>
          </div>
          <div className="space-y-2">
            {TOP5.map((p) => (
              <div key={p.rank} className="flex items-center gap-3 rounded-lg p-3 hover:bg-[var(--color-surface-hover)] transition-colors">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sub-sm font-semibold tabular-nums ${
                  p.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                  p.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                  p.rank === 3 ? 'bg-gradient-to-br from-orange-500 to-amber-700 text-white' :
                  'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]'
                }`}>
                  {p.rank}
                </div>
                <Avatar name={p.name} size="md" />
                <p className="flex-1 text-sub-sm text-[var(--color-text-primary)]">{p.name}</p>
                {p.change !== 0 && (
                  <span className={`text-body-xs ${p.change > 0 ? 'text-success-500' : 'text-error-500'}`}>
                    {p.change > 0 ? '▲' : '▼'}{Math.abs(p.change)}
                  </span>
                )}
                <div className="text-right">
                  <p className="text-sub-md tabular-nums text-brand-500">{p.score}</p>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
