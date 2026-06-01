import type { MuscleSlug, MuscleVolume } from '../core/types';

export interface SymmetryScore {
  overall: number;
  upperLower: number;
  pushPull: number;
  leftRight: number;
  details: SymmetryDetail[];
}

export interface SymmetryDetail {
  category: string;
  groupA: MuscleSlug[];
  groupB: MuscleSlug[];
  volumeA: number;
  volumeB: number;
  ratio: number;
  status: 'excellent' | 'good' | 'needs-work' | 'imbalanced';
}

const UPPER: MuscleSlug[] = ['chest', 'deltoids', 'biceps', 'triceps', 'trapezius', 'upper-back', 'forearm'];
const LOWER: MuscleSlug[] = ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductors', 'tibialis'];
const PUSH: MuscleSlug[] = ['chest', 'deltoids', 'triceps', 'quadriceps'];
const PULL: MuscleSlug[] = ['upper-back', 'biceps', 'hamstring', 'trapezius'];

function sumGroup(volumes: MuscleVolume, muscles: MuscleSlug[]): number {
  return muscles.reduce((s, m) => s + (volumes[m] ?? 0), 0);
}

function ratioStatus(ratio: number): SymmetryDetail['status'] {
  const dev = Math.abs(1 - ratio);
  if (dev < 0.1) return 'excellent';
  if (dev < 0.25) return 'good';
  if (dev < 0.4) return 'needs-work';
  return 'imbalanced';
}

export function analyzeSymmetry(volumes: MuscleVolume): SymmetryScore {
  const upperVol = sumGroup(volumes, UPPER);
  const lowerVol = sumGroup(volumes, LOWER);
  const pushVol = sumGroup(volumes, PUSH);
  const pullVol = sumGroup(volumes, PULL);

  const ulRatio = lowerVol === 0 ? 0 : upperVol / lowerVol;
  const ppRatio = pullVol === 0 ? 0 : pushVol / pullVol;

  const details: SymmetryDetail[] = [
    {
      category: 'Upper / Lower',
      groupA: UPPER,
      groupB: LOWER,
      volumeA: Math.round(upperVol),
      volumeB: Math.round(lowerVol),
      ratio: Math.round(ulRatio * 100) / 100,
      status: ratioStatus(ulRatio),
    },
    {
      category: 'Push / Pull',
      groupA: PUSH,
      groupB: PULL,
      volumeA: Math.round(pushVol),
      volumeB: Math.round(pullVol),
      ratio: Math.round(ppRatio * 100) / 100,
      status: ratioStatus(ppRatio),
    },
  ];

  const scores = details.map((d) => {
    const dev = Math.abs(1 - d.ratio);
    return Math.max(0, 100 - dev * 100);
  });
  const overall = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  return {
    overall,
    upperLower: Math.round(scores[0]),
    pushPull: Math.round(scores[1]),
    leftRight: 100,
    details,
  };
}
