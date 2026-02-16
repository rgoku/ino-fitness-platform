'use client';

import { Trophy, Award, Flame, Dumbbell, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

// Mock trophies for the client view
const mockClientTrophies = [
  { id: 'ct1', title: 'First Workout', description: 'Completed first workout session', icon: Dumbbell, awardedAt: '2025-09-16T00:00:00Z' },
  { id: 'ct2', title: '7-Day Streak', description: 'Trained 7 days in a row', icon: Flame, awardedAt: '2025-09-23T00:00:00Z' },
  { id: 'ct3', title: 'Consistency King', description: 'Maintained 90%+ compliance for a month', icon: Target, awardedAt: '2025-10-15T00:00:00Z' },
  { id: 'ct4', title: 'PR Crusher', description: 'Set 5 personal records', icon: Award, awardedAt: '2025-11-01T00:00:00Z' },
];

interface ClientTrophiesTabProps {
  clientId: string;
}

export function ClientTrophiesTab({ clientId }: ClientTrophiesTabProps) {
  // In production, this would use a hook like useClientTrophies(clientId)
  const trophies = clientId === 'c8' ? [] : mockClientTrophies;

  if (trophies.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No trophies yet"
        description="Trophies are awarded for milestones and achievements."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {trophies.map((trophy) => (
        <Card key={trophy.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <trophy.icon size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">{trophy.title}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{trophy.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
