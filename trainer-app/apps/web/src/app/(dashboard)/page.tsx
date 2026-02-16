'use client';

import { StatsGrid } from '@/components/dashboard/stats-grid';
import { AttentionQueue } from '@/components/dashboard/attention-queue';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Welcome back. Here&apos;s your coaching overview.
        </p>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AttentionQueue />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
