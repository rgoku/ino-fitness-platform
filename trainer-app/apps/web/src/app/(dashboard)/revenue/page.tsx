'use client';

import {
  DollarSign, TrendingUp, Users, CreditCard,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  { label: 'MRR', value: '$4,970', trend: '+12%', direction: 'up' as const, icon: DollarSign, color: 'bg-success-50 text-success-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
  { label: 'Active Subscribers', value: '23', trend: '+3', direction: 'up' as const, icon: Users, color: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' },
  { label: 'Avg Client LTV', value: '$1,440', trend: '+8%', direction: 'up' as const, icon: TrendingUp, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  { label: 'Churn Rate', value: '4.2%', trend: '-1.1%', direction: 'down' as const, icon: CreditCard, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
];

const recentPayments = [
  { client: 'James W.', amount: '$249', date: 'Apr 18', plan: 'Pro', status: 'paid' },
  { client: 'Maria S.', amount: '$249', date: 'Apr 17', plan: 'Pro', status: 'paid' },
  { client: 'Sophie T.', amount: '$129', date: 'Apr 15', plan: 'Starter', status: 'paid' },
  { client: 'Emma D.', amount: '$249', date: 'Apr 14', plan: 'Pro', status: 'paid' },
  { client: 'Ryan Park', amount: '$129', date: 'Apr 12', plan: 'Starter', status: 'paid' },
  { client: 'Alex Chen', amount: '$249', date: 'Apr 10', plan: 'Pro', status: 'failed' },
];

const monthlyRevenue = [
  { month: 'Nov', value: 3200 },
  { month: 'Dec', value: 3600 },
  { month: 'Jan', value: 3800 },
  { month: 'Feb', value: 4100 },
  { month: 'Mar', value: 4450 },
  { month: 'Apr', value: 4970 },
];

const maxRev = Math.max(...monthlyRevenue.map((m) => m.value));

export default function RevenuePage() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Revenue</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Track your coaching business performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover-limitless">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-body-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">{stat.label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <p className="text-heading-2 tabular-nums text-[var(--color-text-primary)]">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {stat.direction === 'up' ? (
                  <ArrowUpRight size={14} className="text-success-500" />
                ) : (
                  <ArrowDownRight size={14} className="text-success-500" />
                )}
                <span className="text-body-xs font-medium text-success-600 dark:text-emerald-400">{stat.trend}</span>
                <span className="text-body-xs text-[var(--color-text-tertiary)]">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Revenue Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-body-xs tabular-nums text-[var(--color-text-secondary)]">
                    ${(m.value / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full rounded-t-md bg-brand-500/80 hover:bg-brand-500 transition-colors"
                    style={{ height: `${(m.value / maxRev) * 140}px` }}
                  />
                  <span className="text-body-xs text-[var(--color-text-tertiary)]">{m.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { plan: 'Pro ($249)', count: 15, pct: 65, color: 'bg-brand-500' },
              { plan: 'Starter ($129)', count: 6, pct: 26, color: 'bg-blue-500' },
              { plan: 'Scale ($399)', count: 2, pct: 9, color: 'bg-purple-500' },
            ].map((p) => (
              <div key={p.plan}>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-[var(--color-text-primary)]">{p.plan}</span>
                  <span className="text-[var(--color-text-secondary)] tabular-nums">{p.count} clients</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-surface-tertiary)]">
                  <div className={`h-full rounded-full ${p.color} transition-all`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-[var(--color-border-light)]">
              <div className="flex justify-between text-body-sm">
                <span className="text-[var(--color-text-tertiary)]">Projected Annual</span>
                <span className="text-sub-md tabular-nums text-[var(--color-text-primary)]">$59,640</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Client</th>
                  <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Amount</th>
                  <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Plan</th>
                  <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, i) => (
                  <tr key={i} className="border-t border-[var(--color-border-light)]">
                    <td className="py-3 text-sub-sm text-[var(--color-text-primary)]">{p.client}</td>
                    <td className="py-3 tabular-nums text-[var(--color-text-primary)] font-medium">{p.amount}</td>
                    <td className="py-3"><Badge variant="brand">{p.plan}</Badge></td>
                    <td className="py-3 text-[var(--color-text-tertiary)]">{p.date}</td>
                    <td className="py-3">
                      <Badge variant={p.status === 'paid' ? 'success' : 'danger'} dot>
                        {p.status === 'paid' ? 'Paid' : 'Failed'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
