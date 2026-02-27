'use client';

import { StatsGrid } from '@/components/dashboard/stats-grid';
import { AttentionQueue } from '@/components/dashboard/attention-queue';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { useAuthStore } from '@/stores/auth-store';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] || 'Coach';

  return (
    <>
      <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
        {getGreeting()}, {firstName}
      </h1>
      <div className="mt-6 space-y-5">
        <StatsGrid />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AttentionQueue />
          </div>
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>
      </div>
    </>
  );
}
