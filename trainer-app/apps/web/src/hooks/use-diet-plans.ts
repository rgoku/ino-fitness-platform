import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDietPlans, type MockDietPlan } from '@/lib/mock-data';
import { generateMockPlan, type GeneratePlanInput } from '@/lib/mock-generation';

export function useDietPlans() {
  return useQuery({
    queryKey: ['diet-plans'],
    queryFn: async (): Promise<MockDietPlan[]> => {
      await new Promise((r) => setTimeout(r, 300));
      return mockDietPlans;
    },
  });
}

export function useDietPlan(planId: string | null) {
  return useQuery({
    queryKey: ['diet-plans', planId],
    queryFn: async (): Promise<MockDietPlan | null> => {
      await new Promise((r) => setTimeout(r, 200));
      return mockDietPlans.find((p) => p.id === planId) ?? null;
    },
    enabled: !!planId,
  });
}

export function useGenerateDietPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GeneratePlanInput): Promise<MockDietPlan> => {
      // Simulate multi-second AI generation
      await new Promise((r) => setTimeout(r, 4500));
      return generateMockPlan(input);
    },
    onSuccess: (newPlan) => {
      mockDietPlans.push(newPlan);
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
    },
  });
}

export function useUpdateDietPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updated: MockDietPlan) => {
      await new Promise((r) => setTimeout(r, 300));
      const idx = mockDietPlans.findIndex((p) => p.id === updated.id);
      if (idx !== -1) mockDietPlans[idx] = updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
    },
  });
}

export function useDeleteDietPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      await new Promise((r) => setTimeout(r, 300));
      const idx = mockDietPlans.findIndex((p) => p.id === planId);
      if (idx !== -1) mockDietPlans.splice(idx, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
    },
  });
}
