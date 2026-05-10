/**
 * AI Video Analysis Layer
 *
 * Capabilities:
 * - Rep counting (from video landmarks)
 * - Tempo analysis (eccentric/concentric timing)
 * - Posture/form scoring
 * - Range of motion measurement
 * - Mobility screening
 * - Exercise identification
 */

export interface VideoAnalysisResult {
  exerciseDetected: string;
  confidence: number;
  reps: number;
  tempo: { eccentric: number; concentric: number; pause: number };
  formScore: number; // 0-100
  formIssues: FormIssue[];
  rangeOfMotion: number; // 0-100 (% of ideal ROM)
  musclesActivated: string[];
  recommendations: string[];
}

export interface FormIssue {
  severity: 'minor' | 'moderate' | 'critical';
  bodyPart: string;
  issue: string;
  correction: string;
  timestamp: number; // seconds into video
}

export interface MobilityScreenResult {
  overallScore: number;
  areas: {
    name: string;
    score: number;
    limitations: string[];
    exercises: string[];
  }[];
}

// ─── Exercise Detection ──────────────────────────────────────────────────────

const EXERCISE_PATTERNS: Record<string, { keywords: string[]; muscles: string[] }> = {
  squat: { keywords: ['squat', 'back squat', 'front squat', 'goblet'], muscles: ['Quads', 'Glutes', 'Core'] },
  deadlift: { keywords: ['deadlift', 'rdl', 'romanian'], muscles: ['Hamstrings', 'Glutes', 'Back'] },
  bench_press: { keywords: ['bench', 'press', 'chest press'], muscles: ['Chest', 'Triceps', 'Shoulders'] },
  overhead_press: { keywords: ['overhead', 'ohp', 'military', 'shoulder press'], muscles: ['Shoulders', 'Triceps'] },
  pull_up: { keywords: ['pull up', 'pullup', 'chin up'], muscles: ['Lats', 'Biceps', 'Back'] },
  row: { keywords: ['row', 'bent over', 'cable row'], muscles: ['Back', 'Biceps'] },
  lunge: { keywords: ['lunge', 'split squat', 'bulgarian'], muscles: ['Quads', 'Glutes'] },
  curl: { keywords: ['curl', 'bicep'], muscles: ['Biceps'] },
};

// ─── Form Analysis (Mock — uses MediaPipe in production) ─────────────────────

export function analyzeVideoForm(exerciseName: string): VideoAnalysisResult {
  const exercise = Object.entries(EXERCISE_PATTERNS).find(
    ([, v]) => v.keywords.some((k) => exerciseName.toLowerCase().includes(k))
  );

  const [key, pattern] = exercise || ['unknown', { keywords: [], muscles: [] }];

  // Mock analysis (real version uses MediaPipe pose landmarks)
  const formScore = 72 + Math.floor(Math.random() * 20);
  const reps = 6 + Math.floor(Math.random() * 6);

  const issues: FormIssue[] = [];

  if (key === 'squat') {
    if (formScore < 85) {
      issues.push({
        severity: 'moderate',
        bodyPart: 'Knees',
        issue: 'Knee cave detected during ascent',
        correction: 'Push knees out over toes. Cue: "spread the floor with your feet."',
        timestamp: 3.2,
      });
    }
    if (formScore < 75) {
      issues.push({
        severity: 'minor',
        bodyPart: 'Torso',
        issue: 'Excessive forward lean at bottom position',
        correction: 'Brace core harder before descent. Consider front squats to improve upright posture.',
        timestamp: 4.8,
      });
    }
  }

  if (key === 'deadlift') {
    issues.push({
      severity: formScore < 70 ? 'critical' : 'minor',
      bodyPart: 'Lower Back',
      issue: formScore < 70 ? 'Lumbar rounding detected' : 'Slight loss of neutral spine at top',
      correction: formScore < 70
        ? 'STOP. Reset with flat back before each rep. Reduce weight 20%.'
        : 'Squeeze glutes harder at lockout. Avoid hyperextension.',
      timestamp: 2.5,
    });
  }

  if (key === 'bench_press') {
    issues.push({
      severity: 'minor',
      bodyPart: 'Shoulders',
      issue: 'Scapulae not fully retracted',
      correction: 'Pull shoulder blades together and DOWN before unracking. Keep chest high.',
      timestamp: 1.0,
    });
  }

  return {
    exerciseDetected: exerciseName,
    confidence: 0.88,
    reps,
    tempo: {
      eccentric: 2.1 + Math.random() * 0.5,
      concentric: 1.3 + Math.random() * 0.3,
      pause: 0.3 + Math.random() * 0.2,
    },
    formScore,
    formIssues: issues,
    rangeOfMotion: 70 + Math.floor(Math.random() * 25),
    musclesActivated: pattern.muscles,
    recommendations: [
      formScore >= 85 ? 'Form looks solid. Consider adding weight next session.' :
      formScore >= 70 ? 'Good effort. Focus on the cues above before increasing load.' :
      'Prioritize form correction before progressing. Consider filming from the side for better feedback.',
    ],
  };
}

// ─── Mobility Screen ─────────────────────────────────────────────────────────

export function runMobilityScreen(): MobilityScreenResult {
  return {
    overallScore: 72,
    areas: [
      {
        name: 'Ankle Dorsiflexion',
        score: 65,
        limitations: ['Limited range (< 35°)', 'May cause knee cave in squats'],
        exercises: ['Wall ankle stretches 2x30s', 'Elevated heel squats', 'Banded ankle mobilization'],
      },
      {
        name: 'Hip Flexion',
        score: 78,
        limitations: ['Slight restriction in deep squat depth'],
        exercises: ['90/90 hip stretch', 'Pigeon pose 2x30s', 'Goblet squat holds'],
      },
      {
        name: 'Thoracic Extension',
        score: 70,
        limitations: ['Rounded upper back in overhead movements'],
        exercises: ['Foam roller extensions 2x10', 'Cat-cow 10 reps', 'Wall slides 2x10'],
      },
      {
        name: 'Shoulder Flexion',
        score: 82,
        limitations: ['Minor restriction at end range'],
        exercises: ['Wall angels 2x10', 'Band pull-aparts 3x15', 'Overhead holds 3x15s'],
      },
      {
        name: 'Hamstring Length',
        score: 60,
        limitations: ['Cannot touch toes', 'Limits RDL depth'],
        exercises: ['Standing toe touch progression', 'RDL with elevated start', 'Lying hamstring stretch 2x30s'],
      },
    ],
  };
}
