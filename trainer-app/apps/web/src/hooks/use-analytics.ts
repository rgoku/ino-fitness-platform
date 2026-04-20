import { useQuery } from '@tanstack/react-query';
import { mockClients, mockWeeklyCompliance, mockWeeklyActivity } from '@/lib/mock-data';
import { api, USE_API } from '@/lib/api';

interface AnalyticsData {
  weeklyCompliance: typeof mockWeeklyCompliance;
  weeklyActivity: typeof mockWeeklyActivity;
  statusDistribution: { name: string; value: number; color: string }[];
  topPerformers: { id: string; name: string; compliance: number; status: string; currentStreak: number }[];
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      if (USE_API) {
        // Derive analytics from the real clients endpoint
        const clients = await api.get<
          { id: string; name: string; status: string; compliance: number; currentStreak: number }[]
        >('/api/v1/coaching/clients');

        const statusDistribution = [
          { name: 'Active', value: clients.filter((c) => c.status === 'active').length, color: '#10b981' },
          { name: 'At Risk', value: clients.filter((c) => c.status === 'at-risk').length, color: '#f59e0b' },
          { name: 'Inactive', value: clients.filter((c) => c.status === 'inactive').length, color: '#ef4444' },
        ];

        // Attempt to fetch weekly data from analytics endpoint; fall back to static shape
        let weeklyCompliance = mockWeeklyCompliance;
        let weeklyActivity = mockWeeklyActivity;
        try {
          const analytics = await api.get<{
            weekly_compliance?: typeof mockWeeklyCompliance;
            weekly_activity?: typeof mockWeeklyActivity;
          }>('/api/v1/coaching/analytics');
          if (analytics.weekly_compliance) weeklyCompliance = analytics.weekly_compliance;
          if (analytics.weekly_activity) weeklyActivity = analytics.weekly_activity;
        } catch {
          // Analytics endpoint may not exist yet — use mock weekly data alongside real client data
        }

        return {
          weeklyCompliance,
          weeklyActivity,
          statusDistribution,
          topPerformers: clients
            .filter((c) => c.status === 'active')
            .sort((a, b) => b.compliance - a.compliance)
            .slice(0, 5),
        };
      }

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
