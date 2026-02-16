import { useQuery } from '@tanstack/react-query';
import { mockClients } from '@/lib/mock-data';

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
