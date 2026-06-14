import type { MuscleSlug, MuscleVolume, LoggedSet } from './types';
import { EXERCISE_MAP } from './exercise-map';

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

export function getWeeklyBalance(volumes: MuscleVolume): {
  overdeveloped: MuscleSlug[];
  underdeveloped: MuscleSlug[];
  balanced: MuscleSlug[];
} {
  const all = Object.entries(volumes) as [MuscleSlug, number][];
  if (all.length === 0) return { overdeveloped: [], underdeveloped: [], balanced: [] };

  const avg = all.reduce((s, [, v]) => s + v, 0) / all.length;
  const overdeveloped: MuscleSlug[] = [];
  const underdeveloped: MuscleSlug[] = [];
  const balanced: MuscleSlug[] = [];

  for (const [slug, sets] of all) {
    const ratio = sets / avg;
    if (ratio > 1.5) overdeveloped.push(slug);
    else if (ratio < 0.5) underdeveloped.push(slug);
    else balanced.push(slug);
  }

  return { overdeveloped, underdeveloped, balanced };
}
