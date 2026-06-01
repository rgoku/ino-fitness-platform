'use client';

/**
 * Web wrapper — imports from the shared body-diagram module.
 * Anatomy paths: MIT © Hicham ELABBASSI
 */
import { useState } from 'react';
import {
  BODY,
  MUSCLE_LABELS,
  MIDNIGHT_ATHLETE,
  getColor,
  type MuscleSlug,
  type BodyView,
  type MuscleVolume,
  type ThemeColors,
} from '../../../../../body-diagram/core';
import { cn } from '@/lib/utils';

export type { MuscleSlug, BodyView, MuscleVolume };

interface Props {
  volumes: MuscleVolume;
  className?: string;
  width?: number;
  height?: number;
}

export function AnatomicalHeatmap({ volumes, className, width = 300, height = 580 }: Props) {
  const [view, setView] = useState<BodyView>('front');
  const [selected, setSelected] = useState<MuscleSlug | null>(null);

  const theme = MIDNIGHT_ATHLETE;
  const side = (BODY as any)[view];
  if (!side) return null;

  const selectedData = selected ? {
    name: MUSCLE_LABELS[selected] || selected,
    sets: volumes[selected] || 0,
  } : null;

  return (
    <div className={cn('flex flex-col items-center', className)}>
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

      <svg viewBox={side.viewBox} width={width} height={height} className="select-none">
        <path d={side.outline} fill={theme.bodyFill} stroke={theme.outline} strokeWidth={3} />
        {side.muscles.map((m: any) => {
          const fill = getColor(volumes[m.slug as MuscleSlug] ?? 0, theme);
          const isSel = m.slug === selected;
          return m.paths.map((d: string, i: number) => (
            <path
              key={`${m.slug}-${i}`}
              d={d}
              fill={fill}
              stroke={isSel ? theme.selectedStroke : theme.separator}
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

      <div className="mt-3 flex items-center gap-1">
        <span className="text-body-xs text-[var(--color-text-tertiary)]">Rest</span>
        {[theme.restFill, ...theme.scale.map((s) => s.color)].map((c, i) => (
          <div key={i} className="h-2.5 w-5 first:rounded-l-sm last:rounded-r-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-body-xs text-[var(--color-text-tertiary)]">High</span>
      </div>

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

export { EXERCISE_MAP, aggregateVolume } from '../../../../../body-diagram/core';
export type { LoggedSet } from '../../../../../body-diagram/core';
