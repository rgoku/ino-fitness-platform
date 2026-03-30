'use client';

import { StatsGrid } from '@/components/dashboard/stats-grid';
import { AttentionQueue } from '@/components/dashboard/attention-queue';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { AIInsight } from '@/components/ui/ai-insight';
import { useAuthStore } from '@/stores/auth-store';

function getGreeting(): { en: string; jp: string } {
  const h = new Date().getHours();
  if (h < 12) return { en: 'Good morning', jp: 'おはようございます' };
  if (h < 18) return { en: 'Good afternoon', jp: 'こんにちは' };
  return { en: 'Good evening', jp: 'こんばんは' };
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] || 'Coach';
  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-body-xs font-jp text-[var(--color-text-tertiary)] tracking-wider mb-1">{greeting.jp}</p>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">
          {greeting.en}, {firstName}
        </h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Here&apos;s what&apos;s happening with your clients today.
        </p>
      </div>

      {/* AI Insight */}
      <AIInsight
        type="suggestion"
        title="3 clients haven't logged workouts in 4+ days"
        description="Consider sending a check-in message to Sarah M., Jake R., and Emma T. Clients who receive proactive outreach are 2.3x more likely to stay on track."
        action={{ label: 'View clients', onClick: () => {} }}
      />

      {/* Stats */}
      <StatsGrid />

      {/* Main Grid */}
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
