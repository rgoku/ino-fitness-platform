/**
 * Exercise Parser — Converts natural language exercise input into structured data.
 *
 * Supports formats like:
 *   "bench press 4x8"
 *   "squat 3x5 @RPE8"
 *   "deadlift 5x3 @8, 90s rest"
 *   "cable flys 4x12-15 - slow eccentric"
 *   "bench press 12x5, cables flys 4x5"
 *   Multi-line input (one exercise per line)
 */

export interface ParsedExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe?: number;
  rest?: string;
  notes?: string;
  muscleGroups?: string[];
  // AI-enriched fields (filled after build)
  coachingCues?: string[];
  videoUrl?: string;
  description?: string;
}

// ─── Muscle group mapping ───────────────────────────────────────────────────

const muscleMap: Record<string, string[]> = {
  'bench press': ['Chest', 'Triceps', 'Shoulders'],
  'incline bench': ['Upper Chest', 'Shoulders', 'Triceps'],
  'decline bench': ['Lower Chest', 'Triceps'],
  'dumbbell press': ['Chest', 'Triceps', 'Shoulders'],
  'chest press': ['Chest', 'Triceps'],
  'push up': ['Chest', 'Triceps', 'Core'],
  'pushup': ['Chest', 'Triceps', 'Core'],
  'dip': ['Chest', 'Triceps', 'Shoulders'],
  'dips': ['Chest', 'Triceps', 'Shoulders'],
  'cable fly': ['Chest'],
  'cable flys': ['Chest'],
  'cable flies': ['Chest'],
  'pec deck': ['Chest'],
  'fly': ['Chest'],
  'flys': ['Chest'],
  'flies': ['Chest'],

  'squat': ['Quads', 'Glutes', 'Core'],
  'back squat': ['Quads', 'Glutes', 'Core'],
  'front squat': ['Quads', 'Core'],
  'goblet squat': ['Quads', 'Glutes'],
  'leg press': ['Quads', 'Glutes'],
  'hack squat': ['Quads'],
  'lunge': ['Quads', 'Glutes', 'Hamstrings'],
  'lunges': ['Quads', 'Glutes', 'Hamstrings'],
  'split squat': ['Quads', 'Glutes'],
  'bulgarian split squat': ['Quads', 'Glutes'],
  'leg extension': ['Quads'],
  'leg curl': ['Hamstrings'],
  'hamstring curl': ['Hamstrings'],

  'deadlift': ['Hamstrings', 'Glutes', 'Back', 'Core'],
  'romanian deadlift': ['Hamstrings', 'Glutes'],
  'rdl': ['Hamstrings', 'Glutes'],
  'stiff leg deadlift': ['Hamstrings', 'Glutes'],
  'hip thrust': ['Glutes', 'Hamstrings'],
  'glute bridge': ['Glutes'],

  'overhead press': ['Shoulders', 'Triceps'],
  'ohp': ['Shoulders', 'Triceps'],
  'military press': ['Shoulders', 'Triceps'],
  'shoulder press': ['Shoulders', 'Triceps'],
  'lateral raise': ['Shoulders'],
  'lat raise': ['Shoulders'],
  'front raise': ['Shoulders'],
  'face pull': ['Rear Delts', 'Upper Back'],
  'reverse fly': ['Rear Delts', 'Upper Back'],
  'upright row': ['Shoulders', 'Traps'],

  'pull up': ['Lats', 'Biceps', 'Upper Back'],
  'pullup': ['Lats', 'Biceps', 'Upper Back'],
  'chin up': ['Lats', 'Biceps'],
  'chinup': ['Lats', 'Biceps'],
  'lat pulldown': ['Lats', 'Biceps'],
  'row': ['Back', 'Biceps'],
  'barbell row': ['Back', 'Biceps'],
  'bent over row': ['Back', 'Biceps'],
  'cable row': ['Back', 'Biceps'],
  'seated row': ['Back', 'Biceps'],
  't-bar row': ['Back', 'Biceps'],
  'dumbbell row': ['Back', 'Biceps'],

  'bicep curl': ['Biceps'],
  'curl': ['Biceps'],
  'curls': ['Biceps'],
  'hammer curl': ['Biceps', 'Forearms'],
  'preacher curl': ['Biceps'],
  'concentration curl': ['Biceps'],

  'tricep extension': ['Triceps'],
  'skull crusher': ['Triceps'],
  'tricep pushdown': ['Triceps'],
  'overhead extension': ['Triceps'],
  'close grip bench': ['Triceps', 'Chest'],

  'calf raise': ['Calves'],
  'calf raises': ['Calves'],
  'seated calf raise': ['Calves'],

  'plank': ['Core', 'Abs'],
  'crunch': ['Abs'],
  'crunches': ['Abs'],
  'sit up': ['Abs'],
  'leg raise': ['Abs', 'Hip Flexors'],
  'ab wheel': ['Abs', 'Core'],
  'russian twist': ['Obliques', 'Core'],
  'wood chop': ['Obliques', 'Core'],
  'cable crunch': ['Abs'],
  'hanging leg raise': ['Abs', 'Core'],

  'shrug': ['Traps'],
  'shrugs': ['Traps'],
  'farmer walk': ['Traps', 'Forearms', 'Core'],
  'farmers walk': ['Traps', 'Forearms', 'Core'],
  'wrist curl': ['Forearms'],
};

function findMuscleGroups(name: string): string[] {
  const lower = name.toLowerCase().trim();
  // Exact match first
  if (muscleMap[lower]) return muscleMap[lower];
  // Partial match
  for (const [key, groups] of Object.entries(muscleMap)) {
    if (lower.includes(key) || key.includes(lower)) return groups;
  }
  return [];
}

// ─── Parser ─────────────────────────────────────────────────────────────────

let idCounter = 0;

export function parseExercises(input: string): ParsedExercise[] {
  if (!input.trim()) return [];

  // Split by newlines or commas (but not commas inside parentheses)
  const lines = input
    .split(/[\n]|(?:,\s*(?=[a-zA-Z]))/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line) => parseExerciseLine(line));
}

function parseExerciseLine(line: string): ParsedExercise {
  let name = '';
  let sets = 0;
  let reps = '';
  let rpe: number | undefined;
  let rest: string | undefined;
  let notes: string | undefined;

  // Extract notes (after dash)
  const dashIdx = line.indexOf(' - ');
  if (dashIdx > -1) {
    notes = line.slice(dashIdx + 3).trim();
    line = line.slice(0, dashIdx).trim();
  }

  // Extract RPE (@RPE8, @8, @rpe 7)
  const rpeMatch = line.match(/@\s*(?:rpe\s*)?(\d+(?:\.\d+)?)/i);
  if (rpeMatch) {
    rpe = parseFloat(rpeMatch[1]);
    line = line.replace(rpeMatch[0], '').trim();
  }

  // Extract rest time (90s, 2min, 60 sec, rest 90s)
  const restMatch = line.match(/(?:rest\s+)?(\d+)\s*(?:s|sec|seconds?|min|minutes?)/i);
  if (restMatch) {
    rest = restMatch[0].replace(/^rest\s+/i, '').trim();
    line = line.replace(restMatch[0], '').trim();
  }

  // Extract sets x reps (4x8, 3x5-8, 12x5, 3 x 8-12)
  const setsRepsMatch = line.match(/(\d+)\s*[xX×]\s*(\d+(?:\s*[-–]\s*\d+)?)/);
  if (setsRepsMatch) {
    sets = parseInt(setsRepsMatch[1]);
    reps = setsRepsMatch[2].replace(/\s/g, '');
    name = line.replace(setsRepsMatch[0], '').trim();
  } else {
    // No sets/reps found — whole line is the exercise name
    name = line.trim();
    sets = 3; // default
    reps = '8-12'; // default
  }

  // Clean up name
  name = name
    .replace(/[,;]+$/, '')
    .replace(/^\s*[-–]\s*/, '')
    .trim();

  // Capitalize first letter of each word
  name = name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const muscleGroups = findMuscleGroups(name);

  return {
    id: `ex-${Date.now()}-${++idCounter}`,
    name,
    sets,
    reps,
    rpe,
    rest,
    notes,
    muscleGroups,
  };
}

// ─── AI Enrichment (mock) ───────────────────────────────────────────────────

const coachingCuesMap: Record<string, string[]> = {
  'bench press': ['Retract scapula and set arch', 'Drive feet into floor', 'Lower bar to nipple line', 'Press up and slightly back'],
  'squat': ['Brace core, big breath', 'Break at hips and knees simultaneously', 'Knees track over toes', 'Drive up through heels'],
  'deadlift': ['Hinge at hips, flat back', 'Bar stays close to shins', 'Drive through the floor', 'Lock out hips at top'],
  'overhead press': ['Brace core tight', 'Press straight up, head through', 'Lock out overhead', 'Control the eccentric'],
  'cable fly': ['Slight bend in elbows', 'Squeeze at the peak', 'Control the stretch', 'Keep shoulders back'],
  'cable flys': ['Slight bend in elbows', 'Squeeze at the peak', 'Control the stretch', 'Keep shoulders back'],
  'lat pulldown': ['Lean back slightly', 'Pull to upper chest', 'Squeeze shoulder blades', 'Control the negative'],
  'barbell row': ['Hinge forward 45°', 'Pull to lower chest', 'Squeeze at the top', 'Keep core braced'],
  'bicep curl': ['Keep elbows pinned', 'Full range of motion', 'Control the negative', 'Squeeze at the top'],
  'tricep pushdown': ['Elbows stay at sides', 'Full lockout', 'Squeeze at bottom', 'Slow eccentric'],
  'lateral raise': ['Slight bend in elbows', 'Lead with elbows', 'Stop at shoulder height', 'Control the descent'],
  'hip thrust': ['Drive through heels', 'Full hip extension', 'Squeeze glutes at top', 'Chin tucked'],
  'leg press': ['Full range of motion', 'Don\'t lock knees', 'Feet shoulder width', 'Control the descent'],
  'romanian deadlift': ['Soft knee bend', 'Push hips back', 'Feel hamstring stretch', 'Flat back throughout'],
  'lunge': ['Long stride forward', 'Front knee tracks over toe', 'Back knee near floor', 'Drive through front heel'],
};

const descriptionMap: Record<string, string> = {
  'bench press': 'A compound pressing movement targeting the chest, triceps, and anterior deltoids. The barbell bench press is the gold standard for upper body pushing strength.',
  'squat': 'The king of lower body exercises. Barbell back squats develop quad, glute, and core strength while building functional movement patterns.',
  'deadlift': 'A foundational hip hinge movement that builds total posterior chain strength. Engages the hamstrings, glutes, back, and grip.',
  'overhead press': 'A strict vertical pressing movement that builds shoulder strength and stability. Trains the deltoids, triceps, and core.',
  'cable fly': 'An isolation exercise for the chest that provides constant tension throughout the movement. Great for developing the inner chest.',
  'cable flys': 'An isolation exercise for the chest that provides constant tension throughout the movement. Great for developing the inner chest.',
};

export function enrichExercises(exercises: ParsedExercise[]): ParsedExercise[] {
  return exercises.map((ex) => {
    const key = ex.name.toLowerCase();
    return {
      ...ex,
      coachingCues: coachingCuesMap[key] || ['Focus on form', 'Control the movement', 'Full range of motion'],
      description: descriptionMap[key] || `${ex.name} targeting ${ex.muscleGroups?.join(', ') || 'multiple muscle groups'}.`,
      muscleGroups: ex.muscleGroups?.length ? ex.muscleGroups : findMuscleGroups(key),
    };
  });
}
