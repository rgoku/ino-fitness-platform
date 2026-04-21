'use client';

import { useState } from 'react';
import { Plus, Droplet, Moon, Footprints, Apple, Smile, Check, Flame, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

const HABITS = [
  { id: 'h1', name: 'Drink 3L water', icon: Droplet, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', target: 7, completed: 6, streak: 12 },
  { id: 'h2', name: '8k+ steps', icon: Footprints, color: 'text-brand-500 bg-brand-50 dark:bg-brand-900/20', target: 7, completed: 7, streak: 22 },
  { id: 'h3', name: '7h+ sleep', icon: Moon, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', target: 7, completed: 5, streak: 4 },
  { id: 'h4', name: 'Hit protein target', icon: Apple, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20', target: 7, completed: 6, streak: 9 },
  { id: 'h5', name: 'Gratitude journal', icon: Smile, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', target: 7, completed: 3, streak: 2 },
];

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HabitsPage() {
  const [completed, setCompleted] = useState<Record<string, boolean[]>>(() => ({
    h1: [true, true, true, true, true, true, false],
    h2: [true, true, true, true, true, true, true],
    h3: [true, false, true, true, false, true, false],
    h4: [true, true, true, false, true, true, false],
    h5: [false, true, true, false, false, false, false],
  }));

  const toggle = (habitId: string, day: number) => {
    setCompleted((prev) => ({
      ...prev,
      [habitId]: prev[habitId].map((v, i) => (i === day ? !v : v)),
    }));
  };

  const totalHabits = HABITS.length * 7;
  const totalDone = Object.values(completed).flat().filter(Boolean).length;
  const completionRate = Math.round((totalDone / totalHabits) * 100);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Habits</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Track daily habits across all clients. Drives daily engagement even on rest days.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={14} />}>Add Habit</Button>
      </div>

      {/* Weekly summary */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-body-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">This Week</p>
              <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">
                {totalDone}/{totalHabits} <span className="text-body-md text-[var(--color-text-tertiary)]">habits completed</span>
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <Flame size={14} className={completionRate >= 80 ? 'text-orange-500' : 'text-[var(--color-text-tertiary)]'} />
                <span className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">{completionRate}%</span>
              </div>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">completion rate</p>
            </div>
          </div>
          <ProgressBar value={completionRate} variant={completionRate >= 80 ? 'brand' : completionRate >= 50 ? 'warning' : 'error'} />
        </CardContent>
      </Card>

      {/* Habit grid */}
      <Card>
        <CardContent className="p-5">
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center pb-3 border-b border-[var(--color-border-light)]">
              <span className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Habit</span>
              <div className="flex gap-1">
                {WEEKDAYS.map((d, i) => (
                  <span key={i} className="w-8 text-center text-body-xs text-[var(--color-text-tertiary)]">{d}</span>
                ))}
              </div>
              <span className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider w-20 text-right">Streak</span>
            </div>

            {/* Rows */}
            {HABITS.map((h) => {
              const weekDone = completed[h.id] || [];
              return (
                <div key={h.id} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${h.color}`}>
                      <h.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sub-sm text-[var(--color-text-primary)]">{h.name}</p>
                      <p className="text-body-xs text-[var(--color-text-tertiary)]">
                        {weekDone.filter(Boolean).length}/{h.target} days
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {WEEKDAYS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => toggle(h.id, i)}
                        className={cn(
                          'h-8 w-8 rounded-lg border-2 transition-all flex items-center justify-center',
                          weekDone[i]
                            ? 'border-brand-500 bg-brand-500 text-white hover:bg-brand-600'
                            : 'border-[var(--color-border)] hover:border-brand-500/50'
                        )}
                      >
                        {weekDone[i] && <Check size={12} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>

                  <div className="w-20 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Flame size={12} className={h.streak >= 7 ? 'text-orange-500' : 'text-[var(--color-text-tertiary)]'} />
                      <span className="text-sub-sm tabular-nums text-[var(--color-text-primary)]">{h.streak}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Client-level stats */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-brand-500" />
            <h2 className="text-heading-3 text-[var(--color-text-primary)]">Top Habit Trackers</h2>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Emma D.', habits: 5, streak: 22, rate: 97 },
              { name: 'Hannah L.', habits: 4, streak: 18, rate: 92 },
              { name: 'James W.', habits: 3, streak: 12, rate: 86 },
              { name: 'Sophie T.', habits: 5, streak: 15, rate: 84 },
            ].map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 rounded-lg bg-[var(--color-surface-secondary)] p-3">
                <span className="w-6 text-body-xs tabular-nums text-[var(--color-text-tertiary)]">{i + 1}.</span>
                <p className="flex-1 text-sub-sm text-[var(--color-text-primary)]">{c.name}</p>
                <Badge variant="default">{c.habits} habits</Badge>
                <div className="flex items-center gap-1">
                  <Flame size={11} className="text-orange-500" />
                  <span className="text-body-xs tabular-nums">{c.streak}d</span>
                </div>
                <Badge variant="success">{c.rate}%</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
