import { useQuery } from '@tanstack/react-query';
import { mockWorkouts, mockLoggedSets, type MockWorkout, type MockLoggedSet } from '@/lib/mock-data';

export function useClientWorkouts(clientId: string | null) {
  return useQuery({
    queryKey: ['workouts', clientId],
    queryFn: async (): Promise<MockWorkout[]> => {
      await new Promise((r) => setTimeout(r, 250));
      return mockWorkouts.filter((w) => w.client_id === clientId);
    },
    enabled: !!clientId,
  });
}

export function useRecentLoggedSets(limit: number = 10) {
  return useQuery({
    queryKey: ['logged-sets', 'recent', limit],
    queryFn: async (): Promise<MockLoggedSet[]> => {
      await new Promise((r) => setTimeout(r, 200));
      return mockLoggedSets
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
        .slice(0, limit);
    },
  });
}

export function useClientLoggedSets(clientId: string | null) {
  return useQuery({
    queryKey: ['logged-sets', clientId],
    queryFn: async (): Promise<MockLoggedSet[]> => {
      await new Promise((r) => setTimeout(r, 200));
      return mockLoggedSets.filter((s) => s.client_id === clientId);
    },
    enabled: !!clientId,
  });
}
