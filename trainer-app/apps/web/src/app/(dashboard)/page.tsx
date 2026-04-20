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
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">
          {getGreeting()},{' '}
          <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Here&apos;s what&apos;s happening with your clients today.
        </p>
      </div>

      {/* AI Insight — Domain Expansion style */}
      <div className="card-domain rounded-xl p-5">
        <div className="relative z-10 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg six-eyes" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.1))' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#glow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-body-xs font-semibold text-gradient">AI Insight</span>
            </div>
            <p className="text-sub-sm text-[var(--color-text-inverse)]">
              3 clients haven&apos;t logged workouts in 4+ days
            </p>
            <p className="mt-0.5 text-body-sm text-[var(--color-text-secondary)]">
              Send a check-in to Sarah M., Jake R., and Emma T. Proactive outreach increases retention 2.3x.
            </p>
            <button className="mt-2 inline-flex items-center gap-1 text-body-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
              View clients
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

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
