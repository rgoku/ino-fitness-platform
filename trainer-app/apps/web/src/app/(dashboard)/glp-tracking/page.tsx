'use client';

import { useState } from 'react';
import {
  Syringe,
  Pill,
  BookOpen,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Share2,
  Plus,
  Clock,
  Moon,
  Watch,
  Zap,
  Heart,
  Footprints,
  Activity,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

// --- Mock Data ---

const GLP_DATA = {
  currentDose: '1.0 mg',
  medication: 'Semaglutide (Ozempic)',
  nextInjection: '2026-06-10',
  schedule: 'Weekly (Tuesdays)',
  startDate: '2026-02-15',
  injectionSites: [
    { site: 'Left abdomen', lastUsed: '2026-06-03', next: false },
    { site: 'Right abdomen', lastUsed: '2026-05-27', next: false },
    { site: 'Left thigh', lastUsed: '2026-05-20', next: true },
    { site: 'Right thigh', lastUsed: '2026-05-13', next: false },
  ],
  doseHistory: [
    { date: '2026-02-15', dose: '0.25 mg', week: 1 },
    { date: '2026-03-15', dose: '0.5 mg', week: 5 },
    { date: '2026-04-12', dose: '0.75 mg', week: 9 },
    { date: '2026-05-10', dose: '1.0 mg', week: 13 },
  ],
  sideEffects: [
    { date: '2026-06-05', nausea: 2, appetiteChange: -4, notes: 'Mild nausea in the morning, resolved by noon' },
    { date: '2026-06-04', nausea: 1, appetiteChange: -3, notes: 'Slight reduced appetite, otherwise fine' },
    { date: '2026-06-03', nausea: 4, appetiteChange: -6, notes: 'Injection day - moderate nausea, low appetite' },
    { date: '2026-06-02', nausea: 0, appetiteChange: -2, notes: 'Feeling good, energy stable' },
    { date: '2026-06-01', nausea: 1, appetiteChange: -3, notes: 'Normal day' },
  ],
  weightProgress: [
    { date: '2026-02-15', weight: 98.2, milestone: 'Started GLP-1' },
    { date: '2026-03-01', weight: 96.8, milestone: null },
    { date: '2026-03-15', weight: 95.1, milestone: 'Dose increase to 0.5mg' },
    { date: '2026-04-01', weight: 93.5, milestone: null },
    { date: '2026-04-12', weight: 92.0, milestone: 'Dose increase to 0.75mg' },
    { date: '2026-05-01', weight: 90.3, milestone: null },
    { date: '2026-05-10', weight: 89.1, milestone: 'Dose increase to 1.0mg' },
    { date: '2026-06-01', weight: 87.4, milestone: null },
    { date: '2026-06-08', weight: 86.8, milestone: 'Current' },
  ],
};

interface Compound {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  startDate: string;
  cycleLength: string;
  active: boolean;
  sharedWithClient: boolean;
  safetyNotes: string;
}

const COMPOUNDS: Compound[] = [
  { id: 'c1', name: 'BPC-157', dose: '250 mcg', frequency: '2x daily', startDate: '2026-04-01', cycleLength: '8 weeks', active: true, sharedWithClient: true, safetyNotes: 'Subcutaneous injection near injury site. Monitor for redness or irritation.' },
  { id: 'c2', name: 'Ipamorelin', dose: '200 mcg', frequency: 'Pre-bed daily', startDate: '2026-05-01', cycleLength: '12 weeks', active: true, sharedWithClient: false, safetyNotes: 'Growth hormone secretagogue. Take on empty stomach. Report tingling or water retention.' },
  { id: 'c3', name: 'TB-500', dose: '2.5 mg', frequency: '2x per week', startDate: '2026-04-01', cycleLength: '6 weeks', active: false, sharedWithClient: true, safetyNotes: 'Thymosin beta-4 fragment. Completed cycle. Monitor for fatigue.' },
];

interface JournalEntry {
  date: string;
  feeling: number;
  energy: number;
  sleepQuality: number;
  appetite: number;
  mood: number;
  notes: string;
  sleepHours?: number;
  hrv?: number;
  restingHR?: number;
  steps?: number;
}

const JOURNAL: JournalEntry[] = [
  { date: '2026-06-08', feeling: 7, energy: 7, sleepQuality: 8, appetite: 4, mood: 8, notes: 'Good training day. Energy was consistent throughout.', sleepHours: 7.5, hrv: 48, restingHR: 58, steps: 9200 },
  { date: '2026-06-07', feeling: 6, energy: 5, sleepQuality: 6, appetite: 3, mood: 6, notes: 'Rest day. Felt a bit sluggish after poor sleep.', sleepHours: 5.8, hrv: 35, restingHR: 62, steps: 4500 },
  { date: '2026-06-06', feeling: 8, energy: 8, sleepQuality: 9, appetite: 5, mood: 8, notes: 'Excellent recovery. PR on deadlift.', sleepHours: 8.2, hrv: 55, restingHR: 55, steps: 11000 },
  { date: '2026-06-05', feeling: 5, energy: 4, sleepQuality: 7, appetite: 3, mood: 5, notes: 'Post-injection day. Slight nausea.', sleepHours: 7.0, hrv: 42, restingHR: 60, steps: 6800 },
];

const FEELING_LABELS: Record<number, string> = {
  1: 'Terrible', 2: 'Very Bad', 3: 'Bad', 4: 'Below Avg', 5: 'Average',
  6: 'Above Avg', 7: 'Good', 8: 'Great', 9: 'Excellent', 10: 'Peak',
};

const INTEGRATIONS = {
  oura: { connected: false, name: 'Oura Ring', icon: Moon },
  whoop: { connected: true, name: 'WHOOP', icon: Watch },
  ultrahuman: { connected: false, name: 'Ultrahuman', icon: Zap },
};

// --- Component ---

export default function GLPTrackingPage() {
  const [activeTab, setActiveTab] = useState('glp1');
  const [showAddCompound, setShowAddCompound] = useState(false);

  const tabs = [
    { id: 'glp1', label: 'GLP-1 Tracking' },
    { id: 'peptides', label: 'Peptides & Compounds' },
    { id: 'journal', label: 'Daily Journal' },
  ];

  const weightLost = GLP_DATA.weightProgress[0].weight - GLP_DATA.weightProgress[GLP_DATA.weightProgress.length - 1].weight;
  const weeksSinceStart = Math.round(
    (new Date().getTime() - new Date(GLP_DATA.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">GLP-1 & Peptides Tracker</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Track medications, peptides, side effects, and daily wellness.
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'glp1' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardContent className="py-4">
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Current Dose</p>
                <p className="text-sub-md tabular-nums text-[var(--color-text-primary)] mt-1">{GLP_DATA.currentDose}</p>
                <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">{GLP_DATA.medication}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Weight Lost</p>
                <p className="text-sub-md tabular-nums text-emerald-600 mt-1">-{weightLost.toFixed(1)} kg</p>
                <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">{weeksSinceStart} weeks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Next Injection</p>
                <p className="text-sub-md text-[var(--color-text-primary)] mt-1">
                  {new Date(GLP_DATA.nextInjection).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">{GLP_DATA.schedule}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Current Weight</p>
                <p className="text-sub-md tabular-nums text-[var(--color-text-primary)] mt-1">
                  {GLP_DATA.weightProgress[GLP_DATA.weightProgress.length - 1].weight} kg
                </p>
                <p className="text-body-xs text-emerald-600 mt-0.5">
                  <TrendingDown size={10} className="inline mr-0.5" />
                  On track
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Injection Site Rotation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe size={16} className="text-[var(--color-text-tertiary)]" />
                Injection Site Rotation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {GLP_DATA.injectionSites.map((site) => (
                  <div
                    key={site.site}
                    className={cn(
                      'rounded-lg border p-3 text-center transition-colors',
                      site.next
                        ? 'border-blue-600 bg-blue-600/5'
                        : 'border-[var(--color-border)]'
                    )}
                  >
                    <p className="text-body-xs font-medium text-[var(--color-text-primary)]">{site.site}</p>
                    <p className="text-body-xs text-[var(--color-text-tertiary)] mt-1 tabular-nums">
                      {new Date(site.lastUsed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    {site.next && <Badge variant="info" className="mt-2">Next</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side Effects Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-[var(--color-text-tertiary)]" />
                Side Effects Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {GLP_DATA.sideEffects.map((entry) => (
                  <div key={entry.date} className="flex items-start gap-4 py-2 border-b border-[var(--color-border)] last:border-0">
                    <div className="shrink-0">
                      <p className="text-body-xs tabular-nums text-[var(--color-text-tertiary)]">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-body-xs text-[var(--color-text-tertiary)]">Nausea:</span>
                          <ProgressBar value={entry.nausea} max={10} size="sm" variant={entry.nausea > 5 ? 'error' : entry.nausea > 2 ? 'warning' : 'success'} className="w-16" />
                          <span className="text-body-xs tabular-nums text-[var(--color-text-secondary)]">{entry.nausea}/10</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-body-xs text-[var(--color-text-tertiary)]">Appetite:</span>
                          <span className="text-body-xs tabular-nums text-[var(--color-text-secondary)]">{entry.appetiteChange > 0 ? '+' : ''}{entry.appetiteChange}</span>
                        </div>
                      </div>
                      <p className="text-body-xs text-[var(--color-text-secondary)]">{entry.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weight Chart (simplified) + Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown size={16} className="text-[var(--color-text-tertiary)]" />
                Weight Progress & GLP-1 Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Simplified chart representation */}
              <div className="relative">
                <div className="flex items-end justify-between gap-1 h-40 mb-4">
                  {GLP_DATA.weightProgress.map((point, idx) => {
                    const min = 85;
                    const max = 100;
                    const height = ((point.weight - min) / (max - min)) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-body-xs tabular-nums text-[var(--color-text-tertiary)]">
                          {point.weight}
                        </span>
                        <div
                          className={cn(
                            'w-full rounded-t-sm transition-all',
                            point.milestone ? 'bg-blue-600' : 'bg-blue-600/40'
                          )}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Timeline milestones */}
                <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
                  {GLP_DATA.weightProgress
                    .filter((p) => p.milestone)
                    .map((point, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                        <span className="text-body-xs tabular-nums text-[var(--color-text-tertiary)] w-20">
                          {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-body-xs text-[var(--color-text-primary)]">{point.milestone}</span>
                        <span className="text-body-xs tabular-nums text-[var(--color-text-secondary)] ml-auto">{point.weight} kg</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'peptides' && (
        <div className="space-y-6">
          {/* Current Stack */}
          <div className="flex items-center justify-between">
            <h2 className="text-sub-md text-[var(--color-text-primary)]">Current Stack</h2>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddCompound(!showAddCompound)}>
              Add Compound
            </Button>
          </div>

          {/* Add compound form (toggle) */}
          {showAddCompound && (
            <Card className="border-blue-600/30">
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-body-xs font-medium text-[var(--color-text-primary)]">Compound Name</label>
                    <input className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)]" placeholder="e.g. BPC-157" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-body-xs font-medium text-[var(--color-text-primary)]">Dose</label>
                    <input className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)]" placeholder="e.g. 250 mcg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-body-xs font-medium text-[var(--color-text-primary)]">Frequency</label>
                    <input className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)]" placeholder="e.g. 2x daily" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-body-xs font-medium text-[var(--color-text-primary)]">Start Date</label>
                    <input type="date" className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-body-xs font-medium text-[var(--color-text-primary)]">Cycle Length</label>
                    <input className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)]" placeholder="e.g. 8 weeks" />
                  </div>
                  <div className="flex items-end">
                    <Button size="md">Save Compound</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compounds list */}
          <div className="space-y-4">
            {COMPOUNDS.map((compound) => (
              <Card key={compound.id} className={cn(!compound.active && 'opacity-60')}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                        compound.active ? 'bg-blue-600/10' : 'bg-[var(--color-surface-tertiary)]'
                      )}>
                        <Pill size={16} className={compound.active ? 'text-blue-600' : 'text-[var(--color-text-tertiary)]'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-body-sm font-medium text-[var(--color-text-primary)]">{compound.name}</h3>
                          <Badge variant={compound.active ? 'success' : 'default'} dot>
                            {compound.active ? 'Active' : 'Completed'}
                          </Badge>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-xs text-[var(--color-text-secondary)]">
                          <span className="tabular-nums">{compound.dose}</span>
                          <span>{compound.frequency}</span>
                          <span className="tabular-nums">{compound.cycleLength}</span>
                        </div>
                        {/* Dosage timeline */}
                        <div className="mt-2 flex items-center gap-2">
                          <Clock size={12} className="text-[var(--color-text-tertiary)]" />
                          <span className="text-body-xs text-[var(--color-text-tertiary)]">
                            Started {new Date(compound.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        {/* Safety notes */}
                        <div className="mt-3 rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-2.5">
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-body-xs text-amber-800 dark:text-amber-300">{compound.safetyNotes}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2 py-1 text-body-xs transition-colors',
                          compound.sharedWithClient
                            ? 'bg-blue-600/10 text-blue-600'
                            : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)]'
                        )}
                        title={compound.sharedWithClient ? 'Shared with client' : 'Not shared'}
                      >
                        <Share2 size={12} />
                        <span>{compound.sharedWithClient ? 'Shared' : 'Private'}</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="space-y-6">
          {/* Integration Status */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-body-sm font-medium text-[var(--color-text-primary)]">Integration Status</p>
                <div className="flex items-center gap-3">
                  {Object.entries(INTEGRATIONS).map(([key, info]) => {
                    const Icon = info.icon;
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <Icon size={14} className={info.connected ? 'text-emerald-600' : 'text-[var(--color-text-tertiary)]'} />
                        <span className={cn(
                          'text-body-xs',
                          info.connected ? 'text-emerald-600' : 'text-[var(--color-text-tertiary)]'
                        )}>
                          {info.name}
                        </span>
                        <Badge variant={info.connected ? 'success' : 'default'} className="text-[10px] px-1.5">
                          {info.connected ? 'Connected' : 'Manual'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              {!INTEGRATIONS.oura.connected && (
                <p className="mt-2 text-body-xs text-amber-600">
                  <AlertTriangle size={10} className="inline mr-1" />
                  Oura Ring not connected. Sleep, HRV, and resting HR data requires manual entry.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Journal Entries */}
          <div className="space-y-4">
            {JOURNAL.map((entry) => (
              <Card key={entry.date}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[var(--color-text-tertiary)]" />
                      <span className="text-body-sm font-medium text-[var(--color-text-primary)]">
                        {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-body-xs text-[var(--color-text-tertiary)]">Overall:</span>
                      <span className={cn(
                        'text-body-sm font-medium tabular-nums',
                        entry.feeling >= 7 ? 'text-emerald-600' : entry.feeling >= 5 ? 'text-amber-600' : 'text-rose-600'
                      )}>
                        {entry.feeling}/10
                      </span>
                      <span className="text-body-xs text-[var(--color-text-secondary)]">
                        {FEELING_LABELS[entry.feeling]}
                      </span>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
                    <div className="rounded-lg bg-[var(--color-surface-secondary)] p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap size={12} className="text-amber-500" />
                        <span className="text-body-xs text-[var(--color-text-tertiary)]">Energy</span>
                      </div>
                      <p className="text-body-sm font-medium tabular-nums text-[var(--color-text-primary)]">{entry.energy}/10</p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface-secondary)] p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Moon size={12} className="text-indigo-500" />
                        <span className="text-body-xs text-[var(--color-text-tertiary)]">Sleep</span>
                      </div>
                      <p className="text-body-sm font-medium tabular-nums text-[var(--color-text-primary)]">{entry.sleepQuality}/10</p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface-secondary)] p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Activity size={12} className="text-blue-500" />
                        <span className="text-body-xs text-[var(--color-text-tertiary)]">Appetite</span>
                      </div>
                      <p className="text-body-sm font-medium tabular-nums text-[var(--color-text-primary)]">{entry.appetite}/10</p>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface-secondary)] p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Heart size={12} className="text-rose-500" />
                        <span className="text-body-xs text-[var(--color-text-tertiary)]">Mood</span>
                      </div>
                      <p className="text-body-sm font-medium tabular-nums text-[var(--color-text-primary)]">{entry.mood}/10</p>
                    </div>
                  </div>

                  {/* Manual entry fields (when Oura not connected) */}
                  {entry.sleepHours !== undefined && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4 border-t border-[var(--color-border)] pt-3">
                      <div className="flex items-center gap-2">
                        <Moon size={12} className="text-[var(--color-text-tertiary)]" />
                        <div>
                          <p className="text-body-xs text-[var(--color-text-tertiary)]">Sleep</p>
                          <p className="text-body-xs tabular-nums font-medium text-[var(--color-text-primary)]">{entry.sleepHours}h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity size={12} className="text-[var(--color-text-tertiary)]" />
                        <div>
                          <p className="text-body-xs text-[var(--color-text-tertiary)]">HRV</p>
                          <p className="text-body-xs tabular-nums font-medium text-[var(--color-text-primary)]">{entry.hrv} ms</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart size={12} className="text-[var(--color-text-tertiary)]" />
                        <div>
                          <p className="text-body-xs text-[var(--color-text-tertiary)]">Resting HR</p>
                          <p className="text-body-xs tabular-nums font-medium text-[var(--color-text-primary)]">{entry.restingHR} bpm</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Footprints size={12} className="text-[var(--color-text-tertiary)]" />
                        <div>
                          <p className="text-body-xs text-[var(--color-text-tertiary)]">Steps</p>
                          <p className="text-body-xs tabular-nums font-medium text-[var(--color-text-primary)]">{entry.steps?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="flex items-start gap-2">
                    <BookOpen size={12} className="text-[var(--color-text-tertiary)] mt-0.5 shrink-0" />
                    <p className="text-body-xs text-[var(--color-text-secondary)]">{entry.notes}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add entry button */}
          <div className="flex justify-center">
            <Button variant="secondary" icon={<Plus size={14} />}>
              Add Journal Entry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
