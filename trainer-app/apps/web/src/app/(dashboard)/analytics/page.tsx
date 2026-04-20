'use client';

import { useAnalytics } from '@/hooks/use-analytics';
import { ComplianceChart } from '@/components/analytics/compliance-chart';
import { ActivityChart } from '@/components/analytics/activity-chart';
import { ClientStatusChart } from '@/components/analytics/client-status-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-5">
        <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">Analytics</h1>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">Analytics</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComplianceChart data={data?.weeklyCompliance || []} />
        <ActivityChart data={data?.weeklyActivity || []} />
        <ClientStatusChart data={data?.statusDistribution || []} />

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy size={16} className="text-amber-500" />
              Most consistent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topPerformers.map((client, i) => (
                <div key={client.id} className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-bold text-[var(--color-text-tertiary)]">
                    {i + 1}
                  </span>
                  <Avatar name={client.name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{client.name}</p>
                  </div>
                  <Badge variant="success">{client.compliance}%</Badge>
                  {client.currentStreak > 0 && (
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {client.currentStreak}d streak
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
