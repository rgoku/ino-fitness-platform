import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockClients, type MockClient } from '@/lib/mock-data';
import { api, USE_API } from '@/lib/api';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async (): Promise<MockClient[]> => {
      if (USE_API) {
        return api.get<MockClient[]>('/api/v1/coaching/clients');
      }
      await new Promise((r) => setTimeout(r, 300));
      return mockClients;
    },
  });
}

export function useClient(clientId: string | null) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: async (): Promise<MockClient | null> => {
      if (USE_API) {
        return api.get<MockClient>(`/api/v1/coaching/clients/${clientId}`);
      }
      await new Promise((r) => setTimeout(r, 200));
      return mockClients.find((c) => c.id === clientId) ?? null;
    },
    enabled: !!clientId,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email?: string }) => {
      if (USE_API) {
        return api.post<MockClient>('/api/v1/coaching/clients', data);
      }
      await new Promise((r) => setTimeout(r, 500));
      const newClient: MockClient = {
        id: `c${Date.now()}`,
        trainer_id: 'coach-1',
        name: data.name,
        email: data.email || '',
        status: 'active',
        compliance: 0,
        lastActive: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        workoutsAssigned: 0,
        workoutsCompleted: 0,
        currentStreak: 0,
        flags: [],
      };
      mockClients.push(newClient);
      return newClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      if (USE_API) {
        return api.delete<void>(`/api/v1/coaching/clients/${clientId}`);
      }
      await new Promise((r) => setTimeout(r, 300));
      const idx = mockClients.findIndex((c) => c.id === clientId);
      if (idx !== -1) mockClients.splice(idx, 1);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
