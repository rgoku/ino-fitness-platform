import { useQuery } from '@tanstack/react-query';
import { mockClients } from '@/lib/mock-data';
import { api, USE_API } from '@/lib/api';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  avgCompliance: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      if (USE_API) {
        // Derive stats from the real clients endpoint
        const clients = await api.get<{ status: string; compliance: number }[]>(
          '/api/v1/coaching/clients'
        );
        const total = clients.length;
        const active = clients.filter((c) => c.status === 'active').length;
        const atRisk = clients.filter((c) => c.status === 'at-risk').length;
        const avg = total > 0
          ? Math.round(clients.reduce((sum, c) => sum + c.compliance, 0) / total)
          : 0;

        return { totalClients: total, activeClients: active, atRiskClients: atRisk, avgCompliance: avg };
      }

      await new Promise((r) => setTimeout(r, 300));

      const total = mockClients.length;
      const active = mockClients.filter((c) => c.status === 'active').length;
      const atRisk = mockClients.filter((c) => c.status === 'at-risk').length;
      const avg = Math.round(
        mockClients.reduce((sum, c) => sum + c.compliance, 0) / total
      );

      return {
        totalClients: total,
        activeClients: active,
        atRiskClients: atRisk,
        avgCompliance: avg,
      };
    },
  });
}
