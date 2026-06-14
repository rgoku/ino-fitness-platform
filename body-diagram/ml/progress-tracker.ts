import type { MuscleSlug, MuscleVolume } from '../core/types';
import { MUSCLE_LABELS } from '../core/exercise-map';
import { detectImbalances } from './muscle-imbalance';
import { analyzeSymmetry } from './symmetry-scoring';
import type { WeeklySnapshot } from './volume-prediction';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeeklyProgressPoint {
  weekNumber: number;
  totalVolume: number;
  muscleVolumes: MuscleVolume;
  symmetryScore: number;
  imbalanceScore: number;
  estimatedRecoveryLoad: number;
}

export interface ProgressTimeline {
  weeks: WeeklyProgressPoint[];
  overallTrend: 'declining' | 'stable' | 'progressing';
  plateauDetected: boolean;
  volumeProgression: number;
}

export interface PlateauReport {
  detected: boolean;
  muscles: PlateauEntry[];
  totalVolumePlateau: boolean;
}

export interface PlateauEntry {
  muscle: MuscleSlug;
  label: string;
  stagnantWeeks: number;
  averageVolume: number;
}

export interface DeloadSuggestion {
  shouldDeload: boolean;
  reason: string;
  weeksSinceDeload: number;
  accumulatedFatigueScore: number;
  suggestedDeloadVolume: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Recovery-cost weight per muscle: higher = more systemic fatigue per set. */
const RECOVERY_COST: Partial<Record<MuscleSlug, number>> = {
  quadriceps:   1.4,
  hamstring:    1.3,
  gluteal:      1.3,
  'lower-back': 1.5,
  'upper-back': 1.1,
  chest:        1.0,
  deltoids:     0.9,
  trapezius:    0.8,
  biceps:       0.6,
  triceps:      0.6,
  calves:       0.5,
  abs:          0.5,
  obliques:     0.4,
  forearm:      0.4,
  adductors:    0.6,
  tibialis:     0.3,
};

const PLATEAU_MIN_WEEKS = 3;
const DELOAD_BLOCK_LENGTH = 5; // typical mesocycle length in weeks

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeRecoveryLoad(volumes: MuscleVolume): number {
  let load = 0;
  for (const [muscle, sets] of Object.entries(volumes) as [MuscleSlug, number][]) {
    const cost = RECOVERY_COST[muscle] ?? 0.5;
    load += sets * cost;
  }
  return Math.round(load * 10) / 10;
}

function linearTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function classifyOverallTrend(slope: number): ProgressTimeline['overallTrend'] {
  if (slope > 0.5) return 'progressing';
  if (slope < -0.5) return 'declining';
  return 'stable';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Builds a multi-week progress timeline with trend analysis from weekly snapshots.
 *
 * @param history - Array of WeeklySnapshot, oldest first
 * @returns ProgressTimeline with per-week data points and overall trend
 */
export function buildProgressTimeline(history: WeeklySnapshot[]): ProgressTimeline {
  const weeks: WeeklyProgressPoint[] = history.map((snap) => {
    const symmetry = analyzeSymmetry(snap.volumes);
    const imbalance = detectImbalances(snap.volumes);
    const totalVolume = Object.values(snap.volumes).reduce((s, v) => s + (v ?? 0), 0);

    return {
      weekNumber: snap.week,
      totalVolume: Math.round(totalVolume * 10) / 10,
      muscleVolumes: { ...snap.volumes },
      symmetryScore: symmetry.overall,
      imbalanceScore: imbalance.score,
      estimatedRecoveryLoad: computeRecoveryLoad(snap.volumes),
    };
  });

  const totalVolumes = weeks.map((w) => w.totalVolume);
  const slope = linearTrend(totalVolumes);
  const overallTrend = classifyOverallTrend(slope);

  // Volume progression: percentage change from first to last week
  const first = totalVolumes[0] ?? 0;
  const last = totalVolumes[totalVolumes.length - 1] ?? 0;
  const volumeProgression = first === 0 ? (last > 0 ? 100 : 0) : Math.round(((last - first) / first) * 100);

  // Check for total volume plateau
  const plateaus = detectPlateaus(history);
  const plateauDetected = plateaus.totalVolumePlateau || plateaus.muscles.length > 0;

  return { weeks, overallTrend, plateauDetected, volumeProgression };
}

/**
 * Identifies stagnation across specific muscles or total volume.
 * A plateau is defined as 3+ consecutive weeks where volume varies by less than 5%.
 *
 * @param history - Array of WeeklySnapshot, oldest first
 * @returns PlateauReport listing stagnant muscles and whether total volume has plateaued
 */
export function detectPlateaus(history: WeeklySnapshot[]): PlateauReport {
  if (history.length < PLATEAU_MIN_WEEKS) {
    return { detected: false, muscles: [], totalVolumePlateau: false };
  }

  const recentWeeks = history.slice(-Math.max(PLATEAU_MIN_WEEKS, history.length));
  const musclesChecked = new Set<MuscleSlug>();
  recentWeeks.forEach((w) =>
    (Object.keys(w.volumes) as MuscleSlug[]).forEach((m) => musclesChecked.add(m))
  );

  const plateauMuscles: PlateauEntry[] = [];

  for (const muscle of musclesChecked) {
    const values = recentWeeks.map((w) => w.volumes[muscle] ?? 0);
    const stagnantRun = countTrailingStagnantWeeks(values);
    if (stagnantRun >= PLATEAU_MIN_WEEKS) {
      const avg = values.slice(-stagnantRun).reduce((s, v) => s + v, 0) / stagnantRun;
      plateauMuscles.push({
        muscle,
        label: MUSCLE_LABELS[muscle],
        stagnantWeeks: stagnantRun,
        averageVolume: Math.round(avg * 10) / 10,
      });
    }
  }

  // Check total volume plateau
  const totalVols = recentWeeks.map((w) =>
    Object.values(w.volumes).reduce((s, v) => s + (v ?? 0), 0)
  );
  const totalStagnant = countTrailingStagnantWeeks(totalVols);
  const totalVolumePlateau = totalStagnant >= PLATEAU_MIN_WEEKS;

  return {
    detected: totalVolumePlateau || plateauMuscles.length > 0,
    muscles: plateauMuscles.sort((a, b) => b.stagnantWeeks - a.stagnantWeeks),
    totalVolumePlateau,
  };
}

/**
 * Suggests a deload week based on accumulated fatigue over a 4–6 week training block.
 *
 * A deload is recommended when:
 * - The training block has reached 5+ weeks without volume reduction
 * - Recovery load has been trending upward
 * - Average recovery load exceeds a sustainable threshold
 *
 * @param history - Array of WeeklySnapshot, oldest first
 * @returns DeloadSuggestion with fatigue analysis and volume recommendation
 */
export function suggestDeload(history: WeeklySnapshot[]): DeloadSuggestion {
  if (history.length < 3) {
    return {
      shouldDeload: false,
      reason: 'Insufficient training history (need at least 3 weeks)',
      weeksSinceDeload: history.length,
      accumulatedFatigueScore: 0,
      suggestedDeloadVolume: 0,
    };
  }

  // Find the last deload (a week with notably lower volume than prior weeks)
  let lastDeloadIndex = -1;
  for (let i = 1; i < history.length; i++) {
    const prevTotal = Object.values(history[i - 1].volumes).reduce((s, v) => s + (v ?? 0), 0);
    const currTotal = Object.values(history[i].volumes).reduce((s, v) => s + (v ?? 0), 0);
    if (prevTotal > 0 && currTotal / prevTotal < 0.65) {
      lastDeloadIndex = i;
    }
  }

  const weeksSinceDeload = lastDeloadIndex === -1
    ? history.length
    : history.length - lastDeloadIndex - 1;

  // Calculate accumulated fatigue from the block since last deload
  const blockStart = lastDeloadIndex === -1 ? 0 : lastDeloadIndex + 1;
  const block = history.slice(blockStart);
  const recoveryLoads = block.map((w) => computeRecoveryLoad(w.volumes));
  const avgLoad = recoveryLoads.length > 0
    ? recoveryLoads.reduce((s, v) => s + v, 0) / recoveryLoads.length
    : 0;
  const loadTrend = linearTrend(recoveryLoads);

  // Fatigue score: combines block length, normalized average load, and load trend
  // Normalize avgLoad: typical sustainable range is ~40-80, so divide by 100 to scale to 0-1ish
  const normalizedLoad = Math.min(avgLoad / 100, 1);
  const accumulatedFatigueScore = Math.round(
    Math.min(100, (weeksSinceDeload / DELOAD_BLOCK_LENGTH) * 40 + normalizedLoad * 30 + Math.max(0, loadTrend) * 5)
  );

  // Current week total for deload volume suggestion
  const lastWeek = history[history.length - 1];
  const lastTotal = Object.values(lastWeek.volumes).reduce((s, v) => s + (v ?? 0), 0);
  const suggestedDeloadVolume = Math.round(lastTotal * 0.55 * 10) / 10;

  // Decision logic
  let shouldDeload = false;
  let reason: string;

  if (weeksSinceDeload >= DELOAD_BLOCK_LENGTH + 1 && accumulatedFatigueScore > 60) {
    shouldDeload = true;
    reason = `${weeksSinceDeload} weeks of training without a deload and fatigue score is ${accumulatedFatigueScore}/100. Schedule a deload this week to consolidate gains.`;
  } else if (accumulatedFatigueScore > 80) {
    shouldDeload = true;
    reason = `Fatigue score is critically high (${accumulatedFatigueScore}/100) despite only ${weeksSinceDeload} weeks in block. Recovery is likely impaired — deload now.`;
  } else if (loadTrend > 3 && weeksSinceDeload >= DELOAD_BLOCK_LENGTH) {
    shouldDeload = true;
    reason = `Recovery load has been climbing steeply for ${weeksSinceDeload} weeks. Proactive deload recommended to prevent overreaching.`;
  } else if (weeksSinceDeload < DELOAD_BLOCK_LENGTH) {
    reason = `Only ${weeksSinceDeload} weeks into current block (fatigue ${accumulatedFatigueScore}/100). Continue training — deload target is week ${DELOAD_BLOCK_LENGTH + 1}.`;
  } else {
    reason = `${weeksSinceDeload} weeks in block with moderate fatigue (${accumulatedFatigueScore}/100). Monitor closely — deload if performance drops.`;
  }

  return {
    shouldDeload,
    reason,
    weeksSinceDeload,
    accumulatedFatigueScore,
    suggestedDeloadVolume,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Counts the number of trailing weeks where the value changes by less than 5%.
 */
function countTrailingStagnantWeeks(values: number[]): number {
  if (values.length < 2) return 0;

  let count = 1;
  const reference = values[values.length - 1];
  if (reference === 0) {
    // Count trailing zeroes
    for (let i = values.length - 2; i >= 0; i--) {
      if (values[i] === 0) count++;
      else break;
    }
    return count;
  }

  for (let i = values.length - 2; i >= 0; i--) {
    const delta = Math.abs(values[i] - reference) / reference;
    if (delta < 0.05) count++;
    else break;
  }

  return count;
}
