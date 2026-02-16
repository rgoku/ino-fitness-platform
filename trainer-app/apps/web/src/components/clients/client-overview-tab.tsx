'use client';

import { Dumbbell, Flame, Target, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MockClient } from '@/lib/mock-data';

interface ClientOverviewTabProps {
  client: MockClient;
}

export function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  const stats = [
    { label: 'Workouts Completed', value: client.workoutsCompleted, icon: Dumbbell, color: 'text-brand-500' },
    { label: 'Workouts Assigned', value: client.workoutsAssigned, icon: Target, color: 'text-blue-500' },
    { label: 'Current Streak', value: `${client.currentStreak}d`, icon: Flame, color: 'text-orange-500' },
    { label: 'Compliance', value: `${client.compliance}%`, icon: Trophy, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon size={18} className={stat.color} />
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)]">{stat.label}</p>
                <p className="text-lg font-bold text-[var(--color-text-primary)]">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {client.flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {client.flags.map((flag, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
