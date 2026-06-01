import type { MuscleSlug, MuscleVolume } from '../core/types';

export interface ImbalanceReport {
  score: number;
  pairs: ImbalancePair[];
  recommendations: string[];
}

export interface ImbalancePair {
  agonist: MuscleSlug;
  antagonist: MuscleSlug;
  ratio: number;
  ideal: number;
  status: 'balanced' | 'mild' | 'severe';
}

const ANTAGONIST_PAIRS: { a: MuscleSlug; b: MuscleSlug; idealRatio: number }[] = [
  { a: 'chest', b: 'upper-back', idealRatio: 1.0 },
  { a: 'quadriceps', b: 'hamstring', idealRatio: 0.67 },
  { a: 'biceps', b: 'triceps', idealRatio: 0.67 },
  { a: 'deltoids', b: 'upper-back', idealRatio: 0.75 },
  { a: 'abs', b: 'lower-back', idealRatio: 1.0 },
  { a: 'adductors', b: 'gluteal', idealRatio: 0.5 },
];

export function detectImbalances(volumes: MuscleVolume): ImbalanceReport {
  const pairs: ImbalancePair[] = [];
  const recommendations: string[] = [];

  for (const { a, b, idealRatio } of ANTAGONIST_PAIRS) {
    const va = volumes[a] ?? 0;
    const vb = volumes[b] ?? 0;
    if (va === 0 && vb === 0) continue;

    const ratio = vb === 0 ? Infinity : va / vb;
    const deviation = Math.abs(ratio - idealRatio) / idealRatio;
    const status: ImbalancePair['status'] =
      deviation < 0.25 ? 'balanced' : deviation < 0.5 ? 'mild' : 'severe';

    pairs.push({ agonist: a, antagonist: b, ratio: Math.round(ratio * 100) / 100, ideal: idealRatio, status });

    if (status === 'severe') {
      const weak = ratio > idealRatio ? b : a;
      recommendations.push(`Increase ${weak} volume to correct ${a}/${b} imbalance`);
    } else if (status === 'mild') {
      const weak = ratio > idealRatio ? b : a;
      recommendations.push(`Consider adding 2-3 sets of ${weak} work`);
    }
  }

  const totalPairs = pairs.length || 1;
  const balancedCount = pairs.filter((p) => p.status === 'balanced').length;
  const score = Math.round((balancedCount / totalPairs) * 100);

  return { score, pairs, recommendations };
}
