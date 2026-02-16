import { useQuery } from '@tanstack/react-query';
import { mockClients, mockWeeklyCompliance, mockWeeklyActivity } from '@/lib/mock-data';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));

      const statusDistribution = [
        { name: 'Active', value: mockClients.filter((c) => c.status === 'active').length, color: '#10b981' },
        { name: 'At Risk', value: mockClients.filter((c) => c.status === 'at-risk').length, color: '#f59e0b' },
        { name: 'Inactive', value: mockClients.filter((c) => c.status === 'inactive').length, color: '#ef4444' },
      ];

      return {
        weeklyCompliance: mockWeeklyCompliance,
        weeklyActivity: mockWeeklyActivity,
        statusDistribution,
        topPerformers: mockClients
          .filter((c) => c.status === 'active')
          .sort((a, b) => b.compliance - a.compliance)
          .slice(0, 5),
      };
    },
  });
}
