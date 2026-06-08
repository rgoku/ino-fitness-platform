'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  TrendingUp,
  UserPlus,
  Activity,
  UserMinus,
  Watch,
  Moon,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// --- Mock Data ---

type MemberStatus = 'active' | 'inactive' | 'paused';
type PlanType = 'Premium' | 'Standard' | 'Basic' | 'Trial';
type Wearable = 'oura' | 'whoop' | 'ultrahuman';

interface Member {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  joinDate: string;
  plan: PlanType;
  status: MemberStatus;
  activityLevel: number; // 1-10
  wearables: Wearable[];
}

const MEMBERS: Member[] = [
  { id: '1', name: 'Alex Rivera', email: 'alex@email.com', joinDate: '2025-11-15', plan: 'Premium', status: 'active', activityLevel: 9, wearables: ['whoop', 'oura'] },
  { id: '2', name: 'Sarah Chen', email: 'sarah@email.com', joinDate: '2025-12-01', plan: 'Premium', status: 'active', activityLevel: 8, wearables: ['oura'] },
  { id: '3', name: 'Marcus Johnson', email: 'marcus@email.com', joinDate: '2026-01-10', plan: 'Standard', status: 'active', activityLevel: 7, wearables: ['whoop'] },
  { id: '4', name: 'Emma Wilson', email: 'emma@email.com', joinDate: '2026-02-14', plan: 'Standard', status: 'paused', activityLevel: 4, wearables: [] },
  { id: '5', name: 'David Park', email: 'david@email.com', joinDate: '2026-03-01', plan: 'Basic', status: 'active', activityLevel: 6, wearables: ['ultrahuman'] },
  { id: '6', name: 'Lisa Thompson', email: 'lisa@email.com', joinDate: '2026-03-20', plan: 'Premium', status: 'active', activityLevel: 9, wearables: ['oura', 'whoop'] },
  { id: '7', name: 'James Lee', email: 'james@email.com', joinDate: '2026-04-05', plan: 'Trial', status: 'active', activityLevel: 5, wearables: [] },
  { id: '8', name: 'Olivia Martinez', email: 'olivia@email.com', joinDate: '2026-04-12', plan: 'Standard', status: 'active', activityLevel: 7, wearables: ['ultrahuman'] },
  { id: '9', name: 'Ryan Kim', email: 'ryan@email.com', joinDate: '2026-05-01', plan: 'Basic', status: 'inactive', activityLevel: 2, wearables: [] },
  { id: '10', name: 'Sophia Brown', email: 'sophia@email.com', joinDate: '2026-05-15', plan: 'Premium', status: 'active', activityLevel: 8, wearables: ['whoop', 'oura', 'ultrahuman'] },
  { id: '11', name: 'Nathan Wright', email: 'nathan@email.com', joinDate: '2026-05-22', plan: 'Standard', status: 'active', activityLevel: 6, wearables: ['oura'] },
  { id: '12', name: 'Mia Garcia', email: 'mia@email.com', joinDate: '2026-06-01', plan: 'Trial', status: 'active', activityLevel: 4, wearables: [] },
];

const WEARABLE_INFO: Record<Wearable, { name: string; icon: typeof Watch; color: string }> = {
  oura: { name: 'Oura Ring', icon: Moon, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
  whoop: { name: 'WHOOP', icon: Watch, color: 'bg-black/10 text-gray-800 dark:bg-white/10 dark:text-gray-200' },
  ultrahuman: { name: 'Ultrahuman', icon: Zap, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
};

const STATUS_BADGE: Record<MemberStatus, { variant: 'success' | 'danger' | 'warning'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'danger', label: 'Inactive' },
  paused: { variant: 'warning', label: 'Paused' },
};

const PLAN_BADGE: Record<PlanType, { variant: 'brand' | 'info' | 'default' | 'outline' }> = {
  Premium: { variant: 'brand' },
  Standard: { variant: 'info' },
  Basic: { variant: 'default' },
  Trial: { variant: 'outline' },
};

type SortKey = 'name' | 'joinDate' | 'activityLevel';
type FilterStatus = 'all' | MemberStatus;
type FilterPlan = 'all' | PlanType;

export default function MembersPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [planFilter, setPlanFilter] = useState<FilterPlan>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = MEMBERS.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesPlan = planFilter === 'all' || m.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'joinDate':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        case 'activityLevel':
          return b.activityLevel - a.activityLevel;
        default:
          return 0;
      }
    });

    return result;
  }, [search, statusFilter, planFilter, sortBy]);

  // Stats
  const totalMembers = MEMBERS.length;
  const activeMembers = MEMBERS.filter((m) => m.status === 'active').length;
  const newThisMonth = MEMBERS.filter((m) => {
    const joinDate = new Date(m.joinDate);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;
  const churnRate = ((MEMBERS.filter((m) => m.status === 'inactive').length / totalMembers) * 100).toFixed(1);
  const activePercent = ((activeMembers / totalMembers) * 100).toFixed(0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">
            Members
            <span className="ml-2 text-heading-3 font-normal text-[var(--color-text-tertiary)] tabular-nums">
              {totalMembers}
            </span>
          </h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            All signed-up members and their activity.
          </p>
        </div>
        <Button icon={<UserPlus size={16} />}>
          Add Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
                <Users size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Total Members</p>
                <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/10">
                <UserPlus size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-body-xs text-[var(--color-text-tertiary)]">New This Month</p>
                <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600/10">
                <Activity size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Active Rate</p>
                <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{activePercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600/10">
                <UserMinus size={16} className="text-rose-600" />
              </div>
              <div>
                <p className="text-body-xs text-[var(--color-text-tertiary)]">Churn Rate</p>
                <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{churnRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-3 py-2 text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<ChevronDown size={14} className={cn('transition-transform', showFilters && 'rotate-180')} />}
          >
            Filters
          </Button>
          <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                view === 'grid' ? 'bg-blue-600 text-white' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                view === 'list' ? 'bg-blue-600 text-white' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters (collapsible) */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-body-xs font-medium text-[var(--color-text-tertiary)]">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-xs text-[var(--color-text-primary)]"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          {/* Plan filter */}
          <div className="space-y-1">
            <label className="text-body-xs font-medium text-[var(--color-text-tertiary)]">Plan</label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as FilterPlan)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-xs text-[var(--color-text-primary)]"
            >
              <option value="all">All Plans</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
              <option value="Basic">Basic</option>
              <option value="Trial">Trial</option>
            </select>
          </div>
          {/* Sort */}
          <div className="space-y-1">
            <label className="text-body-xs font-medium text-[var(--color-text-tertiary)]">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-xs text-[var(--color-text-primary)]"
            >
              <option value="name">Name</option>
              <option value="joinDate">Join Date</option>
              <option value="activityLevel">Activity Level</option>
            </select>
          </div>
        </div>
      )}

      {/* Members Grid */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => (
            <Card key={member.id} className="hover:border-[var(--color-text-tertiary)]/30 transition-all cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Avatar name={member.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-body-sm font-medium text-[var(--color-text-primary)] truncate">{member.name}</h3>
                      <Badge variant={STATUS_BADGE[member.status].variant} dot>
                        {STATUS_BADGE[member.status].label}
                      </Badge>
                    </div>
                    <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">
                      Joined {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={PLAN_BADGE[member.plan].variant}>{member.plan}</Badge>
                    </div>
                    {/* Wearables */}
                    {member.wearables.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5">
                        {member.wearables.map((w) => {
                          const info = WEARABLE_INFO[w];
                          const Icon = info.icon;
                          return (
                            <span
                              key={w}
                              className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-body-xs', info.color)}
                              title={info.name}
                            >
                              <Icon size={10} />
                              {info.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List view */
        <Card>
          <div className="divide-y divide-[var(--color-border)]">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
              <div className="col-span-4">Member</div>
              <div className="col-span-2">Plan</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-2">Wearables</div>
            </div>
            {filtered.map((member) => (
              <div key={member.id} className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer">
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-[var(--color-text-primary)] truncate">{member.name}</p>
                    <p className="text-body-xs text-[var(--color-text-tertiary)] truncate">{member.email}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <Badge variant={PLAN_BADGE[member.plan].variant}>{member.plan}</Badge>
                </div>
                <div className="col-span-2">
                  <Badge variant={STATUS_BADGE[member.status].variant} dot>
                    {STATUS_BADGE[member.status].label}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-body-xs tabular-nums text-[var(--color-text-secondary)]">
                    {new Date(member.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="col-span-2 flex gap-1">
                  {member.wearables.map((w) => {
                    const info = WEARABLE_INFO[w];
                    const Icon = info.icon;
                    return (
                      <span
                        key={w}
                        className={cn('inline-flex items-center rounded-md p-1', info.color)}
                        title={info.name}
                      >
                        <Icon size={12} />
                      </span>
                    );
                  })}
                  {member.wearables.length === 0 && (
                    <span className="text-body-xs text-[var(--color-text-tertiary)]">None</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={40} className="text-[var(--color-text-tertiary)] mb-3" />
          <p className="text-sub-md text-[var(--color-text-primary)]">No members found</p>
          <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
