/**
 * Human Performance Engine — Centralized health data graph.
 *
 * Tracks everything about a human's performance:
 * workouts, nutrition, recovery, sleep, HRV, mood, biomarkers.
 *
 * Produces: predictive analytics, longevity insights,
 * metabolic scoring, health risk scoring.
 */

export interface HealthMetric {
  timestamp: string;
  source: 'manual' | 'whoop' | 'apple_health' | 'oura' | 'strava' | 'garmin' | 'fitbit' | 'dexcom';
  value: number;
  unit: string;
}

export interface HealthGraph {
  userId: string;

  // Physical metrics
  weight: HealthMetric[];
  bodyFat: HealthMetric[];
  muscleMass: HealthMetric[];
  bmi: HealthMetric[];

  // Cardiovascular
  restingHR: HealthMetric[];
  hrv: HealthMetric[];
  vo2max: HealthMetric[];
  bloodPressureSystolic: HealthMetric[];
  bloodPressureDiastolic: HealthMetric[];

  // Sleep
  sleepDuration: HealthMetric[];
  sleepQuality: HealthMetric[];
  deepSleep: HealthMetric[];
  remSleep: HealthMetric[];

  // Metabolic
  bloodGlucose: HealthMetric[];
  basalMetabolicRate: HealthMetric[];

  // Activity
  dailySteps: HealthMetric[];
  activeCalories: HealthMetric[];
  trainingLoad: HealthMetric[];

  // Recovery
  recoveryScore: HealthMetric[];
  muscleStrain: HealthMetric[];

  // Subjective
  mood: HealthMetric[];
  energyLevel: HealthMetric[];
  stressLevel: HealthMetric[];
  painLevel: HealthMetric[];

  // Nutrition
  caloriesConsumed: HealthMetric[];
  proteinGrams: HealthMetric[];
  waterLiters: HealthMetric[];

  // Biomarkers (blood work)
  testosterone: HealthMetric[];
  cortisol: HealthMetric[];
  vitaminD: HealthMetric[];
  iron: HealthMetric[];
  thyroid: HealthMetric[];
  crp: HealthMetric[];
}

// ─── Derived Scores ──────────────────────────────────────────────────────────

export interface PerformanceScores {
  overall: number;        // 0-100
  training: number;       // strength + endurance
  nutrition: number;      // adherence + quality
  recovery: number;       // sleep + HRV + subjective
  metabolic: number;      // glucose + BMR + weight trend
  longevity: number;      // composite risk score
  consistency: number;    // habit adherence over time
}

export function computePerformanceScores(graph: HealthGraph): PerformanceScores {
  const latest = (arr: HealthMetric[]) => arr.length > 0 ? arr[arr.length - 1].value : 0;
  const avg = (arr: HealthMetric[], n = 7) => {
    const slice = arr.slice(-n);
    return slice.length > 0 ? slice.reduce((s, m) => s + m.value, 0) / slice.length : 0;
  };

  // Training score
  const stepsScore = Math.min(avg(graph.dailySteps, 7) / 10000 * 100, 100);
  const loadScore = Math.min(avg(graph.trainingLoad, 7) / 500 * 100, 100);
  const training = Math.round((stepsScore + loadScore) / 2);

  // Nutrition score
  const proteinScore = Math.min(avg(graph.proteinGrams, 7) / 160 * 100, 100);
  const waterScore = Math.min(avg(graph.waterLiters, 7) / 3 * 100, 100);
  const nutrition = Math.round((proteinScore + waterScore) / 2);

  // Recovery score
  const sleepScore = Math.min(avg(graph.sleepDuration, 7) / 8 * 100, 100);
  const hrvScore = Math.min(avg(graph.hrv, 7) / 80 * 100, 100);
  const moodScore = avg(graph.mood, 7) * 10;
  const recovery = Math.round((sleepScore + hrvScore + moodScore) / 3);

  // Metabolic score
  const glucoseNormal = avg(graph.bloodGlucose, 7) > 0 ? (avg(graph.bloodGlucose, 7) < 100 ? 80 : 50) : 70;
  const metabolic = Math.round(glucoseNormal);

  // Longevity (simplified: lower resting HR + higher HRV + good sleep = better)
  const hrBonus = latest(graph.restingHR) > 0 ? Math.max(0, 100 - latest(graph.restingHR)) : 40;
  const longevity = Math.round((recovery + hrBonus + metabolic) / 3);

  // Consistency
  const recentWorkouts = graph.trainingLoad.filter(
    (m) => new Date(m.timestamp) > new Date(Date.now() - 30 * 86400000)
  ).length;
  const consistency = Math.min(Math.round((recentWorkouts / 20) * 100), 100);

  const overall = Math.round((training + nutrition + recovery + metabolic + longevity + consistency) / 6);

  return { overall, training, nutrition, recovery, metabolic, longevity, consistency };
}

// ─── Health Risk Alerts ──────────────────────────────────────────────────────

export interface HealthAlert {
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  recommendation: string;
}

export function detectHealthAlerts(graph: HealthGraph): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const avg = (arr: HealthMetric[], n = 7) => {
    const slice = arr.slice(-n);
    return slice.length > 0 ? slice.reduce((s, m) => s + m.value, 0) / slice.length : 0;
  };

  // Sleep declining
  if (avg(graph.sleepDuration, 3) < 6) {
    alerts.push({
      severity: 'warning',
      category: 'Sleep',
      message: 'Sleep averaging under 6 hours for 3 days',
      recommendation: 'Reduce training volume. Prioritize 7+ hours tonight.',
    });
  }

  // HRV drop
  const recentHRV = avg(graph.hrv, 3);
  const baselineHRV = avg(graph.hrv, 30);
  if (baselineHRV > 0 && recentHRV < baselineHRV * 0.75) {
    alerts.push({
      severity: 'warning',
      category: 'Recovery',
      message: `HRV dropped 25%+ below baseline (${Math.round(recentHRV)} vs ${Math.round(baselineHRV)})`,
      recommendation: 'Consider a deload day. Increase sleep, reduce caffeine.',
    });
  }

  // Resting HR spike
  const recentHR = avg(graph.restingHR, 3);
  const baselineHR = avg(graph.restingHR, 30);
  if (baselineHR > 0 && recentHR > baselineHR * 1.15) {
    alerts.push({
      severity: 'warning',
      category: 'Cardiovascular',
      message: `Resting HR elevated 15%+ above baseline (${Math.round(recentHR)} vs ${Math.round(baselineHR)})`,
      recommendation: 'May indicate overtraining, illness, or dehydration. Monitor closely.',
    });
  }

  // Chronic dehydration
  if (avg(graph.waterLiters, 7) < 2) {
    alerts.push({
      severity: 'info',
      category: 'Hydration',
      message: 'Averaging under 2L water daily',
      recommendation: 'Set 3 daily water reminders. Dehydration impacts performance by 10-20%.',
    });
  }

  // Elevated stress
  if (avg(graph.stressLevel, 7) >= 7) {
    alerts.push({
      severity: 'warning',
      category: 'Mental Health',
      message: 'Stress consistently elevated (7+/10)',
      recommendation: 'Consider reducing training intensity. Add 10 min daily meditation or breathing exercises.',
    });
  }

  return alerts;
}

// ─── Trend Analysis ──────────────────────────────────────────────────────────

export type Trend = 'improving' | 'stable' | 'declining';

export function analyzeTrend(metrics: HealthMetric[], windowDays = 14): Trend {
  if (metrics.length < 4) return 'stable';

  const cutoff = new Date(Date.now() - windowDays * 86400000);
  const recent = metrics.filter((m) => new Date(m.timestamp) > cutoff);
  if (recent.length < 3) return 'stable';

  const mid = Math.floor(recent.length / 2);
  const firstHalf = recent.slice(0, mid);
  const secondHalf = recent.slice(mid);

  const avgFirst = firstHalf.reduce((s, m) => s + m.value, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, m) => s + m.value, 0) / secondHalf.length;

  const changePct = ((avgSecond - avgFirst) / avgFirst) * 100;

  if (changePct > 5) return 'improving';
  if (changePct < -5) return 'declining';
  return 'stable';
}
