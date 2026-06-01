import type { MuscleSlug, MuscleVolume, LoggedSet } from '../core/types';
import { EXERCISE_MAP } from '../core/exercise-map';

export interface WeeklySnapshot {
  week: number;
  volumes: MuscleVolume;
  totalSets: number;
}

export interface VolumeRecommendation {
  muscle: MuscleSlug;
  currentSets: number;
  recommendedSets: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const OPTIMAL_WEEKLY_SETS: Partial<Record<MuscleSlug, { min: number; max: number }>> = {
  chest:      { min: 10, max: 20 },
  'upper-back': { min: 10, max: 20 },
  deltoids:   { min: 8, max: 16 },
  biceps:     { min: 6, max: 14 },
  triceps:    { min: 6, max: 14 },
  quadriceps: { min: 10, max: 20 },
  hamstring:  { min: 8, max: 16 },
  gluteal:    { min: 8, max: 16 },
  calves:     { min: 6, max: 12 },
  abs:        { min: 6, max: 12 },
  trapezius:  { min: 4, max: 10 },
  forearm:    { min: 4, max: 8 },
  'lower-back': { min: 4, max: 8 },
};

export function recommendVolume(
  history: WeeklySnapshot[],
  currentVolumes: MuscleVolume
): VolumeRecommendation[] {
  const recommendations: VolumeRecommendation[] = [];

  for (const [muscle, range] of Object.entries(OPTIMAL_WEEKLY_SETS) as [MuscleSlug, { min: number; max: number }][]) {
    const current = currentVolumes[muscle] ?? 0;

    if (current < range.min) {
      recommendations.push({
        muscle,
        currentSets: Math.round(current),
        recommendedSets: range.min,
        reason: `Below minimum effective volume (${range.min} sets)`,
        priority: current === 0 ? 'high' : 'medium',
      });
    } else if (current > range.max) {
      recommendations.push({
        muscle,
        currentSets: Math.round(current),
        recommendedSets: range.max,
        reason: `Above maximum recoverable volume (${range.max} sets)`,
        priority: 'medium',
      });
    }
  }

  if (history.length >= 3) {
    const recentTrend = history.slice(-3);
    for (const muscle of Object.keys(OPTIMAL_WEEKLY_SETS) as MuscleSlug[]) {
      const vals = recentTrend.map((w) => w.volumes[muscle] ?? 0);
      const isStagnant = vals.every((v) => Math.abs(v - vals[0]) < 1);
      if (isStagnant && vals[0] > 0) {
        const existing = recommendations.find((r) => r.muscle === muscle);
        if (!existing) {
          recommendations.push({
            muscle,
            currentSets: Math.round(vals[0]),
            recommendedSets: Math.round(vals[0] * 1.1),
            reason: 'Volume stagnant for 3+ weeks — progressive overload needed',
            priority: 'low',
          });
        }
      }
    }
  }

  return recommendations.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

export function projectNextWeek(
  history: WeeklySnapshot[]
): MuscleVolume {
  if (history.length === 0) return {};
  if (history.length === 1) return { ...history[0].volumes };

  const recent = history.slice(-4);
  const projection: MuscleVolume = {};
  const muscles = new Set<MuscleSlug>();
  recent.forEach((w) => Object.keys(w.volumes).forEach((m) => muscles.add(m as MuscleSlug)));

  for (const muscle of muscles) {
    const vals = recent.map((w) => w.volumes[muscle] ?? 0);
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    const trend = vals.length >= 2 ? (vals[vals.length - 1] - vals[0]) / vals.length : 0;
    projection[muscle] = Math.max(0, Math.round((avg + trend) * 10) / 10);
  }

  return projection;
}
