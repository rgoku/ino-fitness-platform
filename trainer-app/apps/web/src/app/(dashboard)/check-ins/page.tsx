'use client';

import { useState } from 'react';
import { ClipboardCheck, Camera, Scale, TrendingUp, MessageSquare, ChevronRight, Calendar } from 'lucide-react';
import { useCheckIns } from '@/hooks/use-check-ins';
import { CheckInCard } from '@/components/check-ins/check-in-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';

const mockWeeklyCheckIns = [
  {
    id: 'wci-1',
    clientName: 'James W.',
    clientId: 'c1',
    date: '2026-04-18',
    status: 'pending' as const,
    weight: 80.2,
    prevWeight: 80.8,
    bodyFat: 14.2,
    measurements: { chest: 102, waist: 82, hips: 96, arms: 38, thighs: 58 },
    photos: ['front', 'side', 'back'],
    mood: 'Great',
    sleepAvg: 7.5,
    adherence: 92,
    notes: 'Feeling strong this week. Hit a bench PR.',
  },
  {
    id: 'wci-2',
    clientName: 'Maria S.',
    clientId: 'c2',
    date: '2026-04-17',
    status: 'pending' as const,
    weight: 61.5,
    prevWeight: 62.0,
    bodyFat: 21.8,
    measurements: { chest: 88, waist: 68, hips: 94, arms: 28, thighs: 54 },
    photos: ['front', 'side'],
    mood: 'Good',
    sleepAvg: 7.0,
    adherence: 88,
    notes: 'Cardio was tough this week but nutrition on point.',
  },
  {
    id: 'wci-3',
    clientName: 'Alex Chen',
    clientId: 'c3',
    date: '2026-04-16',
    status: 'reviewed' as const,
    weight: 92.0,
    prevWeight: 93.2,
    bodyFat: 18.5,
    measurements: { chest: 110, waist: 90, hips: 102, arms: 42, thighs: 62 },
    photos: ['front', 'side', 'back'],
    mood: 'Okay',
    sleepAvg: 6.5,
    adherence: 75,
    notes: 'Missed two workouts due to travel.',
  },
];

const tabs = [
  { id: 'pending', label: 'Pending Review', count: 2 },
  { id: 'reviewed', label: 'Reviewed' },
  { id: 'all', label: 'All Check-ins' },
];

export default function CheckInsPage() {
  const { data: workoutCheckIns, isLoading } = useCheckIns();
  const [activeTab, setActiveTab] = useState('pending');

  const filtered = mockWeeklyCheckIns.filter((ci) => {
    if (activeTab === 'pending') return ci.status === 'pending';
    if (activeTab === 'reviewed') return ci.status === 'reviewed';
    return true;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">
            Check-ins
            <span className="ml-2 text-heading-3 font-normal text-[var(--color-text-tertiary)] tabular-nums">
              {mockWeeklyCheckIns.filter((ci) => ci.status === 'pending').length} pending
            </span>
          </h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Review client progress photos, measurements, and weekly updates.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Weekly Check-in Cards */}
      <div className="space-y-4">
        {filtered.map((ci) => (
          <Card key={ci.id} className="overflow-hidden hover-limitless">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={ci.clientName} size="lg" />
                  <div>
                    <p className="text-sub-md text-[var(--color-text-primary)]">{ci.clientName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar size={12} className="text-[var(--color-text-tertiary)]" />
                      <span className="text-body-xs text-[var(--color-text-tertiary)]">
                        {new Date(ci.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ci.status === 'pending' ? 'warning' : 'success'} dot>
                    {ci.status === 'pending' ? 'Needs Review' : 'Reviewed'}
                  </Badge>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
                <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Scale size={12} className="text-[var(--color-text-tertiary)]" />
                    <span className="text-body-xs text-[var(--color-text-tertiary)]">Weight</span>
                  </div>
                  <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ci.weight} kg</p>
                  <p className={`text-body-xs tabular-nums ${ci.weight < ci.prevWeight ? 'text-success-600' : 'text-error-500'}`}>
                    {ci.weight < ci.prevWeight ? '' : '+'}{(ci.weight - ci.prevWeight).toFixed(1)} kg
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp size={12} className="text-[var(--color-text-tertiary)]" />
                    <span className="text-body-xs text-[var(--color-text-tertiary)]">Body Fat</span>
                  </div>
                  <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ci.bodyFat}%</p>
                </div>
                <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-body-xs text-[var(--color-text-tertiary)]">Adherence</span>
                  </div>
                  <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ci.adherence}%</p>
                  <ProgressBar value={ci.adherence} size="sm" variant={ci.adherence >= 80 ? 'brand' : 'warning'} className="mt-1" />
                </div>
                <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-body-xs text-[var(--color-text-tertiary)]">Sleep</span>
                  </div>
                  <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ci.sleepAvg}h</p>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">avg/night</p>
                </div>
              </div>

              {/* Progress Photos */}
              <div className="mb-4">
                <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Progress Photos</p>
                <div className="flex gap-2">
                  {ci.photos.map((view) => (
                    <div
                      key={view}
                      className="flex-1 h-28 rounded-lg bg-[var(--color-surface-tertiary)] flex flex-col items-center justify-center gap-1 border border-[var(--color-border-light)]"
                    >
                      <Camera size={18} className="text-[var(--color-text-tertiary)]" />
                      <span className="text-body-xs text-[var(--color-text-tertiary)] capitalize">{view}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Measurements */}
              <div className="mb-4">
                <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Measurements (cm)</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(ci.measurements).map(([key, val]) => (
                    <div key={key} className="rounded-md bg-[var(--color-surface-secondary)] px-2.5 py-1.5">
                      <span className="text-body-xs text-[var(--color-text-tertiary)] capitalize">{key} </span>
                      <span className="text-body-xs font-medium tabular-nums text-[var(--color-text-primary)]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Notes */}
              {ci.notes && (
                <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 mb-4">
                  <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] mb-1">Client notes</p>
                  <p className="text-body-sm text-[var(--color-text-primary)]">{ci.notes}</p>
                </div>
              )}

              {/* Actions */}
              {ci.status === 'pending' && (
                <div className="flex gap-2">
                  <Button variant="primary" size="md" className="flex-1" icon={<MessageSquare size={14} />}>
                    Send Feedback
                  </Button>
                  <Button variant="secondary" size="md">
                    Mark Reviewed
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            icon={ClipboardCheck}
            title={activeTab === 'pending' ? 'All caught up' : 'No check-ins yet'}
            description={activeTab === 'pending' ? 'No pending reviews. Your clients will submit check-ins weekly.' : 'Check-ins will appear here as clients submit them.'}
          />
        )}
      </div>

      {/* Workout Logs Section */}
      {workoutCheckIns && workoutCheckIns.length > 0 && (
        <div>
          <h2 className="text-heading-3 text-[var(--color-text-primary)] mb-4">Recent Workout Logs</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {workoutCheckIns.map((checkIn) => (
              <CheckInCard key={`${checkIn.clientId}-${checkIn.date}`} checkIn={checkIn} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
