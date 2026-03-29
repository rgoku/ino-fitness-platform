'use client';

import { Users, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard } from './stat-card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

export function StatsGrid() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        label="Athletes"
        value={data?.totalClients ?? 0}
        icon={Users}
        trend={{ direction: 'up', value: '+2 this mo' }}
        loading={isLoading}
      />
      <StatCard
        label="Active this week"
        value={data?.activeClients ?? 0}
        icon={Activity}
        trend={{ direction: 'up', value: '92%' }}
        iconColor="bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
        loading={isLoading}
      />
      <StatCard
        label="Need attention"
        value={data?.atRiskClients ?? 0}
        icon={AlertTriangle}
        trend={{ direction: 'down', value: '-1' }}
        iconColor="bg-warning-50 text-warning-600 dark:bg-amber-900/20 dark:text-amber-400"
        loading={isLoading}
      />
      <StatCard
        label="Avg consistency"
        value={data ? `${data.avgCompliance}%` : '--'}
        icon={TrendingUp}
        trend={{ direction: 'up', value: '+3%' }}
        iconColor="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        loading={isLoading}
      />
    </div>
  );
}
