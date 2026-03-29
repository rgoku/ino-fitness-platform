'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques' | 'quads' | 'hamstrings' | 'calves'
  | 'glutes' | 'traps' | 'lats' | 'lower_back' | 'upper_back';

export interface MuscleData {
  muscle: MuscleGroup;
  workouts: number;
  label: string;
}

interface MuscleHeatmapProps {
  data: MuscleData[];
  maxWorkouts?: number;
  view?: 'front' | 'back';
  onMuscleClick?: (muscle: MuscleGroup) => void;
  className?: string;
}

// ─── Color Scale ────────────────────────────────────────────────────────────

function getHeatColor(workouts: number, max: number): string {
  if (max === 0 || workouts === 0) return 'var(--muscle-0)';
  const ratio = workouts / max;
  if (ratio <= 0.15) return 'var(--muscle-1)';
  if (ratio <= 0.3)  return 'var(--muscle-2)';
  if (ratio <= 0.5)  return 'var(--muscle-3)';
  if (ratio <= 0.7)  return 'var(--muscle-4)';
  return 'var(--muscle-5)';
}

// ─── SVG Muscle Paths ───────────────────────────────────────────────────────

// Front view paths – simplified anatomical silhouette
const frontMuscles: Record<string, { d: string; muscle: MuscleGroup }[]> = {
  // Head / Neck (non-interactive outline)
  outline: [],
  muscles: [
    // Traps (front)
    { muscle: 'traps', d: 'M85,72 C88,65 95,60 100,58 C105,60 112,65 115,72 L110,78 L90,78 Z' },
    // Left Shoulder
    { muscle: 'shoulders', d: 'M72,78 C68,75 62,78 60,85 C58,92 60,100 64,102 L80,98 L82,82 Z' },
    // Right Shoulder
    { muscle: 'shoulders', d: 'M128,78 C132,75 138,78 140,85 C142,92 140,100 136,102 L120,98 L118,82 Z' },
    // Left Chest
    { muscle: 'chest', d: 'M80,82 L82,98 L100,104 L100,82 C96,78 88,78 80,82 Z' },
    // Right Chest
    { muscle: 'chest', d: 'M120,82 L118,98 L100,104 L100,82 C104,78 112,78 120,82 Z' },
    // Left Bicep
    { muscle: 'biceps', d: 'M60,102 C58,108 56,118 56,128 C56,134 58,138 62,138 L68,136 C70,130 70,118 68,106 L64,102 Z' },
    // Right Bicep
    { muscle: 'biceps', d: 'M140,102 C142,108 144,118 144,128 C144,134 142,138 138,138 L132,136 C130,130 130,118 132,106 L136,102 Z' },
    // Left Forearm
    { muscle: 'forearms', d: 'M56,138 C54,148 52,158 52,168 C52,174 54,178 56,178 L62,176 C64,170 64,158 62,146 L62,138 Z' },
    // Right Forearm
    { muscle: 'forearms', d: 'M144,138 C146,148 148,158 148,168 C148,174 146,178 144,178 L138,176 C136,170 136,158 138,146 L138,138 Z' },
    // Upper Abs
    { muscle: 'abs', d: 'M90,104 L88,120 L100,122 L112,120 L110,104 L100,106 Z' },
    // Lower Abs
    { muscle: 'abs', d: 'M88,120 L86,140 L92,148 L100,150 L108,148 L114,140 L112,120 L100,122 Z' },
    // Left Oblique
    { muscle: 'obliques', d: 'M80,100 L82,98 L88,104 L88,120 L86,140 L80,140 C78,128 76,112 80,100 Z' },
    // Right Oblique
    { muscle: 'obliques', d: 'M120,100 L118,98 L112,104 L112,120 L114,140 L120,140 C122,128 124,112 120,100 Z' },
    // Left Quad
    { muscle: 'quads', d: 'M80,150 C78,152 76,154 78,164 L80,190 C82,204 84,216 86,224 L96,226 L100,226 L100,154 L92,150 Z' },
    // Right Quad
    { muscle: 'quads', d: 'M120,150 C122,152 124,154 122,164 L120,190 C118,204 116,216 114,224 L104,226 L100,226 L100,154 L108,150 Z' },
    // Left Calf (front / tibialis)
    { muscle: 'calves', d: 'M84,232 C82,242 80,258 80,270 C80,280 82,288 86,290 L94,288 C96,280 96,268 94,254 L90,232 Z' },
    // Right Calf (front / tibialis)
    { muscle: 'calves', d: 'M116,232 C118,242 120,258 120,270 C120,280 118,288 114,290 L106,288 C104,280 104,268 106,254 L110,232 Z' },
  ],
};

// Back view paths
const backMuscles: Record<string, { d: string; muscle: MuscleGroup }[]> = {
  outline: [],
  muscles: [
    // Traps (back, larger)
    { muscle: 'traps', d: 'M82,72 C86,66 94,60 100,58 C106,60 114,66 118,72 L116,84 L100,90 L84,84 Z' },
    // Left Rear Delt
    { muscle: 'shoulders', d: 'M72,78 C68,76 62,78 60,86 C58,94 60,100 64,102 L78,98 L80,82 Z' },
    // Right Rear Delt
    { muscle: 'shoulders', d: 'M128,78 C132,76 138,78 140,86 C142,94 140,100 136,102 L122,98 L120,82 Z' },
    // Upper Back
    { muscle: 'upper_back', d: 'M84,84 L100,90 L116,84 L114,100 L100,106 L86,100 Z' },
    // Left Lat
    { muscle: 'lats', d: 'M78,98 L86,100 L88,130 L84,140 L78,138 C76,124 76,110 78,98 Z' },
    // Right Lat
    { muscle: 'lats', d: 'M122,98 L114,100 L112,130 L116,140 L122,138 C124,124 124,110 122,98 Z' },
    // Left Tricep
    { muscle: 'triceps', d: 'M60,102 C58,110 56,120 56,130 C56,136 58,140 62,140 L68,138 C70,130 70,118 68,108 L64,102 Z' },
    // Right Tricep
    { muscle: 'triceps', d: 'M140,102 C142,110 144,120 144,130 C144,136 142,140 138,140 L132,138 C130,130 130,118 132,108 L136,102 Z' },
    // Left Forearm (back)
    { muscle: 'forearms', d: 'M56,140 C54,150 52,160 52,170 C52,176 54,180 56,180 L62,178 C64,172 64,160 62,148 L62,140 Z' },
    // Right Forearm (back)
    { muscle: 'forearms', d: 'M144,140 C146,150 148,160 148,170 C148,176 146,180 144,180 L138,178 C136,172 136,160 138,148 L138,140 Z' },
    // Lower Back / Erectors
    { muscle: 'lower_back', d: 'M88,106 L100,110 L112,106 L114,140 L108,148 L100,150 L92,148 L86,140 Z' },
    // Left Glute
    { muscle: 'glutes', d: 'M80,148 L92,150 L100,154 L100,172 L92,176 L80,172 C78,164 78,156 80,148 Z' },
    // Right Glute
    { muscle: 'glutes', d: 'M120,148 L108,150 L100,154 L100,172 L108,176 L120,172 C122,164 122,156 120,148 Z' },
    // Left Hamstring
    { muscle: 'hamstrings', d: 'M80,174 L92,178 L96,228 L86,228 L80,210 C78,198 78,186 80,174 Z' },
    // Right Hamstring
    { muscle: 'hamstrings', d: 'M120,174 L108,178 L104,228 L114,228 L120,210 C122,198 122,186 120,174 Z' },
    // Left Calf (back / gastrocnemius)
    { muscle: 'calves', d: 'M84,232 C82,240 80,256 80,270 C80,280 82,288 86,290 L94,288 C96,278 96,264 94,250 L90,232 Z' },
    // Right Calf (back / gastrocnemius)
    { muscle: 'calves', d: 'M116,232 C118,240 120,256 120,270 C120,280 118,288 114,290 L106,288 C104,278 104,264 106,250 L110,232 Z' },
  ],
};

// Body outline (non-interactive silhouette)
const bodyOutlineFront = 'M100,8 C92,8 86,14 86,22 C86,30 90,38 92,42 L88,48 C86,52 85,58 85,62 L85,72 C88,65 95,60 100,58 C105,60 112,65 115,72 L115,62 C115,58 114,52 112,48 L108,42 C110,38 114,30 114,22 C114,14 108,8 100,8 Z';
const bodyOutlineBack = bodyOutlineFront;

// Hands (non-interactive)
const leftHand = 'M50,178 C48,182 46,186 46,188 C46,192 50,194 52,190 L56,180 Z';
const rightHand = 'M150,178 C152,182 154,186 154,188 C154,192 150,194 148,190 L144,180 Z';
// Feet
const leftFoot = 'M82,290 L80,300 C80,304 84,306 90,306 L96,304 L94,290 Z';
const rightFoot = 'M118,290 L120,300 C120,304 116,306 110,306 L104,304 L106,290 Z';

// ─── Component ──────────────────────────────────────────────────────────────

export function MuscleHeatmap({
  data,
  maxWorkouts,
  view: initialView = 'front',
  onMuscleClick,
  className,
}: MuscleHeatmapProps) {
  const [view, setView] = useState(initialView);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; muscle: MuscleData } | null>(null);

  const dataMap = new Map(data.map((d) => [d.muscle, d]));
  const max = maxWorkouts ?? Math.max(...data.map((d) => d.workouts), 1);
  const muscles = view === 'front' ? frontMuscles.muscles : backMuscles.muscles;

  const handleMouseEnter = (muscle: MuscleGroup, e: React.MouseEvent) => {
    setHoveredMuscle(muscle);
    const d = dataMap.get(muscle);
    if (d) {
      const rect = (e.target as SVGElement).closest('svg')!.getBoundingClientRect();
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 10,
        muscle: d,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredMuscle(null);
    setTooltip(null);
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* CSS Variables for heat colors */}
      <style>{`
        :root {
          --muscle-0: #E4E4E7;
          --muscle-1: #D1FAE5;
          --muscle-2: #A7F3D0;
          --muscle-3: #6EE7B7;
          --muscle-4: #34D399;
          --muscle-5: #10B981;
        }
        .dark {
          --muscle-0: #27272A;
          --muscle-1: #064E3B;
          --muscle-2: #065F46;
          --muscle-3: #047857;
          --muscle-4: #059669;
          --muscle-5: #10B981;
        }
      `}</style>

      {/* View toggle */}
      <div className="mb-4 flex rounded-lg border border-[var(--color-border)] p-0.5">
        <button
          onClick={() => setView('front')}
          className={cn(
            'rounded-md px-4 py-1.5 text-body-xs font-medium transition-colors',
            view === 'front'
              ? 'bg-brand-500 text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          Front
        </button>
        <button
          onClick={() => setView('back')}
          className={cn(
            'rounded-md px-4 py-1.5 text-body-xs font-medium transition-colors',
            view === 'back'
              ? 'bg-brand-500 text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          Back
        </button>
      </div>

      {/* SVG Body */}
      <div className="relative">
        <svg
          viewBox="0 0 200 314"
          width="280"
          height="440"
          className="select-none"
        >
          {/* Body outline */}
          <path
            d={view === 'front' ? bodyOutlineFront : bodyOutlineBack}
            fill="var(--muscle-0)"
            stroke="var(--color-border)"
            strokeWidth="0.5"
            opacity="0.5"
          />

          {/* Muscle groups */}
          {muscles.map((m, i) => {
            const d = dataMap.get(m.muscle);
            const workouts = d?.workouts ?? 0;
            const color = getHeatColor(workouts, max);
            const isHovered = hoveredMuscle === m.muscle;

            return (
              <path
                key={`${m.muscle}-${i}`}
                d={m.d}
                fill={color}
                stroke={isHovered ? 'var(--color-text-primary)' : 'var(--color-border)'}
                strokeWidth={isHovered ? 1.5 : 0.5}
                opacity={isHovered ? 1 : 0.85}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={(e) => handleMouseEnter(m.muscle, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => onMuscleClick?.(m.muscle)}
              />
            );
          })}

          {/* Hands (decorative) */}
          <path d={leftHand} fill="var(--muscle-0)" opacity="0.4" />
          <path d={rightHand} fill="var(--muscle-0)" opacity="0.4" />
          {/* Feet */}
          <path d={leftFoot} fill="var(--muscle-0)" opacity="0.4" />
          <path d={rightFoot} fill="var(--muscle-0)" opacity="0.4" />
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-overlay animate-fade-in"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="text-body-xs font-medium text-[var(--color-text-primary)]">
              {tooltip.muscle.label}
            </p>
            <p className="text-body-xs tabular-nums text-[var(--color-text-secondary)]">
              <span className="font-semibold text-brand-600 dark:text-brand-400">{tooltip.muscle.workouts}</span> workouts
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-1.5">
        <span className="text-body-xs text-[var(--color-text-tertiary)]">Less</span>
        {['var(--muscle-0)', 'var(--muscle-1)', 'var(--muscle-2)', 'var(--muscle-3)', 'var(--muscle-4)', 'var(--muscle-5)'].map((color, i) => (
          <div
            key={i}
            className="h-3 w-6 rounded-sm border border-[var(--color-border-light)]"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-body-xs text-[var(--color-text-tertiary)]">More</span>
      </div>

      {/* Stats grid below */}
      <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-xs">
        {data
          .filter((d) => (view === 'front'
            ? ['chest', 'shoulders', 'biceps', 'abs', 'obliques', 'quads', 'calves'].includes(d.muscle)
            : ['traps', 'lats', 'upper_back', 'lower_back', 'triceps', 'glutes', 'hamstrings', 'calves'].includes(d.muscle)
          ))
          .sort((a, b) => b.workouts - a.workouts)
          .map((d) => (
            <button
              key={d.muscle}
              onClick={() => onMuscleClick?.(d.muscle)}
              onMouseEnter={() => setHoveredMuscle(d.muscle)}
              onMouseLeave={() => { setHoveredMuscle(null); setTooltip(null); }}
              className={cn(
                'rounded-lg border border-[var(--color-border-light)] px-2.5 py-2 text-left transition-all',
                hoveredMuscle === d.muscle
                  ? 'border-brand-500/50 bg-brand-50/50 dark:bg-brand-900/20'
                  : 'hover:bg-[var(--color-surface-hover)]'
              )}
            >
              <p className="text-body-xs text-[var(--color-text-tertiary)]">{d.label}</p>
              <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{d.workouts}</p>
            </button>
          ))}
      </div>
    </div>
  );
}

// ─── Default Mock Data ──────────────────────────────────────────────────────

export const mockMuscleData: MuscleData[] = [
  { muscle: 'chest', workouts: 12, label: 'Chest' },
  { muscle: 'shoulders', workouts: 14, label: 'Shoulders' },
  { muscle: 'biceps', workouts: 10, label: 'Biceps' },
  { muscle: 'triceps', workouts: 8, label: 'Triceps' },
  { muscle: 'forearms', workouts: 4, label: 'Forearms' },
  { muscle: 'abs', workouts: 6, label: 'Abs' },
  { muscle: 'obliques', workouts: 3, label: 'Obliques' },
  { muscle: 'quads', workouts: 15, label: 'Quads' },
  { muscle: 'hamstrings', workouts: 11, label: 'Hamstrings' },
  { muscle: 'calves', workouts: 7, label: 'Calves' },
  { muscle: 'glutes', workouts: 13, label: 'Glutes' },
  { muscle: 'traps', workouts: 9, label: 'Traps' },
  { muscle: 'lats', workouts: 10, label: 'Lats' },
  { muscle: 'lower_back', workouts: 5, label: 'Lower Back' },
  { muscle: 'upper_back', workouts: 8, label: 'Upper Back' },
];
