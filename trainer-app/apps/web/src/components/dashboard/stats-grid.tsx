'use client';

import { Users, UserCheck, AlertTriangle, Target } from 'lucide-react';
import { StatCard } from './stat-card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

export function StatsGrid() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Clients"
        value={data?.totalClients ?? 0}
        icon={Users}
        trend={{ direction: 'up', value: '+2 this month' }}
        loading={isLoading}
      />
      <StatCard
        label="Active (7d)"
        value={data?.activeClients ?? 0}
        icon={UserCheck}
        trend={{ direction: 'up', value: '92%' }}
        iconColor="bg-emerald-500/10 text-emerald-500"
        loading={isLoading}
      />
      <StatCard
        label="At Risk"
        value={data?.atRiskClients ?? 0}
        icon={AlertTriangle}
        trend={{ direction: 'down', value: '-1' }}
        iconColor="bg-amber-500/10 text-amber-500"
        loading={isLoading}
      />
      <StatCard
        label="Avg Compliance"
        value={data ? `${data.avgCompliance}%` : '0%'}
        icon={Target}
        trend={{ direction: 'up', value: '+3%' }}
        iconColor="bg-blue-500/10 text-blue-500"
        loading={isLoading}
      />
    </div>
  );
}
