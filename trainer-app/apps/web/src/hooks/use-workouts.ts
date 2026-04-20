import { useQuery } from '@tanstack/react-query';
import { mockWorkouts, mockLoggedSets, type MockWorkout, type MockLoggedSet } from '@/lib/mock-data';
import { api, USE_API } from '@/lib/api';

export function useClientWorkouts(clientId: string | null) {
  return useQuery({
    queryKey: ['workouts', clientId],
    queryFn: async (): Promise<MockWorkout[]> => {
      if (USE_API) {
        return api.get<MockWorkout[]>(`/api/v1/workouts/plans/${clientId}`);
      }
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
      if (USE_API) {
        return api.get<MockLoggedSet[]>(`/api/v1/workouts/logged-sets?limit=${limit}`);
      }
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
      if (USE_API) {
        return api.get<MockLoggedSet[]>(`/api/v1/workouts/logged-sets/${clientId}`);
      }
      await new Promise((r) => setTimeout(r, 200));
      return mockLoggedSets.filter((s) => s.client_id === clientId);
    },
    enabled: !!clientId,
  });
}
