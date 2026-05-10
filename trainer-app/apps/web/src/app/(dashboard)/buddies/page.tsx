'use client';

import { Plus, Users, Shuffle, MessageSquare, TrendingUp, Flame, Zap, Link } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';

const PAIRS = [
  { id: 'p1', a: { name: 'James W.', compliance: 94, streak: 12 }, b: { name: 'Tom B.', compliance: 83, streak: 6 }, weeklyCheckIns: 3, status: 'active', score: 88 },
  { id: 'p2', a: { name: 'Emma D.', compliance: 97, streak: 22 }, b: { name: 'Sophie T.', compliance: 91, streak: 15 }, weeklyCheckIns: 4, status: 'active', score: 94 },
  { id: 'p3', a: { name: 'Maria S.', compliance: 88, streak: 8 }, b: { name: 'Nina P.', compliance: 89, streak: 10 }, weeklyCheckIns: 2, status: 'active', score: 82 },
  { id: 'p4', a: { name: 'Ryan P.', compliance: 76, streak: 4 }, b: { name: 'Hannah L.', compliance: 95, streak: 18 }, weeklyCheckIns: 1, status: 'needs-attention', score: 65 },
];

export default function BuddiesPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Accountability Buddies</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Pair clients for mutual accountability. Paired clients retain 2.3x longer.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Shuffle size={14} />}>Auto-Pair</Button>
          <Button variant="primary" icon={<Plus size={14} />}>Create Pair</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="hover-limitless">
          <CardContent className="p-4 text-center">
            <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">{PAIRS.length}</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)]">Active pairs</p>
          </CardContent>
        </Card>
        <Card className="hover-limitless">
          <CardContent className="p-4 text-center">
            <p className="text-heading-2 tabular-nums text-brand-500">82%</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)]">Avg buddy score</p>
          </CardContent>
        </Card>
        <Card className="hover-limitless">
          <CardContent className="p-4 text-center">
            <p className="text-heading-2 tabular-nums text-success-500">+23%</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)]">Retention increase</p>
          </CardContent>
        </Card>
      </div>

      {/* Pair cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PAIRS.map((pair) => (
          <Card key={pair.id} className="hover-limitless">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Badge variant={pair.status === 'active' ? 'success' : 'warning'} dot>
                  {pair.status === 'active' ? 'Active' : 'Needs attention'}
                </Badge>
                <div className="flex items-center gap-1 text-body-xs">
                  <MessageSquare size={11} className="text-[var(--color-text-tertiary)]" />
                  <span className="tabular-nums text-[var(--color-text-secondary)]">{pair.weeklyCheckIns}/wk</span>
                </div>
              </div>

              {/* The pair */}
              <div className="flex items-center gap-3">
                <div className="flex-1 text-center">
                  <Avatar name={pair.a.name} size="lg" className="mx-auto" />
                  <p className="text-sub-sm text-[var(--color-text-primary)] mt-2">{pair.a.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-1 text-body-xs text-[var(--color-text-tertiary)]">
                    <span className="tabular-nums">{pair.a.compliance}%</span>
                    <Flame size={10} className="text-orange-500" />
                    <span className="tabular-nums">{pair.a.streak}d</span>
                  </div>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
                  <Link size={16} className="text-brand-500" />
                </div>

                <div className="flex-1 text-center">
                  <Avatar name={pair.b.name} size="lg" className="mx-auto" />
                  <p className="text-sub-sm text-[var(--color-text-primary)] mt-2">{pair.b.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-1 text-body-xs text-[var(--color-text-tertiary)]">
                    <span className="tabular-nums">{pair.b.compliance}%</span>
                    <Flame size={10} className="text-orange-500" />
                    <span className="tabular-nums">{pair.b.streak}d</span>
                  </div>
                </div>
              </div>

              {/* Buddy score */}
              <div className="mt-4 pt-3 border-t border-[var(--color-border-light)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-body-xs text-[var(--color-text-tertiary)]">Buddy Score</span>
                  <span className="text-sub-sm tabular-nums text-[var(--color-text-primary)]">{pair.score}/100</span>
                </div>
                <ProgressBar value={pair.score} variant={pair.score >= 80 ? 'brand' : pair.score >= 60 ? 'warning' : 'error'} size="sm" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insight */}
      <Card className="card-domain">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Zap size={16} className="text-brand-400 mt-0.5" />
            <div>
              <p className="text-sub-md text-[var(--color-text-inverse)]">Buddy System Impact</p>
              <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
                Paired clients average 88% compliance vs 71% for solo clients. Consider pairing <span className="text-brand-400">Ryan P.</span> with a more active buddy — his current pair has a low check-in frequency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
