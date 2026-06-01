'use client';

/**
 * MuscleHeatmap — Web version (Next.js/React)
 * Real anatomical figure (front + back) driven by weekly training volume.
 * Anatomy paths: MIT © Hicham ELABBASSI
 */
import { useState } from 'react';
import { BODY } from './bodyPaths';
import { cn } from '@/lib/utils';

export type MuscleSlug =
  | 'chest' | 'obliques' | 'abs' | 'biceps' | 'triceps' | 'trapezius'
  | 'deltoids' | 'quadriceps' | 'tibialis' | 'calves' | 'forearm'
  | 'adductors' | 'upper-back' | 'lower-back' | 'gluteal' | 'hamstring';

export type BodyView = 'front' | 'back';
export type MuscleVolume = Partial<Record<MuscleSlug, number>>;

const LABELS: Record<string, string> = {
  chest: 'Chest', obliques: 'Obliques', abs: 'Abs', biceps: 'Biceps',
  triceps: 'Triceps', trapezius: 'Traps', deltoids: 'Delts',
  quadriceps: 'Quads', tibialis: 'Tibialis', calves: 'Calves',
  forearm: 'Forearms', adductors: 'Adductors', 'upper-back': 'Upper Back',
  'lower-back': 'Lower Back', gluteal: 'Glutes', hamstring: 'Hamstrings',
};

const REST_FILL = '#1A2540';
const SEPARATOR = '#131B2E';
const BODY_FILL = '#0F172A';
const OUTLINE = '#1E293B';

const SCALE: { max: number; c: string }[] = [
  { max: 5, c: '#1E3A5F' },
  { max: 10, c: '#1D4ED8' },
  { max: 18, c: '#2563EB' },
  { max: Infinity, c: '#3B82F6' },
];

function getColor(sets: number): string {
  if (sets <= 0) return REST_FILL;
  return (SCALE.find((s) => sets <= s.max) ?? SCALE[SCALE.length - 1]).c;
}

interface Props {
  volumes: MuscleVolume;
  className?: string;
  width?: number;
  height?: number;
}

export function AnatomicalHeatmap({ volumes, className, width = 300, height = 580 }: Props) {
  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<MuscleSlug | null>(null);

  const side = (BODY as any)[view];
  if (!side) return null;

  const selectedData = selected ? {
    name: LABELS[selected] || selected,
    sets: volumes[selected] || 0,
  } : null;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* View toggle */}
      <div className="mb-4 flex rounded-lg border border-[var(--color-border)] p-0.5">
        {(['front', 'back'] as const).map((v) => (
          <button
            key={v}
            onClick={() => { setView(v); setSelected(null); }}
            className={cn(
              'rounded-md px-4 py-1.5 text-body-xs font-medium capitalize transition-colors',
              view === v ? 'bg-brand-500 text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {/* SVG Body */}
      <svg
        viewBox={side.viewBox}
        width={width}
        height={height}
        className="select-none"
      >
        {/* Silhouette */}
        <path d={side.outline} fill={BODY_FILL} stroke={OUTLINE} strokeWidth={3} />

        {/* Muscles */}
        {side.muscles.map((m: any) => {
          const fill = getColor(volumes[m.slug as MuscleSlug] ?? 0);
          const isSel = m.slug === selected;
          return m.paths.map((d: string, i: number) => (
            <path
              key={`${m.slug}-${i}`}
              d={d}
              fill={fill}
              stroke={isSel ? '#FFFFFF' : SEPARATOR}
              strokeWidth={isSel ? 4 : 1.4}
              className="cursor-pointer transition-all duration-300"
              style={{ filter: isSel ? 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' : undefined }}
              onClick={() => setSelected(m.slug === selected ? null : m.slug as MuscleSlug)}
              onMouseEnter={(e) => {
                (e.target as SVGPathElement).style.filter = 'drop-shadow(0 0 6px rgba(59,130,246,0.4))';
              }}
              onMouseLeave={(e) => {
                if (m.slug !== selected) {
                  (e.target as SVGPathElement).style.filter = 'none';
                }
              }}
            />
          ));
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-1">
        <span className="text-body-xs text-[var(--color-text-tertiary)]">Rest</span>
        {[REST_FILL, ...SCALE.map((s) => s.c)].map((c, i) => (
          <div key={i} className="h-2.5 w-5 first:rounded-l-sm last:rounded-r-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-body-xs text-[var(--color-text-tertiary)]">High</span>
      </div>

      {/* Selected muscle info */}
      {selectedData && (
        <div className="mt-4 rounded-lg border border-brand-500/30 bg-brand-50/10 dark:bg-brand-900/10 px-4 py-3 text-center animate-fade-in">
          <p className="text-sub-md text-[var(--color-text-primary)]">{selectedData.name}</p>
          <p className="text-heading-2 tabular-nums text-brand-500">{selectedData.sets}</p>
          <p className="text-body-xs text-[var(--color-text-tertiary)]">sets this week</p>
        </div>
      )}
    </div>
  );
}

// Re-export exercise mapping from mobile version
export const EXERCISE_MAP: Record<string, Partial<Record<MuscleSlug, number>>> = {
  Squat: { quadriceps: 1, gluteal: 1, hamstring: 0.5, 'lower-back': 0.5 },
  'Leg Press': { quadriceps: 1, gluteal: 0.5 },
  'Walking Lunge': { quadriceps: 1, gluteal: 1, hamstring: 0.5 },
  'Romanian Deadlift': { hamstring: 1, gluteal: 1, 'lower-back': 0.5 },
  'Calf Raise': { calves: 1, tibialis: 0.25 },
  'Bench Press': { chest: 1, deltoids: 0.5, triceps: 0.5 },
  'Incline Press': { chest: 1, deltoids: 0.75, triceps: 0.5 },
  'Overhead Press': { deltoids: 1, triceps: 0.5, trapezius: 0.5 },
  'Lat Pulldown': { 'upper-back': 1, biceps: 0.5 },
  'Barbell Row': { 'upper-back': 1, biceps: 0.5, trapezius: 0.5 },
  Deadlift: { hamstring: 1, gluteal: 1, 'lower-back': 1, trapezius: 0.5, forearm: 0.5 },
  'Bicep Curl': { biceps: 1, forearm: 0.5 },
  'Tricep Pushdown': { triceps: 1 },
  Crunch: { abs: 1, obliques: 0.5 },
};

export interface LoggedSet { exercise: string; sets: number; }

export function aggregateVolume(log: LoggedSet[]): MuscleVolume {
  const out: MuscleVolume = {};
  for (const { exercise, sets } of log) {
    const map = EXERCISE_MAP[exercise];
    if (!map) continue;
    for (const [m, factor] of Object.entries(map) as [MuscleSlug, number][]) {
      out[m] = (out[m] ?? 0) + sets * factor;
    }
  }
  return out;
}
