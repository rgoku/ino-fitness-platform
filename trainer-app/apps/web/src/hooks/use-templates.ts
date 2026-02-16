import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mockTemplates,
  mockTemplateExercises,
  type MockTemplate,
} from '@/lib/mock-data';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async (): Promise<MockTemplate[]> => {
      await new Promise((r) => setTimeout(r, 300));
      return mockTemplates;
    },
  });
}

export function useTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ['templates', templateId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const template = mockTemplates.find((t) => t.id === templateId);
      const exercises = mockTemplateExercises
        .filter((e) => e.template_id === templateId)
        .sort((a, b) => a.order_index - b.order_index);
      return template ? { ...template, exercises } : null;
    },
    enabled: !!templateId,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string; weeks: number; days_per_week: number }) => {
      await new Promise((r) => setTimeout(r, 500));
      const newTemplate: MockTemplate = {
        id: `t${Date.now()}`,
        trainer_id: 'coach-1',
        name: data.name,
        description: data.description,
        weeks: data.weeks,
        days_per_week: data.days_per_week,
        exercise_count: 0,
        is_public: false,
        created_at: new Date().toISOString(),
      };
      mockTemplates.push(newTemplate);
      return newTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      await new Promise((r) => setTimeout(r, 300));
      const idx = mockTemplates.findIndex((t) => t.id === templateId);
      if (idx !== -1) mockTemplates.splice(idx, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
