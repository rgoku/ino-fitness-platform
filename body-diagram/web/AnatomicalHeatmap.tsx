'use client';

import { useState } from 'react';
import {
  BODY,
  MUSCLE_LABELS,
  MIDNIGHT_ATHLETE,
  getColor,
  type MuscleSlug,
  type BodyView,
  type MuscleVolume,
} from '../core';

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
    <div className={`flex flex-col items-center ${className || ''}`}>
      <div className="mb-4 flex rounded-lg border border-[var(--color-border)] p-0.5">
        {(['front', 'back'] as const).map((v) => (
          <button
            key={v}
            onClick={() => { setView(v); setSelected(null); }}
            className={`rounded-md px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
              view === v ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
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
        <span className="text-xs text-gray-500">Rest</span>
        {[theme.restFill, ...theme.scale.map((s) => s.color)].map((c, i) => (
          <div key={i} className="h-2.5 w-5 first:rounded-l-sm last:rounded-r-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs text-gray-500">High</span>
      </div>

      {selectedData && (
        <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-900/10 px-4 py-3 text-center">
          <p className="text-sm font-medium text-gray-200">{selectedData.name}</p>
          <p className="text-2xl font-bold tabular-nums text-blue-500">{selectedData.sets}</p>
          <p className="text-xs text-gray-500">sets this week</p>
        </div>
      )}
    </div>
  );
}
