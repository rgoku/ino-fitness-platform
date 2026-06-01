import type { MuscleSlug, MuscleVolume } from '../core/types';

export type RecoveryStatus = 'recovered' | 'recovering' | 'fatigued' | 'overtrained';

export interface MuscleRecovery {
  muscle: MuscleSlug;
  status: RecoveryStatus;
  hoursRemaining: number;
  readiness: number;
}

const BASE_RECOVERY_HOURS: Partial<Record<MuscleSlug, number>> = {
  chest: 48,
  'upper-back': 48,
  deltoids: 36,
  biceps: 36,
  triceps: 36,
  quadriceps: 72,
  hamstring: 72,
  gluteal: 48,
  calves: 24,
  abs: 24,
  trapezius: 36,
  forearm: 24,
  'lower-back': 72,
  obliques: 24,
  adductors: 48,
  tibialis: 24,
};

export function estimateRecovery(
  volumes: MuscleVolume,
  hoursSinceWorkout: number,
  sleepQuality: number = 0.8,
  nutritionScore: number = 0.8
): MuscleRecovery[] {
  const recoveryMultiplier = (sleepQuality + nutritionScore) / 2;

  return (Object.entries(volumes) as [MuscleSlug, number][])
    .filter(([, sets]) => sets > 0)
    .map(([muscle, sets]) => {
      const baseHours = BASE_RECOVERY_HOURS[muscle] ?? 48;
      const volumeMultiplier = sets > 15 ? 1.3 : sets > 10 ? 1.1 : 1.0;
      const totalHours = baseHours * volumeMultiplier / recoveryMultiplier;
      const hoursRemaining = Math.max(0, totalHours - hoursSinceWorkout);
      const readiness = Math.min(1, hoursSinceWorkout / totalHours);

      let status: RecoveryStatus;
      if (readiness >= 0.95) status = 'recovered';
      else if (readiness >= 0.6) status = 'recovering';
      else if (readiness >= 0.3) status = 'fatigued';
      else status = 'overtrained';

      return {
        muscle,
        status,
        hoursRemaining: Math.round(hoursRemaining),
        readiness: Math.round(readiness * 100) / 100,
      };
    })
    .sort((a, b) => a.readiness - b.readiness);
}

export function suggestTrainingDay(
  recoveryState: MuscleRecovery[]
): MuscleSlug[] {
  return recoveryState
    .filter((r) => r.status === 'recovered' || r.status === 'recovering')
    .sort((a, b) => b.readiness - a.readiness)
    .map((r) => r.muscle);
}
