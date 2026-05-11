/**
 * INÖ AI Memory + Adaptive Intelligence Engine
 *
 * "I know you." — The system that makes INÖ irreplaceable.
 *
 * Learns from: behavior, recovery, psychology, consistency,
 * habits, motivation, injuries, sleep, stress.
 *
 * Outputs: adaptive training, adaptive dieting, plateau detection,
 * injury prevention, stress-aware adjustments.
 */

// ─── User Memory Graph ──────────────────────────────────────────────────────

export interface UserMemory {
  userId: string;
  // Physical
  avgSleepHours: number;
  sleepTrend: 'improving' | 'stable' | 'declining';
  avgHRV: number;
  recoveryScore: number; // 0-100
  readinessScore: number; // 0-100
  stressLevel: number; // 1-10
  hydrationAvg: number; // liters
  // Training
  preferredTrainingTime: 'morning' | 'afternoon' | 'evening';
  strongDays: string[]; // ['monday', 'wednesday']
  weakDays: string[]; // days they often skip
  plateauExercises: string[]; // stalled lifts
  injuryHistory: string[];
  currentNaggingPain: string[];
  avgSessionDuration: number;
  missedSessionsLast14Days: number;
  // Psychology
  motivationPattern: 'intrinsic' | 'extrinsic' | 'social' | 'competitive';
  responsesToPraise: 'high' | 'moderate' | 'low';
  streakSensitivity: 'high' | 'low'; // does breaking a streak demotivate them?
  preferredCommunicationStyle: 'supportive' | 'direct' | 'data-driven';
  // Nutrition
  commonMissedMacro: 'protein' | 'carbs' | 'fat' | 'none';
  mealTimingPattern: string[];
  stressEatingRisk: boolean;
  weekendAdherenceDrop: number; // % drop vs weekday
  // Meta
  lastUpdated: string;
  totalDataPoints: number;
}

// ─── Adaptive Training Decisions ─────────────────────────────────────────────

export interface TrainingAdjustment {
  type: 'volume_reduce' | 'volume_increase' | 'deload_week' | 'exercise_swap' | 'intensity_reduce' | 'rest_day' | 'active_recovery';
  reason: string;
  confidence: number; // 0-1
  appliedAutomatically: boolean;
}

export function computeReadinessScore(memory: UserMemory): number {
  let score = 50;

  // Sleep
  if (memory.avgSleepHours >= 7.5) score += 15;
  else if (memory.avgSleepHours >= 6.5) score += 5;
  else score -= 15;

  // HRV
  if (memory.avgHRV > 60) score += 10;
  else if (memory.avgHRV < 40) score -= 10;

  // Stress
  if (memory.stressLevel <= 3) score += 10;
  else if (memory.stressLevel >= 7) score -= 15;
  else if (memory.stressLevel >= 5) score -= 5;

  // Recovery
  score += (memory.recoveryScore - 50) * 0.2;

  // Missed sessions (fatigue vs detraining)
  if (memory.missedSessionsLast14Days === 0) score += 5;
  else if (memory.missedSessionsLast14Days >= 4) score -= 10;

  // Pain
  if (memory.currentNaggingPain.length > 0) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function generateAdaptiveAdjustments(memory: UserMemory): TrainingAdjustment[] {
  const adjustments: TrainingAdjustment[] = [];
  const readiness = computeReadinessScore(memory);

  // Low readiness → auto-reduce volume
  if (readiness < 40) {
    adjustments.push({
      type: 'volume_reduce',
      reason: `Readiness score is ${readiness}/100 (sleep: ${memory.avgSleepHours}h, stress: ${memory.stressLevel}/10). Reducing volume 20% to protect recovery.`,
      confidence: 0.9,
      appliedAutomatically: true,
    });
  }

  // Very low → suggest rest day
  if (readiness < 25) {
    adjustments.push({
      type: 'active_recovery',
      reason: `Readiness critically low (${readiness}/100). Recommending active recovery instead of planned session.`,
      confidence: 0.85,
      appliedAutomatically: false,
    });
  }

  // Plateau detection
  if (memory.plateauExercises.length > 0) {
    adjustments.push({
      type: 'exercise_swap',
      reason: `Plateau detected on: ${memory.plateauExercises.join(', ')}. Suggesting variation exercises to break through.`,
      confidence: 0.8,
      appliedAutomatically: false,
    });
  }

  // Injury prevention
  if (memory.currentNaggingPain.length > 0) {
    adjustments.push({
      type: 'exercise_swap',
      reason: `Active discomfort in: ${memory.currentNaggingPain.join(', ')}. Swapping exercises that load those areas.`,
      confidence: 0.95,
      appliedAutomatically: true,
    });
  }

  // Deload week detection (4+ weeks of consistent training)
  if (memory.missedSessionsLast14Days === 0 && memory.stressLevel >= 6) {
    adjustments.push({
      type: 'deload_week',
      reason: 'High consistency + elevated stress. Proactive deload week to prevent overtraining.',
      confidence: 0.7,
      appliedAutomatically: false,
    });
  }

  return adjustments;
}

// ─── Adaptive Nutrition Decisions ────────────────────────────────────────────

export interface NutritionAdjustment {
  type: 'increase_protein' | 'reduce_calories' | 'add_refeed' | 'hydration_reminder' | 'meal_timing_shift' | 'weekend_strategy';
  reason: string;
  suggestion: string;
}

export function generateNutritionAdjustments(memory: UserMemory): NutritionAdjustment[] {
  const adjustments: NutritionAdjustment[] = [];

  if (memory.commonMissedMacro === 'protein') {
    adjustments.push({
      type: 'increase_protein',
      reason: 'Consistently under protein target',
      suggestion: 'Add a protein shake post-workout or Greek yogurt as a snack. Aim for 30g per meal.',
    });
  }

  if (memory.weekendAdherenceDrop > 20) {
    adjustments.push({
      type: 'weekend_strategy',
      reason: `Adherence drops ${memory.weekendAdherenceDrop}% on weekends`,
      suggestion: 'Pre-plan 2 flexible meals for Saturday. Use a "80/20" approach — hit targets 5 days, relax 2.',
    });
  }

  if (memory.stressEatingRisk && memory.stressLevel >= 6) {
    adjustments.push({
      type: 'meal_timing_shift',
      reason: 'Stress eating risk elevated during high-stress periods',
      suggestion: 'Front-load calories earlier in the day. Keep protein-rich snacks ready for evening cravings.',
    });
  }

  if (memory.hydrationAvg < 2.5) {
    adjustments.push({
      type: 'hydration_reminder',
      reason: `Averaging ${memory.hydrationAvg}L/day (target: 3L)`,
      suggestion: 'Set 3 water reminders: morning, pre-workout, evening. Each 750ml = on track.',
    });
  }

  return adjustments;
}

// ─── Daily Mission Generator ─────────────────────────────────────────────────

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: 'workout' | 'nutrition' | 'recovery' | 'mindset' | 'social';
  xp: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function generateDailyMissions(memory: UserMemory): DailyMission[] {
  const missions: DailyMission[] = [];
  const readiness = computeReadinessScore(memory);

  // Always: one workout-related
  if (readiness >= 50) {
    missions.push({
      id: `m-${Date.now()}-1`,
      title: 'Complete today\'s workout',
      description: 'Full session as programmed. Log all sets.',
      type: 'workout',
      xp: 50,
      difficulty: 'medium',
    });
  } else {
    missions.push({
      id: `m-${Date.now()}-1`,
      title: '20-minute active recovery',
      description: 'Light movement: walk, stretch, or yoga. Your body needs recovery today.',
      type: 'recovery',
      xp: 30,
      difficulty: 'easy',
    });
  }

  // Nutrition mission
  if (memory.commonMissedMacro === 'protein') {
    missions.push({
      id: `m-${Date.now()}-2`,
      title: 'Hit your protein target',
      description: 'Aim for 30g protein per meal. Track in the app.',
      type: 'nutrition',
      xp: 25,
      difficulty: 'easy',
    });
  } else {
    missions.push({
      id: `m-${Date.now()}-2`,
      title: 'Log all meals today',
      description: 'Every meal. Even snacks. Full picture = better coaching.',
      type: 'nutrition',
      xp: 20,
      difficulty: 'easy',
    });
  }

  // Recovery mission
  if (memory.avgSleepHours < 7) {
    missions.push({
      id: `m-${Date.now()}-3`,
      title: 'Lights out by 10:30 PM',
      description: `You're averaging ${memory.avgSleepHours}h. Tonight, prioritize sleep.`,
      type: 'recovery',
      xp: 30,
      difficulty: 'medium',
    });
  }

  // Social mission (if competitive type)
  if (memory.motivationPattern === 'social' || memory.motivationPattern === 'competitive') {
    missions.push({
      id: `m-${Date.now()}-4`,
      title: 'Check the leaderboard',
      description: 'See where you rank. Your buddy is 2 spots ahead.',
      type: 'social',
      xp: 10,
      difficulty: 'easy',
    });
  }

  return missions;
}

// ─── Streak Protection Alerts ────────────────────────────────────────────────

export function shouldSendStreakAlert(memory: UserMemory, currentStreak: number, lastWorkoutHoursAgo: number): { send: boolean; message: string } {
  if (currentStreak < 3) return { send: false, message: '' };

  // About to break streak (>20h since last workout, streak > 7 days)
  if (lastWorkoutHoursAgo >= 20 && currentStreak >= 7) {
    return {
      send: true,
      message: `Your ${currentStreak}-day streak ends tonight. Even 15 minutes counts. Don't let it go.`,
    };
  }

  // Approaching streak milestone
  if (currentStreak === 6 || currentStreak === 13 || currentStreak === 29) {
    return {
      send: true,
      message: `One more day and you hit ${currentStreak + 1}! That's a new milestone. Show up today.`,
    };
  }

  // High streak sensitivity + approaching end of day
  if (memory.streakSensitivity === 'high' && lastWorkoutHoursAgo >= 16) {
    return {
      send: true,
      message: `Day ${currentStreak + 1} is waiting. You care about this. Let's go.`,
    };
  }

  return { send: false, message: '' };
}

// ─── Win Score Calculator ────────────────────────────────────────────────────

export function calculateDailyWinScore(data: {
  workoutCompleted: boolean;
  proteinHit: boolean;
  caloriesInRange: boolean;
  sleepAbove7: boolean;
  stepsAbove8k: boolean;
  waterAbove3L: boolean;
  moodPositive: boolean;
  habitsCompleted: number;
  habitsTotal: number;
}): { score: number; grade: string; message: string } {
  let score = 0;
  if (data.workoutCompleted) score += 25;
  if (data.proteinHit) score += 15;
  if (data.caloriesInRange) score += 10;
  if (data.sleepAbove7) score += 15;
  if (data.stepsAbove8k) score += 10;
  if (data.waterAbove3L) score += 10;
  if (data.moodPositive) score += 5;
  if (data.habitsTotal > 0) score += Math.round((data.habitsCompleted / data.habitsTotal) * 10);

  const grade = score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';

  const messages: Record<string, string> = {
    S: 'Elite day. You crushed every metric.',
    A: 'Great day. One or two things to tighten up.',
    B: 'Solid. Consistency over perfection.',
    C: 'Room to grow. Tomorrow is a fresh start.',
    D: 'Tough day. But you showed up. That counts.',
  };

  return { score, grade, message: messages[grade] };
}

// ─── Default Memory (new user) ───────────────────────────────────────────────

export function createDefaultMemory(userId: string): UserMemory {
  return {
    userId,
    avgSleepHours: 7,
    sleepTrend: 'stable',
    avgHRV: 50,
    recoveryScore: 70,
    readinessScore: 70,
    stressLevel: 4,
    hydrationAvg: 2.5,
    preferredTrainingTime: 'morning',
    strongDays: ['monday', 'wednesday', 'friday'],
    weakDays: ['sunday'],
    plateauExercises: [],
    injuryHistory: [],
    currentNaggingPain: [],
    avgSessionDuration: 55,
    missedSessionsLast14Days: 1,
    motivationPattern: 'intrinsic',
    responsesToPraise: 'moderate',
    streakSensitivity: 'high',
    preferredCommunicationStyle: 'supportive',
    commonMissedMacro: 'protein',
    mealTimingPattern: ['7:30', '12:00', '15:30', '19:00'],
    stressEatingRisk: false,
    weekendAdherenceDrop: 15,
    lastUpdated: new Date().toISOString(),
    totalDataPoints: 0,
  };
}
