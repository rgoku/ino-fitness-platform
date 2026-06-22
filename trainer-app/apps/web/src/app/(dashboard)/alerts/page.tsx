'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingDown,
  Activity,
  Calendar,
  Utensils,
  Moon,
  HeartPulse,
  Loader2,
} from 'lucide-react';
import { useAlerts, type CoachAlert, type AlertType, type AlertSeverity } from '@/hooks/use-alerts';
import { cn } from '@/lib/utils';

const TYPE_META: Record<AlertType, { Icon: typeof TrendingDown; label: string }> = {
  weight_stall:      { Icon: TrendingDown, label: 'Weight plateau' },
  low_adherence:     { Icon: Activity,     label: 'Low adherence' },
  skipped_workouts:  { Icon: Calendar,     label: 'Skipped workouts' },
  nutrition_miss:    { Icon: Utensils,     label: 'Nutrition off-target' },
  sleep_decline:     { Icon: Moon,         label: 'Sleep decline' },
  recovery_decline:  { Icon: HeartPulse,   label: 'Recovery decline' },
};

const SEVERITY_META: Record<AlertSeverity, { Icon: typeof AlertCircle; tone: string; chip: string }> = {
  critical: {
    Icon: AlertCircle,
    tone: 'text-red-400',
    chip: 'bg-red-500/12 text-red-300 border-red-500/30',
  },
  warn: {
    Icon: AlertTriangle,
    tone: 'text-amber-400',
    chip: 'bg-amber-500/12 text-amber-300 border-amber-500/30',
  },
  info: {
    Icon: Info,
    tone: 'text-sky-400',
    chip: 'bg-sky-500/12 text-sky-300 border-sky-500/30',
  },
};

type FilterTab = 'all' | AlertSeverity;

export default function AlertsPage() {
  const { data: alerts = [], isLoading } = useAlerts();
  const [tab, setTab] = useState<FilterTab>('all');

  const counts = useMemo(() => {
    const c = { critical: 0, warn: 0, info: 0 };
    for (const a of alerts) c[a.severity]++;
    return { ...c, total: alerts.length };
  }, [alerts]);

  const filtered = useMemo(
    () => (tab === 'all' ? alerts : alerts.filter((a) => a.severity === tab)),
    [alerts, tab]
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <header>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">AI Alerts</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Risk signals across your roster — weight stalls, low adherence, missed sessions, nutrition drift.
          Updated every minute.
        </p>
      </header>

      {/* Severity tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <TabPill active={tab === 'all'} onClick={() => setTab('all')}>
          All <span className="ml-1 opacity-60">{counts.total}</span>
        </TabPill>
        <TabPill
          active={tab === 'critical'}
          onClick={() => setTab('critical')}
          accent="red"
        >
          Critical <span className="ml-1 opacity-60">{counts.critical}</span>
        </TabPill>
        <TabPill
          active={tab === 'warn'}
          onClick={() => setTab('warn')}
          accent="amber"
        >
          Warning <span className="ml-1 opacity-60">{counts.warn}</span>
        </TabPill>
        <TabPill active={tab === 'info'} onClick={() => setTab('info')} accent="sky">
          Info <span className="ml-1 opacity-60">{counts.info}</span>
        </TabPill>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Pieces ────────────────────────────────────────────────────────────────

function TabPill({
  children,
  active,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  accent?: 'red' | 'amber' | 'sky';
}) {
  const accentRing =
    active && accent === 'red'
      ? 'border-red-500/60 text-red-300 bg-red-500/10'
      : active && accent === 'amber'
      ? 'border-amber-500/60 text-amber-300 bg-amber-500/10'
      : active && accent === 'sky'
      ? 'border-sky-500/60 text-sky-300 bg-sky-500/10'
      : active
      ? 'border-brand-500/60 text-brand-300 bg-brand-500/10'
      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]';

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg border px-4 py-2 text-body-sm font-medium transition-colors',
        accentRing,
      )}
    >
      {children}
    </button>
  );
}

function AlertCard({ alert }: { alert: CoachAlert }) {
  const typeMeta = TYPE_META[alert.type] ?? TYPE_META.low_adherence;
  const sev = SEVERITY_META[alert.severity];
  const { Icon: TypeIcon } = typeMeta;
  const { Icon: SevIcon, tone, chip } = sev;

  return (
    <li>
      <Link
        href={`/clients/${alert.client_id}`}
        className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-border-strong)] hover:-translate-y-0.5"
      >
        <div className="flex items-start gap-4">
          <div className={cn('mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border', chip)}>
            <SevIcon size={18} className={tone} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body-md font-semibold text-[var(--color-text-primary)]">
                {alert.title}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 py-0.5 text-body-xs font-medium text-[var(--color-text-secondary)]">
                <TypeIcon size={11} />
                {typeMeta.label}
              </span>
            </div>
            <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
              {alert.message}
            </p>
            <p className="mt-2 text-body-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              {alert.client_name}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

function EmptyState({ tab }: { tab: FilterTab }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <p className="text-body-md font-semibold text-[var(--color-text-primary)]">
        All clear
      </p>
      <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">
        {tab === 'all'
          ? 'No risk signals across your roster.'
          : `No ${tab} alerts right now.`}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16">
      <Loader2 size={20} className="animate-spin text-[var(--color-text-tertiary)]" />
    </div>
  );
}
