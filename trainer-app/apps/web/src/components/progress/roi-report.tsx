'use client';

import { Trophy, TrendingUp, TrendingDown, Flame, Dumbbell, Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

interface ROIMetric {
  label: string;
  before: string;
  after: string;
  change: string;
  direction: 'up' | 'down' | 'neutral';
  positive: boolean;
}

interface ROIReportProps {
  clientName: string;
  startDate: string;
  endDate: string;
  weeksElapsed: number;
  complianceRate: number;
  workoutsCompleted: number;
  totalVolume: number;
  prsHit: number;
  metrics: ROIMetric[];
}

const DEFAULT_METRICS: ROIMetric[] = [
  { label: 'Body Weight', before: '85 kg', after: '81 kg', change: '-4 kg', direction: 'down', positive: true },
  { label: 'Body Fat %', before: '18.5%', after: '14.2%', change: '-4.3%', direction: 'down', positive: true },
  { label: 'Bench Press', before: '70 kg', after: '102.5 kg', change: '+32.5 kg', direction: 'up', positive: true },
  { label: 'Squat', before: '100 kg', after: '142.5 kg', change: '+42.5 kg', direction: 'up', positive: true },
  { label: 'Deadlift', before: '140 kg', after: '185 kg', change: '+45 kg', direction: 'up', positive: true },
  { label: 'Lean Mass', before: '69.3 kg', after: '69.5 kg', change: '+0.2 kg', direction: 'up', positive: true },
];

export function ROIReport({
  clientName = 'James Wilson',
  startDate = '2026-01-20',
  endDate = '2026-04-20',
  weeksElapsed = 12,
  complianceRate = 94,
  workoutsCompleted = 45,
  totalVolume = 78400,
  prsHit = 8,
  metrics = DEFAULT_METRICS,
}: Partial<ROIReportProps>) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-domain">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={clientName} size="xl" />
              <div>
                <p className="text-body-xs text-[var(--color-text-secondary)] uppercase tracking-wider">Progress Report</p>
                <h1 className="text-heading-1 text-[var(--color-text-inverse)]">{clientName}</h1>
                <p className="text-body-sm text-[var(--color-text-secondary)]">
                  {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()} · {weeksElapsed} weeks
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={<Share2 size={14} />}>Share</Button>
              <Button variant="primary" size="sm" icon={<Download size={14} />}>Export PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top-level stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon={Trophy} value={`${complianceRate}%`} label="Compliance" color="bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400" />
        <StatTile icon={Dumbbell} value={workoutsCompleted.toString()} label="Workouts" color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
        <StatTile icon={Flame} value={`${(totalVolume / 1000).toFixed(1)}t`} label="Volume" color="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" />
        <StatTile icon={TrendingUp} value={prsHit.toString()} label="PRs hit" color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
      </div>

      {/* Transformation metrics */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-heading-3 text-[var(--color-text-primary)] mb-4">Transformation</h2>
          <div className="space-y-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-4 rounded-lg bg-[var(--color-surface-secondary)] p-4"
              >
                <p className="text-sub-sm text-[var(--color-text-primary)]">{m.label}</p>
                <div>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">Before</p>
                  <p className="text-sub-md tabular-nums text-[var(--color-text-secondary)]">{m.before}</p>
                </div>
                <div>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">After</p>
                  <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{m.after}</p>
                </div>
                <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${
                  m.positive ? 'bg-success-50 dark:bg-emerald-900/20 text-success-600 dark:text-emerald-400' : 'bg-error-50 dark:bg-red-900/20 text-error-600'
                }`}>
                  {m.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span className="text-sub-sm tabular-nums">{m.change}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shareable quote */}
      <Card className="glow-green">
        <CardContent className="p-6 text-center">
          <p className="text-heading-3 text-[var(--color-text-primary)]">
            <span className="text-gradient">12 weeks</span> of work.
          </p>
          <p className="text-body-md text-[var(--color-text-secondary)] mt-2">
            -4 kg body weight · -4.3% body fat · +120 kg total strength added
          </p>
          <p className="text-body-xs text-[var(--color-text-tertiary)] mt-4">
            Coached by Sarah Mitchell · INÖ Fitness
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ icon: Icon, value, label, color }: { icon: typeof Trophy; value: string; label: string; color: string }) {
  return (
    <Card className="hover-limitless">
      <CardContent className="p-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} mb-3`}>
          <Icon size={18} />
        </div>
        <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">{value}</p>
        <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5 uppercase tracking-wider">{label}</p>
      </CardContent>
    </Card>
  );
}
