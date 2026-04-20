/**
 * Auto-Progression Engine
 *
 * Analyzes logged sets and automatically suggests weight/rep progressions
 * based on performance. Uses proven progressive overload principles.
 */

export interface LoggedSet {
  weight: number;
  reps: number;
  rpe?: number;
  target_reps: string; // "8-10", "6", etc.
}

export interface ExerciseHistory {
  exercise_name: string;
  muscle_groups: string[];
  recent_sets: LoggedSet[];
  target_sets: number;
  target_reps: string;
}

export interface ProgressionSuggestion {
  action: 'increase_weight' | 'increase_reps' | 'maintain' | 'deload' | 'form_check';
  current_weight: number;
  suggested_weight: number;
  current_reps: string;
  suggested_reps: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

function parseTargetReps(target: string): { min: number; max: number } {
  const match = target.match(/(\d+)(?:\s*[-–]\s*(\d+))?/);
  if (!match) return { min: 8, max: 12 };
  const min = parseInt(match[1]);
  const max = match[2] ? parseInt(match[2]) : min;
  return { min, max };
}

/**
 * Double-progression rule:
 * - Hit top of rep range on all sets → increase weight
 * - Failed to hit bottom of rep range → reduce weight (deload)
 * - In range but not top → keep weight, push for more reps
 * - RPE >9 on every set → deload
 * - RPE <7 on every set → increase weight
 */
export function suggestProgression(history: ExerciseHistory): ProgressionSuggestion {
  const { recent_sets, target_reps, exercise_name } = history;

  if (recent_sets.length === 0) {
    return {
      action: 'maintain',
      current_weight: 0,
      suggested_weight: 0,
      current_reps: target_reps,
      suggested_reps: target_reps,
      reason: 'No history yet — start at conservative weight.',
      confidence: 'low',
    };
  }

  const { min, max } = parseTargetReps(target_reps);
  const avgWeight = recent_sets.reduce((s, set) => s + set.weight, 0) / recent_sets.length;
  const avgReps = recent_sets.reduce((s, set) => s + set.reps, 0) / recent_sets.length;
  const avgRPE = recent_sets.filter((s) => s.rpe).reduce((s, set) => s + (set.rpe || 0), 0) /
                 Math.max(recent_sets.filter((s) => s.rpe).length, 1);

  const allHitTop = recent_sets.every((s) => s.reps >= max);
  const someFailedBottom = recent_sets.some((s) => s.reps < min);
  const highRPE = avgRPE > 9 && avgRPE <= 10;
  const lowRPE = avgRPE > 0 && avgRPE < 7;

  // Determine weight increment based on exercise type
  const isCompound = /squat|deadlift|bench|press|row|pull.?up|chin.?up/i.test(exercise_name);
  const isUpper = /bench|press|row|pull|curl|tricep|fly|lateral/i.test(exercise_name);
  const increment = isCompound && !isUpper ? 5 : isCompound ? 2.5 : 2.5; // Lower body compounds jump more

  // Decision tree
  if (allHitTop) {
    return {
      action: 'increase_weight',
      current_weight: avgWeight,
      suggested_weight: avgWeight + increment,
      current_reps: target_reps,
      suggested_reps: target_reps,
      reason: `Hit ${max} reps on all sets. Increase by ${increment}kg.`,
      confidence: 'high',
    };
  }

  if (lowRPE && !someFailedBottom) {
    return {
      action: 'increase_weight',
      current_weight: avgWeight,
      suggested_weight: avgWeight + increment,
      current_reps: target_reps,
      suggested_reps: target_reps,
      reason: `RPE averaging ${avgRPE.toFixed(1)} — too easy. Increase weight.`,
      confidence: 'high',
    };
  }

  if (someFailedBottom || highRPE) {
    const deloadAmount = avgWeight * 0.1;
    return {
      action: 'deload',
      current_weight: avgWeight,
      suggested_weight: Math.round((avgWeight - deloadAmount) * 2) / 2,
      current_reps: target_reps,
      suggested_reps: target_reps,
      reason: someFailedBottom
        ? `Failed to hit ${min} reps. Reduce 10% to rebuild form.`
        : `RPE averaging ${avgRPE.toFixed(1)} — burnt out. Deload 10%.`,
      confidence: 'high',
    };
  }

  // In range — push for more reps
  return {
    action: 'increase_reps',
    current_weight: avgWeight,
    suggested_weight: avgWeight,
    current_reps: `${Math.round(avgReps)}`,
    suggested_reps: `${Math.min(Math.round(avgReps) + 1, max)}`,
    reason: `Solid performance. Push for ${Math.min(Math.round(avgReps) + 1, max)} reps before adding weight.`,
    confidence: 'medium',
  };
}

/** Generate progression suggestions for all exercises in a program */
export function analyzeProgram(histories: ExerciseHistory[]): ProgressionSuggestion[] {
  return histories.map(suggestProgression);
}

/** Quick summary for coach view */
export function progressionSummary(suggestions: ProgressionSuggestion[]): {
  toIncrease: number;
  toDeload: number;
  toMaintain: number;
} {
  return {
    toIncrease: suggestions.filter((s) => s.action === 'increase_weight' || s.action === 'increase_reps').length,
    toDeload: suggestions.filter((s) => s.action === 'deload').length,
    toMaintain: suggestions.filter((s) => s.action === 'maintain').length,
  };
}
