import { useQuery } from '@tanstack/react-query';
import { mockLoggedSets } from '@/lib/mock-data';

export interface CheckInGroup {
  clientId: string;
  clientName: string;
  date: string;
  sets: {
    id: string;
    exercise_name: string;
    reps: number;
    weight?: number;
    completed_at: string;
  }[];
}

export function useCheckIns() {
  return useQuery({
    queryKey: ['check-ins'],
    queryFn: async (): Promise<CheckInGroup[]> => {
      await new Promise((r) => setTimeout(r, 300));

      // Group logged sets by client and date
      const groups = new Map<string, CheckInGroup>();

      for (const set of mockLoggedSets) {
        const date = new Date(set.completed_at).toDateString();
        const key = `${set.client_id}-${date}`;

        if (!groups.has(key)) {
          groups.set(key, {
            clientId: set.client_id,
            clientName: set.client_name,
            date,
            sets: [],
          });
        }

        groups.get(key)!.sets.push({
          id: set.id,
          exercise_name: set.exercise_name,
          reps: set.reps,
          weight: set.weight,
          completed_at: set.completed_at,
        });
      }

      return Array.from(groups.values()).sort(
        (a, b) => new Date(b.sets[0].completed_at).getTime() - new Date(a.sets[0].completed_at).getTime()
      );
    },
  });
}
