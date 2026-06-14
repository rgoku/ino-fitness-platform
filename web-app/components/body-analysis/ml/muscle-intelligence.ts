import type { MuscleSlug, MuscleVolume, LoggedSet } from '../core/types';
import { MUSCLE_LABELS } from '../core/exercise-map';
import { aggregateVolume, getWeeklyBalance } from '../core/volume';
import { detectImbalances, type ImbalanceReport, type ImbalancePair } from './muscle-imbalance';
import { estimateRecovery, suggestTrainingDay, type MuscleRecovery, type RecoveryStatus } from './recovery-model';
import { analyzeSymmetry, type SymmetryScore } from './symmetry-scoring';
import { recommendVolume, projectNextWeek, type WeeklySnapshot, type VolumeRecommendation } from './volume-prediction';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GrowthPhase =
  | 'detraining'
  | 'maintenance'
  | 'hypertrophy'
  | 'overreaching'
  | 'peak';

export type TrendDirection =
  | 'declining'
  | 'stable'
  | 'progressing'
  | 'accelerating';

export interface MuscleTwinState {
  slug: MuscleSlug;
  label: string;
  weeklyVolume: number;
  weeklyVolumeTarget: number;
  recoveryStatus: RecoveryStatus;
  recoveryReadiness: number;
  hoursUntilRecovered: number;
  imbalanceStatus: ImbalancePair['status'] | 'none';
  growthPhase: GrowthPhase;
  trendDirection: TrendDirection;
  weekOverWeekDelta: number;
  rank: number;
}

export interface DigitalTwinReport {
  generatedAt: number;
  muscles: MuscleTwinState[];
  symmetry: SymmetryScore;
  imbalance: ImbalanceReport;
  volumeRecommendations: VolumeRecommendation[];
  projectedNextWeek: MuscleVolume;
  overallReadiness: number;
  overallScore: number;
  recommendations: string[];
  suggestedSplit: string[];
}

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

/** Optimal weekly set ranges per muscle (re-used from volume-prediction logic). */
const OPTIMAL_RANGES: Partial<Record<MuscleSlug, { min: number; max: number }>> = {
  chest:        { min: 10, max: 20 },
  'upper-back': { min: 10, max: 20 },
  deltoids:     { min: 8,  max: 16 },
  biceps:       { min: 6,  max: 14 },
  triceps:      { min: 6,  max: 14 },
  quadriceps:   { min: 10, max: 20 },
  hamstring:    { min: 8,  max: 16 },
  gluteal:      { min: 8,  max: 16 },
  calves:       { min: 6,  max: 12 },
  abs:          { min: 6,  max: 12 },
  trapezius:    { min: 4,  max: 10 },
  forearm:      { min: 4,  max: 8  },
  'lower-back': { min: 4,  max: 8  },
  obliques:     { min: 4,  max: 10 },
  adductors:    { min: 4,  max: 10 },
  tibialis:     { min: 2,  max: 6  },
};

/** Large muscle groups weighted more heavily for readiness. */
const READINESS_WEIGHTS: Partial<Record<MuscleSlug, number>> = {
  quadriceps:   1.5,
  gluteal:      1.5,
  'upper-back': 1.3,
  chest:        1.2,
  hamstring:    1.2,
  deltoids:     1.0,
  'lower-back': 1.0,
  biceps:       0.8,
  triceps:      0.8,
  trapezius:    0.8,
  calves:       0.6,
  abs:          0.6,
  obliques:     0.5,
  forearm:      0.5,
  adductors:    0.5,
  tibialis:     0.4,
};

const ALL_MUSCLES: MuscleSlug[] = [
  'chest', 'obliques', 'abs', 'biceps', 'triceps', 'trapezius',
  'deltoids', 'quadriceps', 'tibialis', 'calves', 'forearm',
  'adductors', 'upper-back', 'lower-back', 'gluteal', 'hamstring',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function determineGrowthPhase(
  currentVolume: number,
  muscle: MuscleSlug,
  trendDirection: TrendDirection
): GrowthPhase {
  const range = OPTIMAL_RANGES[muscle];
  if (!range) return 'maintenance';

  if (currentVolume === 0) return 'detraining';
  if (currentVolume < range.min) {
    return trendDirection === 'declining' ? 'detraining' : 'maintenance';
  }
  if (currentVolume > range.max) {
    return trendDirection === 'accelerating' ? 'overreaching' : 'peak';
  }
  // Within optimal range
  if (trendDirection === 'accelerating' || trendDirection === 'progressing') return 'hypertrophy';
  if (trendDirection === 'declining') return 'maintenance';
  return 'maintenance';
}

function computeTrendDirection(history: WeeklySnapshot[], muscle: MuscleSlug): TrendDirection {
  const recent = history.slice(-4);
  if (recent.length < 2) return 'stable';

  const values = recent.map((w) => w.volumes[muscle] ?? 0);
  const deltas: number[] = [];
  for (let i = 1; i < values.length; i++) {
    deltas.push(values[i] - values[i - 1]);
  }

  const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length;
  const allPositive = deltas.every((d) => d > 0);
  const allNegative = deltas.every((d) => d < 0);

  if (allPositive && avgDelta >= 1) return 'accelerating';
  if (avgDelta >= 0.5) return 'progressing';
  if (allNegative || avgDelta <= -0.5) return 'declining';
  return 'stable';
}

function computeWeekOverWeekDelta(history: WeeklySnapshot[], muscle: MuscleSlug, currentVolume: number): number {
  if (history.length === 0) return 0;
  const lastWeek = history[history.length - 1];
  const prev = lastWeek.volumes[muscle] ?? 0;
  if (prev === 0) return currentVolume > 0 ? 100 : 0;
  return Math.round(((currentVolume - prev) / prev) * 100);
}

function findImbalanceStatusForMuscle(
  report: ImbalanceReport,
  muscle: MuscleSlug
): ImbalancePair['status'] | 'none' {
  for (const pair of report.pairs) {
    if (pair.agonist === muscle || pair.antagonist === muscle) {
      return pair.status;
    }
  }
  return 'none';
}

function generateRecommendations(
  muscles: MuscleTwinState[],
  symmetry: SymmetryScore,
  imbalance: ImbalanceReport,
  volumeRecs: VolumeRecommendation[]
): string[] {
  const recs: string[] = [];

  // Recovery-based recommendations
  const overtrained = muscles.filter((m) => m.recoveryStatus === 'overtrained' || m.recoveryStatus === 'fatigued');
  if (overtrained.length > 3) {
    recs.push(
      `High systemic fatigue detected — ${overtrained.length} muscle groups still recovering. Consider a rest day or light active recovery session.`
    );
  }

  // Volume recommendations (top priority items)
  const highPriority = volumeRecs.filter((r) => r.priority === 'high');
  for (const rec of highPriority.slice(0, 3)) {
    const label = MUSCLE_LABELS[rec.muscle];
    if (rec.currentSets < rec.recommendedSets) {
      recs.push(`${label} needs ${rec.recommendedSets - rec.currentSets} more weekly sets to reach minimum effective volume (currently ${rec.currentSets}/${rec.recommendedSets}).`);
    } else {
      recs.push(`${label} is over maximum recoverable volume — reduce by ${rec.currentSets - rec.recommendedSets} sets to avoid junk volume.`);
    }
  }

  // Symmetry recommendations
  if (symmetry.upperLower < 70) {
    const detail = symmetry.details.find((d) => d.category === 'Upper / Lower');
    if (detail && detail.volumeA > detail.volumeB) {
      recs.push('Upper body is significantly outpacing lower body volume. Add a dedicated leg session this week.');
    } else if (detail) {
      recs.push('Lower body volume is disproportionate to upper body. Add a push or pull session to balance.');
    }
  }
  if (symmetry.pushPull < 70) {
    const detail = symmetry.details.find((d) => d.category === 'Push / Pull');
    if (detail && detail.volumeA > detail.volumeB) {
      recs.push('Push volume exceeds pull — add rows or pull-ups to protect shoulder health.');
    } else if (detail) {
      recs.push('Pull volume exceeds push — add pressing movements for balanced development.');
    }
  }

  // Imbalance pair recommendations (from the module)
  for (const rec of imbalance.recommendations.slice(0, 2)) {
    if (!recs.includes(rec)) recs.push(rec);
  }

  // Detraining alert
  const detraining = muscles.filter((m) => m.growthPhase === 'detraining');
  if (detraining.length > 0 && detraining.length <= 4) {
    const names = detraining.map((m) => m.label).join(', ');
    recs.push(`${names} ${detraining.length === 1 ? 'is' : 'are'} receiving zero stimulus — add at least ${detraining.length === 1 ? 'a few sets' : 'some sets'} to prevent atrophy.`);
  }

  // Plateau detection
  const stagnant = muscles.filter((m) => m.trendDirection === 'stable' && m.growthPhase === 'maintenance');
  if (stagnant.length >= 5) {
    recs.push('Multiple muscle groups have stagnant volume — consider a progressive overload wave: increase total sets by 10% next week.');
  }

  return recs;
}

function buildSuggestedSplit(readyMuscles: MuscleSlug[]): string[] {
  const split: string[] = [];
  const pushReady = readyMuscles.some((m) => ['chest', 'deltoids', 'triceps'].includes(m));
  const pullReady = readyMuscles.some((m) => ['upper-back', 'biceps', 'trapezius'].includes(m));
  const legsReady = readyMuscles.some((m) => ['quadriceps', 'hamstring', 'gluteal'].includes(m));

  if (pushReady) split.push('Push (chest, shoulders, triceps)');
  if (pullReady) split.push('Pull (back, biceps, traps)');
  if (legsReady) split.push('Legs (quads, hamstrings, glutes)');
  if (readyMuscles.some((m) => ['abs', 'obliques'].includes(m))) {
    split.push('Core work can be added to any session');
  }

  if (split.length === 0) split.push('Rest day recommended — no major muscle groups fully recovered');
  return split;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a comprehensive "digital twin" report combining all ML modules.
 *
 * @param currentSets - This week's logged sets
 * @param history - Previous weekly snapshots (oldest first)
 * @param hoursSinceWorkout - Hours since the most recent training session
 * @param sleepQuality - Sleep quality factor 0–1 (1 = perfect)
 * @param nutritionScore - Nutrition adherence factor 0–1 (1 = perfect)
 * @returns Complete DigitalTwinReport with per-muscle state, scores, and recommendations
 */
export function generateDigitalTwin(
  currentSets: LoggedSet[],
  history: WeeklySnapshot[],
  hoursSinceWorkout: number,
  sleepQuality: number = 0.8,
  nutritionScore: number = 0.8
): DigitalTwinReport {
  // --- Aggregate current week ---
  const currentVolumes = aggregateVolume(currentSets);

  // --- Run each ML sub-module ---
  const imbalance = detectImbalances(currentVolumes);
  const recoveryList = estimateRecovery(currentVolumes, hoursSinceWorkout, sleepQuality, nutritionScore);
  const symmetry = analyzeSymmetry(currentVolumes);
  const volumeRecs = recommendVolume(history, currentVolumes);
  const projectedNextWeek = projectNextWeek(history);
  const readyMuscles = suggestTrainingDay(recoveryList);

  // --- Build recovery lookup ---
  const recoveryMap = new Map<MuscleSlug, MuscleRecovery>();
  for (const r of recoveryList) recoveryMap.set(r.muscle, r);

  // --- Build per-muscle twin state ---
  const volumeEntries = ALL_MUSCLES.map((slug) => ({
    slug,
    volume: currentVolumes[slug] ?? 0,
  }));
  volumeEntries.sort((a, b) => b.volume - a.volume);

  const muscles: MuscleTwinState[] = volumeEntries.map((entry, index) => {
    const { slug, volume } = entry;
    const range = OPTIMAL_RANGES[slug] ?? { min: 4, max: 12 };
    const recovery = recoveryMap.get(slug);
    const trend = computeTrendDirection(history, slug);
    const phase = determineGrowthPhase(volume, slug, trend);

    return {
      slug,
      label: MUSCLE_LABELS[slug],
      weeklyVolume: Math.round(volume * 10) / 10,
      weeklyVolumeTarget: Math.round((range.min + range.max) / 2),
      recoveryStatus: recovery?.status ?? 'recovered',
      recoveryReadiness: recovery?.readiness ?? 1,
      hoursUntilRecovered: recovery?.hoursRemaining ?? 0,
      imbalanceStatus: findImbalanceStatusForMuscle(imbalance, slug),
      growthPhase: phase,
      trendDirection: trend,
      weekOverWeekDelta: computeWeekOverWeekDelta(history, slug, volume),
      rank: index + 1,
    };
  });

  // --- Overall readiness ---
  const overallReadiness = computeOverallReadiness(muscles);

  // --- Overall score (composite of symmetry + imbalance + readiness) ---
  const overallScore = Math.round(
    symmetry.overall * 0.3 + imbalance.score * 0.3 + overallReadiness * 0.4
  );

  // --- Recommendations ---
  const recommendations = generateRecommendations(muscles, symmetry, imbalance, volumeRecs);
  const suggestedSplit = buildSuggestedSplit(readyMuscles);

  return {
    generatedAt: Date.now(),
    muscles,
    symmetry,
    imbalance,
    volumeRecommendations: volumeRecs,
    projectedNextWeek,
    overallReadiness,
    overallScore,
    recommendations,
    suggestedSplit: suggestedSplit,
  };
}

/**
 * Returns a deep drill-down for a single muscle from an existing twin report.
 *
 * @param report - A previously generated DigitalTwinReport
 * @param muscle - The MuscleSlug to drill into
 * @returns The MuscleTwinState for the requested muscle, or undefined if not found
 */
export function getMuscleDetail(
  report: DigitalTwinReport,
  muscle: MuscleSlug
): MuscleTwinState | undefined {
  return report.muscles.find((m) => m.slug === muscle);
}

/**
 * Computes overall body readiness (0–100) from the twin report's recovery state.
 * Large muscle groups (quads, glutes, back) are weighted more heavily.
 *
 * @param report - A previously generated DigitalTwinReport
 * @returns A readiness score from 0 (completely fatigued) to 100 (fully recovered)
 */
export function getTrainingReadiness(report: DigitalTwinReport): number {
  return computeOverallReadiness(report.muscles);
}

// ---------------------------------------------------------------------------
// Internal readiness computation
// ---------------------------------------------------------------------------

function computeOverallReadiness(muscles: MuscleTwinState[]): number {
  const activeMuscles = muscles.filter((m) => m.weeklyVolume > 0);
  if (activeMuscles.length === 0) return 100;

  let weightedSum = 0;
  let weightTotal = 0;
  for (const m of activeMuscles) {
    const weight = READINESS_WEIGHTS[m.slug] ?? 0.5;
    weightedSum += m.recoveryReadiness * weight;
    weightTotal += weight;
  }

  return Math.round((weightedSum / weightTotal) * 100 * 100) / 100;
}
