'use client';

import { useState, useMemo } from 'react';
import {
  BODY,
  MUSCLE_LABELS,
  EXERCISE_MAP,
  INO_DARK,
  getColor,
  aggregateVolume,
  type MuscleSlug,
  type BodyView,
  type MuscleVolume,
  type LoggedSet,
} from './core';
import {
  generateDigitalTwin,
  getMuscleDetail as getTwinDetail,
  type DigitalTwinReport,
  type MuscleTwinState,
  type GrowthPhase,
  type TrendDirection,
  type WeeklySnapshot,
  type RecoveryStatus,
} from './ml';

/* ── Mock Data ─────────────────────────────────────────────────────── */

const MOCK_LOG: LoggedSet[] = [
  // Push day
  { exercise: 'Bench Press', sets: 4 },
  { exercise: 'Overhead Press', sets: 3 },
  { exercise: 'Lateral Raise', sets: 3 },
  { exercise: 'Tricep Pushdown', sets: 3 },
  { exercise: 'Dip', sets: 3 },
  // Pull day
  { exercise: 'Barbell Row', sets: 4 },
  { exercise: 'Lat Pulldown', sets: 3 },
  { exercise: 'Face Pull', sets: 3 },
  { exercise: 'Bicep Curl', sets: 3 },
  { exercise: 'Hammer Curl', sets: 2 },
  // Leg day
  { exercise: 'Squat', sets: 5 },
  { exercise: 'Romanian Deadlift', sets: 4 },
  { exercise: 'Leg Press', sets: 3 },
  { exercise: 'Leg Curl', sets: 3 },
  { exercise: 'Calf Raise', sets: 4 },
];

const MOCK_LAST_WEEK_LOG: LoggedSet[] = [
  { exercise: 'Bench Press', sets: 3 },
  { exercise: 'Overhead Press', sets: 3 },
  { exercise: 'Lateral Raise', sets: 2 },
  { exercise: 'Tricep Pushdown', sets: 3 },
  { exercise: 'Dip', sets: 2 },
  { exercise: 'Barbell Row', sets: 3 },
  { exercise: 'Lat Pulldown', sets: 3 },
  { exercise: 'Face Pull', sets: 2 },
  { exercise: 'Bicep Curl', sets: 3 },
  { exercise: 'Hammer Curl', sets: 2 },
  { exercise: 'Squat', sets: 4 },
  { exercise: 'Romanian Deadlift', sets: 3 },
  { exercise: 'Leg Press', sets: 3 },
  { exercise: 'Leg Curl', sets: 2 },
  { exercise: 'Calf Raise', sets: 3 },
];

const MOCK_HISTORY: WeeklySnapshot[] = [
  { week: 1, volumes: aggregateVolume(MOCK_LAST_WEEK_LOG), totalSets: MOCK_LAST_WEEK_LOG.reduce((s, l) => s + l.sets, 0) },
  { week: 2, volumes: aggregateVolume(MOCK_LOG), totalSets: MOCK_LOG.reduce((s, l) => s + l.sets, 0) },
];

const HOURS_SINCE_WORKOUT = 18;

/* ── Recovery status colors ───────────────────────────────────────── */

const RECOVERY_COLORS: Record<RecoveryStatus, string> = {
  recovered: '#10B981',
  recovering: '#F59E0B',
  fatigued: '#F97316',
  overtrained: '#EF4444',
};

const RECOVERY_BG: Record<RecoveryStatus, string> = {
  recovered: 'rgba(16,185,129,0.12)',
  recovering: 'rgba(245,158,11,0.12)',
  fatigued: 'rgba(249,115,22,0.12)',
  overtrained: 'rgba(239,68,68,0.12)',
};

/* ── Inline SVG Icons ─────────────────────────────────────────────── */

function IconChevronRight({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconX({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function IconActivity({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function IconTarget({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconScale({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

function IconBrain({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}

function IconTrendUp({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" />
    </svg>
  );
}

function IconTrendDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 17-8.5-8.5-5 5L2 7" /><path d="M16 17h6v-6" />
    </svg>
  );
}

function IconMinus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  );
}

function IconDumbbell({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767-1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l1.767 1.767a2 2 0 1 1 2.829 2.829Z" />
      <path d="m21.5 21.5-1.4-1.4" />
      <path d="M3.9 3.9 2.5 2.5" />
      <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829Z" />
    </svg>
  );
}

function IconClock({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconAlertTriangle({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconZap({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function getExercisesForMuscle(slug: MuscleSlug): { name: string; factor: number }[] {
  const result: { name: string; factor: number }[] = [];
  for (const [exercise, map] of Object.entries(EXERCISE_MAP)) {
    const factor = map[slug];
    if (factor && factor > 0) {
      result.push({ name: exercise, factor });
    }
  }
  return result.sort((a, b) => b.factor - a.factor);
}

/* ── Circular Gauge ───────────────────────────────────────────────── */

function CircularGauge({ value, size = 100, label }: { value: number; size?: number; label: string }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(100, Math.max(0, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={value >= 70 ? '#10B981' : value >= 40 ? '#F59E0B' : '#EF4444'}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-white/30 mt-1.5">{label}</span>
    </div>
  );
}

/* ── Ratio Bar ────────────────────────────────────────────────────── */

function RatioBar({ label, ratio, status }: { label: string; ratio: number; status: string }) {
  const percentage = Math.min(100, Math.max(0, (ratio / 2) * 100));
  const statusColor = status === 'excellent' ? '#10B981' : status === 'good' ? '#34D399' : status === 'needs-work' ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-white/60">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color: statusColor }}>
          {ratio.toFixed(2)}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: statusColor }}
        />
      </div>
    </div>
  );
}

/* ── Tab Type ─────────────────────────────────────────────────────── */

type TabId = 'overview' | 'recovery' | 'symmetry' | 'insights';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <IconActivity size={14} /> },
  { id: 'recovery', label: 'Recovery', icon: <IconClock size={14} /> },
  { id: 'symmetry', label: 'Symmetry', icon: <IconScale size={14} /> },
  { id: 'insights', label: 'Insights', icon: <IconBrain size={14} /> },
];

/* ── Main Component ───────────────────────────────────────────────── */

export default function MuscleTwin() {
  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<MuscleSlug | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleSlug | null>(null);

  const theme = INO_DARK;

  // Compute volumes
  const volumes = useMemo(() => aggregateVolume(MOCK_LOG), []);
  const totalSets = useMemo(() => MOCK_LOG.reduce((s, l) => s + l.sets, 0), []);
  const lastWeekTotalSets = useMemo(() => MOCK_LAST_WEEK_LOG.reduce((s, l) => s + l.sets, 0), []);

  // ── Unified Digital Twin Engine ──
  const twin: DigitalTwinReport = useMemo(
    () => generateDigitalTwin(MOCK_LOG, MOCK_HISTORY, HOURS_SINCE_WORKOUT, 0.8, 0.8),
    []
  );

  // Derived data from twin report
  const topMuscles = useMemo(() => {
    return twin.muscles
      .filter((m) => m.weeklyVolume > 0)
      .slice(0, 5)
      .map((m) => [m.slug, m.weeklyVolume] as [MuscleSlug, number]);
  }, [twin]);

  const readinessScore = Math.round(twin.overallReadiness);
  const weekDelta = totalSets - lastWeekTotalSets;

  // Recovery map for body overlay
  const recoveryMap = useMemo(() => {
    const map: Partial<Record<MuscleSlug, RecoveryStatus>> = {};
    for (const m of twin.muscles) {
      if (m.weeklyVolume > 0) {
        map[m.slug] = m.recoveryStatus;
      }
    }
    return map;
  }, [twin]);

  // Body side data
  const side = (BODY as any)[view];
  if (!side) return null;

  // Selected muscle detail from twin engine
  const selectedDetail = useMemo(() => {
    if (!selected) return null;
    const twinState = getTwinDetail(twin, selected);
    if (!twinState) return null;
    const imb = twin.imbalance.pairs.find(p => p.agonist === selected || p.antagonist === selected);
    const exercises = getExercisesForMuscle(selected);
    return { twinState, imb, exercises };
  }, [selected, twin]);

  // Get recovery color for body overlay in recovery tab
  const getRecoveryFill = (slug: MuscleSlug): string => {
    const status = recoveryMap[slug];
    if (!status) return theme.restFill;
    return RECOVERY_COLORS[status];
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-medium tracking-wider text-white/30 uppercase">Digital Twin</p>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">Body Analysis</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="text-[10px] font-medium text-brand-400">Live</span>
        </div>
      </div>

      {/* Two-panel layout on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Left Panel: Body SVG */}
        <div
          className="rounded-2xl p-5 flex-shrink-0 lg:w-[340px]"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Front/Back toggle */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-xl p-0.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {(['front', 'back'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => { setView(v); setSelected(null); }}
                  className={`px-5 py-1.5 text-xs font-semibold tracking-wide capitalize rounded-lg transition-all duration-300 ${
                    view === v
                      ? 'bg-brand-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Body */}
          <div className="flex justify-center">
            <svg
              viewBox={side.viewBox}
              className="select-none w-full max-w-[280px]"
              style={{ height: 'auto', maxHeight: '420px' }}
            >
              <path
                d={side.outline}
                fill={theme.bodyFill}
                stroke={theme.outline}
                strokeWidth={2}
              />
              {side.muscles.map((m: any) => {
                const slug = m.slug as MuscleSlug;
                const isSelected = slug === selected;
                const isHovered = slug === hoveredMuscle;
                const fill = activeTab === 'recovery'
                  ? getRecoveryFill(slug)
                  : getColor(volumes[slug] ?? 0, theme);

                return m.paths.map((d: string, i: number) => (
                  <path
                    key={`${m.slug}-${i}`}
                    d={d}
                    fill={fill}
                    stroke={isSelected ? theme.selectedStroke : theme.separator}
                    strokeWidth={isSelected ? 3 : 0.8}
                    className="cursor-pointer transition-all duration-300"
                    style={{
                      filter: isSelected
                        ? 'drop-shadow(0 0 10px rgba(16,185,129,0.5))'
                        : isHovered
                          ? 'drop-shadow(0 0 6px rgba(16,185,129,0.35))'
                          : 'none',
                      opacity: isSelected || isHovered ? 1 : 0.85,
                    }}
                    onClick={() => setSelected(slug === selected ? null : slug)}
                    onMouseEnter={() => setHoveredMuscle(slug)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                  />
                ));
              })}
            </svg>
          </div>

          {/* Legend */}
          {activeTab === 'recovery' ? (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {(['recovered', 'recovering', 'fatigued', 'overtrained'] as const).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RECOVERY_COLORS[s] }} />
                  <span className="text-[10px] text-white/40 capitalize">{s}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="text-[10px] text-white/30">Rest</span>
              {[theme.restFill, ...theme.scale.map(s => s.color)].map((c, i) => (
                <div key={i} className="h-2.5 w-5 rounded-sm" style={{ backgroundColor: c, border: '1px solid rgba(255,255,255,0.06)' }} />
              ))}
              <span className="text-[10px] text-white/30">High</span>
            </div>
          )}

          {/* Hovered muscle tooltip */}
          {hoveredMuscle && !selected && (
            <div className="mt-3 text-center">
              <span className="text-xs font-medium text-white/60">
                {MUSCLE_LABELS[hoveredMuscle] ?? hoveredMuscle}
              </span>
              <span className="text-xs text-white/30 ml-2 tabular-nums">
                {Math.round(volumes[hoveredMuscle] ?? 0)} sets
              </span>
            </div>
          )}
        </div>

        {/* Right Panel: Intelligence */}
        <div className="flex-1 min-w-0">

          {/* Selected muscle detail panel (slides over tabs) */}
          {selected && selectedDetail ? (
            <div
              className="rounded-2xl p-5 animate-in"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Close header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-medium tracking-wider text-white/30 uppercase">Muscle Detail</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                    {MUSCLE_LABELS[selected] ?? selected}
                  </h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">This Week</p>
                  <p className="text-xl font-bold text-white tabular-nums mt-1">{Math.round(selectedDetail.twinState.weeklyVolume)}</p>
                  <p className="text-[10px] text-white/30">/ {selectedDetail.twinState.weeklyVolumeTarget} target</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">vs Last Week</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-xl font-bold tabular-nums ${
                      selectedDetail.twinState.weekOverWeekDelta > 0 ? 'text-brand-400' :
                      selectedDetail.twinState.weekOverWeekDelta < 0 ? 'text-red-400' : 'text-white/60'
                    }`}>
                      {selectedDetail.twinState.weekOverWeekDelta > 0 ? '+' : ''}{selectedDetail.twinState.weekOverWeekDelta}%
                    </span>
                    {selectedDetail.twinState.trendDirection === 'accelerating' && <IconTrendUp size={14} />}
                    {selectedDetail.twinState.trendDirection === 'progressing' && <IconTrendUp size={14} />}
                    {selectedDetail.twinState.trendDirection === 'declining' && <IconTrendDown size={14} />}
                    {selectedDetail.twinState.trendDirection === 'stable' && <IconMinus size={14} />}
                  </div>
                  <p className="text-[10px] text-white/30">{selectedDetail.twinState.trendDirection}</p>
                </div>
              </div>

              {/* Growth Phase + Recovery */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Growth Phase</p>
                  <p className={`text-sm font-bold mt-1 capitalize ${
                    selectedDetail.twinState.growthPhase === 'hypertrophy' ? 'text-brand-400' :
                    selectedDetail.twinState.growthPhase === 'peak' ? 'text-blue-400' :
                    selectedDetail.twinState.growthPhase === 'overreaching' ? 'text-yellow-400' :
                    selectedDetail.twinState.growthPhase === 'detraining' ? 'text-red-400' :
                    'text-white/60'
                  }`}>{selectedDetail.twinState.growthPhase}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Rank</p>
                  <p className="text-sm font-bold text-white mt-1 tabular-nums">#{selectedDetail.twinState.rank} <span className="text-[10px] text-white/30 font-normal">/ 16</span></p>
                </div>
              </div>

              {/* Recovery status */}
              <div
                className="rounded-xl p-3 mb-3 flex items-center gap-3"
                style={{ background: RECOVERY_BG[selectedDetail.twinState.recoveryStatus], border: `1px solid ${RECOVERY_COLORS[selectedDetail.twinState.recoveryStatus]}22` }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: RECOVERY_COLORS[selectedDetail.twinState.recoveryStatus] }} />
                <div className="flex-1">
                  <p className="text-xs font-medium capitalize" style={{ color: RECOVERY_COLORS[selectedDetail.twinState.recoveryStatus] }}>
                    {selectedDetail.twinState.recoveryStatus}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {selectedDetail.twinState.hoursUntilRecovered > 0
                      ? `${selectedDetail.twinState.hoursUntilRecovered}h remaining`
                      : 'Fully recovered'}
                  </p>
                </div>
                <span className="text-lg font-bold tabular-nums text-white">{Math.round(selectedDetail.twinState.recoveryReadiness * 100)}%</span>
              </div>

              {/* Imbalance status */}
              {selectedDetail.imb && (
                <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Antagonist Pair</p>
                      <p className="text-xs text-white/60 mt-0.5">
                        {MUSCLE_LABELS[selectedDetail.imb.agonist]} / {MUSCLE_LABELS[selectedDetail.imb.antagonist]}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      selectedDetail.imb.status === 'balanced' ? 'bg-brand-500/20 text-brand-400' :
                      selectedDetail.imb.status === 'mild' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedDetail.imb.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-white/30">Ratio</span>
                    <span className="text-xs font-bold text-white tabular-nums">{selectedDetail.imb.ratio}</span>
                    <span className="text-[10px] text-white/20">/</span>
                    <span className="text-[10px] text-white/30">Ideal {selectedDetail.imb.ideal}</span>
                  </div>
                </div>
              )}

              {/* Top exercises */}
              <div>
                <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-2">Top Exercises</p>
                <div className="space-y-1.5">
                  {selectedDetail.exercises.slice(0, 5).map((ex) => (
                    <div key={ex.name} className="flex items-center gap-2.5 py-1.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <IconDumbbell size={12} />
                      </div>
                      <span className="text-xs text-white/70 flex-1">{ex.name}</span>
                      <span className="text-[10px] text-white/30 tabular-nums">{ex.factor === 1 ? 'Primary' : `${Math.round(ex.factor * 100)}%`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Tab panels */
            <>
              {/* Tab bar */}
              <div className="flex gap-1 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-brand-500/15 text-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'text-white/30 hover:text-white/50'
                    }`}
                    style={activeTab === tab.id ? { border: '1px solid rgba(16,185,129,0.15)' } : { border: '1px solid transparent' }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab
                    topMuscles={topMuscles}
                    readinessScore={readinessScore}
                    totalSets={totalSets}
                    weekDelta={weekDelta}
                    volumes={volumes}
                    overallScore={twin.overallScore}
                  />
                )}
                {activeTab === 'recovery' && (
                  <RecoveryTab twin={twin} />
                )}
                {activeTab === 'symmetry' && (
                  <SymmetryTab twin={twin} />
                )}
                {activeTab === 'insights' && (
                  <InsightsTab twin={twin} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Overview Tab ─────────────────────────────────────────────────── */

function OverviewTab({
  topMuscles,
  readinessScore,
  totalSets,
  weekDelta,
  volumes,
  overallScore,
}: {
  topMuscles: [MuscleSlug, number][];
  readinessScore: number;
  totalSets: number;
  weekDelta: number;
  volumes: MuscleVolume;
  overallScore: number;
}) {
  const maxVol = topMuscles.length > 0 ? topMuscles[0][1] : 1;

  return (
    <div className="space-y-5">
      {/* Quick stats row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <CircularGauge value={readinessScore} size={72} label="Readiness" />
        </div>
        <div className="text-center">
          <CircularGauge value={overallScore} size={72} label="Twin Score" />
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white tabular-nums">{totalSets}</span>
          <span className="text-[10px] text-white/30 mt-0.5">Total Sets</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold tabular-nums ${weekDelta >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
            {weekDelta >= 0 ? '+' : ''}{weekDelta}
          </span>
          <span className="text-[10px] text-white/30 mt-0.5">vs Last Week</span>
        </div>
      </div>

      {/* Top 5 trained muscles */}
      <div>
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Top Trained Muscles</p>
        <div className="space-y-2.5">
          {topMuscles.map(([slug, vol]) => (
            <div key={slug} className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-20 truncate">{MUSCLE_LABELS[slug]}</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(vol / maxVol) * 100}%`,
                    background: `linear-gradient(90deg, #047857, #10B981)`,
                  }}
                />
              </div>
              <span className="text-xs font-bold text-white tabular-nums w-8 text-right">{Math.round(vol)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Muscles trained count */}
      <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
          <IconTarget size={14} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-white/60">Muscles Activated</p>
          <p className="text-sm font-bold text-white tabular-nums">
            {Object.keys(volumes).filter(k => (volumes[k as MuscleSlug] ?? 0) > 0).length} / 16
          </p>
        </div>
        <IconChevronRight size={14} className="text-white/20" />
      </div>
    </div>
  );
}

/* ── Recovery Tab ─────────────────────────────────────────────────── */

function RecoveryTab({ twin }: { twin: DigitalTwinReport }) {
  const activeMuscles = twin.muscles.filter((m) => m.weeklyVolume > 0)
    .sort((a, b) => a.recoveryReadiness - b.recoveryReadiness);
  const readyMuscles = activeMuscles.filter((m) => m.recoveryStatus === 'recovered' || m.recoveryStatus === 'recovering');

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Recovery Status</p>
        <div className="space-y-1.5">
          {activeMuscles.map((m) => (
            <div
              key={m.slug}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: RECOVERY_BG[m.recoveryStatus], border: `1px solid ${RECOVERY_COLORS[m.recoveryStatus]}11` }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: RECOVERY_COLORS[m.recoveryStatus] }} />
              <span className="text-xs text-white/70 flex-1">{m.label}</span>
              <div className="flex items-center gap-2">
                {m.hoursUntilRecovered > 0 && (
                  <span className="text-[10px] text-white/30 tabular-nums flex items-center gap-1">
                    <IconClock size={10} />
                    {m.hoursUntilRecovered}h
                  </span>
                )}
                <span
                  className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full"
                  style={{ color: RECOVERY_COLORS[m.recoveryStatus], background: `${RECOVERY_COLORS[m.recoveryStatus]}15` }}
                >
                  {m.recoveryStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ready to train */}
      {readyMuscles.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Ready to Train</p>
          <div className="flex flex-wrap gap-1.5">
            {readyMuscles.slice(0, 8).map((m) => (
              <span
                key={m.slug}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg text-brand-400"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Symmetry Tab ─────────────────────────────────────────────────── */

function SymmetryTab({ twin }: { twin: DigitalTwinReport }) {
  const { symmetry, imbalance } = twin;

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className="text-center">
        <CircularGauge value={symmetry.overall} size={90} label="Overall Symmetry" />
      </div>

      {/* Ratio bars */}
      <div className="space-y-3">
        {symmetry.details.map((d) => (
          <RatioBar key={d.category} label={d.category} ratio={d.ratio} status={d.status} />
        ))}
      </div>

      {/* Imbalance pairs */}
      <div>
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Muscle Pairs</p>
        <div className="space-y-1.5">
          {imbalance.pairs.map((p) => (
            <div
              key={`${p.agonist}-${p.antagonist}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <span className="text-xs text-white/60 flex-1">
                {MUSCLE_LABELS[p.agonist]} / {MUSCLE_LABELS[p.antagonist]}
              </span>
              <span className="text-[10px] text-white/30 tabular-nums">{p.ratio}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                p.status === 'balanced' ? 'bg-brand-500/20 text-brand-400' :
                p.status === 'mild' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {p.status === 'balanced' && <IconCheck size={10} />}
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {imbalance.recommendations.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Recommendations</p>
          <div className="space-y-1.5">
            {imbalance.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-white/50">
                <IconAlertTriangle size={12} />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Insights Tab ─────────────────────────────────────────────────── */

function InsightsTab({ twin }: { twin: DigitalTwinReport }) {
  const { volumeRecommendations, recommendations, suggestedSplit, muscles } = twin;

  // Derive balance categories from muscle twin states
  const overVolume = muscles.filter((m) => m.growthPhase === 'overreaching' || m.growthPhase === 'peak');
  const underVolume = muscles.filter((m) => m.growthPhase === 'detraining' && m.weeklyVolume === 0);
  const balanced = muscles.filter((m) => m.growthPhase === 'hypertrophy' || (m.growthPhase === 'maintenance' && m.weeklyVolume > 0));

  return (
    <div className="space-y-5">
      {/* AI header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-brand-400" style={{ background: 'rgba(16,185,129,0.1)' }}>
          <IconZap size={14} />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">AI Training Insights</p>
          <p className="text-[10px] text-white/30">Based on your training data</p>
        </div>
      </div>

      {/* Volume recommendations */}
      {volumeRecommendations.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Volume Recommendations</p>
          <div className="space-y-1.5">
            {volumeRecommendations.slice(0, 5).map((rec) => (
              <div
                key={rec.muscle}
                className="rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white/70">{MUSCLE_LABELS[rec.muscle]}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-[10px] text-white/40">{rec.reason}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-white/30">Current: <span className="text-white/60 tabular-nums">{rec.currentSets}</span></span>
                  <span className="text-[10px] text-white/20">→</span>
                  <span className="text-[10px] text-brand-400 tabular-nums font-medium">Target: {rec.recommendedSets}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth phase balance */}
      <div>
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">Growth Phase Balance</p>
        {overVolume.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] text-yellow-400/70 uppercase tracking-wider font-medium mb-1.5">Overreaching / Peak</p>
            <div className="flex flex-wrap gap-1.5">
              {overVolume.map((m) => (
                <span key={m.slug} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400/80">
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        )}
        {underVolume.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] text-red-400/70 uppercase tracking-wider font-medium mb-1.5">Detraining</p>
            <div className="flex flex-wrap gap-1.5">
              {underVolume.map((m) => (
                <span key={m.slug} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-red-500/10 text-red-400/80">
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        )}
        {balanced.length > 0 && (
          <div>
            <p className="text-[10px] text-brand-400/70 uppercase tracking-wider font-medium mb-1.5">Hypertrophy / Active</p>
            <div className="flex flex-wrap gap-1.5">
              {balanced.map((m) => (
                <span key={m.slug} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400/80">
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic AI recommendations */}
      {recommendations.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-3">AI Recommendations</p>
          <div className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="text-brand-400 mt-0.5 flex-shrink-0"><IconAlertTriangle size={12} /></span>
                <span className="text-xs text-white/50 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested split */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.08)' }}>
        <div className="flex items-center gap-2 mb-2">
          <IconBrain size={14} />
          <span className="text-xs font-semibold text-brand-400">Today&apos;s Training Split</span>
        </div>
        <div className="space-y-1">
          {suggestedSplit.map((line, i) => (
            <p key={i} className="text-xs text-white/50 leading-relaxed flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400/50 flex-shrink-0" />
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
