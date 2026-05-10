/**
 * Questionnaire system — coaches build custom intake/check-in forms
 * or use INO-provided templates.
 */

export type QuestionType =
  | 'short_text'    // Single-line input
  | 'long_text'     // Textarea
  | 'number'        // Numeric input
  | 'single_choice' // Radio buttons
  | 'multi_choice'  // Checkboxes
  | 'scale'         // 1-10 rating
  | 'date'          // Date picker
  | 'photo'         // Image upload (progress photos)
  | 'file'          // Document upload (blood work, etc.)
  | 'signature';    // E-signature pad

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  help?: string;
  required: boolean;
  options?: string[]; // For single_choice / multi_choice
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  scaleLabels?: { min: string; max: string };
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Questionnaire {
  id: string;
  name: string;
  description: string;
  type: 'intake' | 'check_in' | 'injury' | 'nutrition' | 'goal' | 'custom';
  template: boolean; // true = INO-provided, false = coach-created
  estimatedMinutes: number;
  sections: QuestionnaireSection[];
  createdBy?: string;
  createdAt?: string;
  timesUsed?: number;
  lastUpdated?: string;
}

// ─────────────────────────────────────────────────────────────────────
// Pre-built INO Templates
// ─────────────────────────────────────────────────────────────────────

export const TEMPLATE_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'tmpl-intake-full',
    name: 'Comprehensive Client Intake',
    description: 'The gold-standard onboarding questionnaire. Covers health, goals, lifestyle, training history, and nutrition.',
    type: 'intake',
    template: true,
    estimatedMinutes: 12,
    timesUsed: 2840,
    sections: [
      {
        id: 's1',
        title: 'About You',
        questions: [
          { id: 'q1', type: 'short_text', label: 'Full name', required: true, placeholder: 'e.g., James Wilson' },
          { id: 'q2', type: 'short_text', label: 'Date of birth', required: true, placeholder: 'MM/DD/YYYY' },
          { id: 'q3', type: 'number', label: 'Height (cm)', required: true, minValue: 120, maxValue: 220 },
          { id: 'q4', type: 'number', label: 'Current weight (kg)', required: true, minValue: 30, maxValue: 250 },
          { id: 'q5', type: 'single_choice', label: 'Sex', required: true, options: ['Male', 'Female', 'Prefer not to say'] },
          { id: 'q6', type: 'single_choice', label: 'Occupation activity level', required: true,
            options: ['Desk job (sedentary)', 'Mostly standing/walking', 'Physical labor', 'Very active job'] },
        ],
      },
      {
        id: 's2',
        title: 'Health & Medical History',
        description: 'Your safety is our #1 priority. This helps us program around any limitations.',
        questions: [
          { id: 'q7', type: 'multi_choice', label: 'Do you have any of these conditions?', required: false,
            options: ['Diabetes', 'High blood pressure', 'Heart condition', 'Asthma', 'PCOS', 'Thyroid', 'None'] },
          { id: 'q8', type: 'multi_choice', label: 'Current or recent injuries', required: false,
            options: ['Lower back', 'Shoulder', 'Knee', 'Hip', 'Wrist', 'Ankle', 'Neck', 'None'] },
          { id: 'q9', type: 'long_text', label: 'Medications, surgeries, or other medical details I should know about',
            required: false, placeholder: 'Optional — anything that impacts your training' },
          { id: 'q10', type: 'single_choice', label: 'Has a doctor ever advised against exercise?', required: true,
            options: ['No', 'Yes — I have medical clearance now', 'Yes — no clearance'] },
        ],
      },
      {
        id: 's3',
        title: 'Goals & Timeline',
        questions: [
          { id: 'q11', type: 'multi_choice', label: 'Your top goals (pick up to 3)', required: true,
            options: ['Lose fat', 'Build muscle', 'Get stronger', 'Improve endurance', 'Sport performance', 'General health', 'Recomp (lose fat + build muscle)'] },
          { id: 'q12', type: 'long_text', label: 'Describe your ideal outcome in 12 weeks',
            required: true, placeholder: 'What does success look like for you?' },
          { id: 'q13', type: 'scale', label: 'How motivated are you right now (1-10)?', required: true,
            minValue: 1, maxValue: 10, scaleLabels: { min: 'Low', max: 'On fire' } },
        ],
      },
      {
        id: 's4',
        title: 'Training Background',
        questions: [
          { id: 'q14', type: 'single_choice', label: 'Training experience', required: true,
            options: ['Complete beginner', '< 6 months', '6-12 months', '1-3 years', '3+ years'] },
          { id: 'q15', type: 'single_choice', label: 'Equipment access', required: true,
            options: ['Full commercial gym', 'Home gym (full)', 'Home gym (partial)', 'Bodyweight only', 'Resistance bands + DBs'] },
          { id: 'q16', type: 'number', label: 'How many days per week can you train?', required: true, minValue: 1, maxValue: 7 },
          { id: 'q17', type: 'number', label: 'How long per session (minutes)?', required: true, minValue: 15, maxValue: 180 },
        ],
      },
      {
        id: 's5',
        title: 'Nutrition & Lifestyle',
        questions: [
          { id: 'q18', type: 'multi_choice', label: 'Dietary preferences / restrictions', required: false,
            options: ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Dairy-free', 'Keto', 'Halal', 'Kosher'] },
          { id: 'q19', type: 'short_text', label: 'Food allergies', required: false, placeholder: 'e.g., peanuts, shellfish' },
          { id: 'q20', type: 'number', label: 'Average sleep hours per night', required: true, minValue: 3, maxValue: 12 },
          { id: 'q21', type: 'scale', label: 'How would you rate your current stress level?', required: true,
            minValue: 1, maxValue: 10, scaleLabels: { min: 'Calm', max: 'Burnt out' } },
        ],
      },
      {
        id: 's6',
        title: 'Baseline Photos',
        description: 'Optional but highly recommended for tracking transformation.',
        questions: [
          { id: 'q22', type: 'photo', label: 'Front view', required: false },
          { id: 'q23', type: 'photo', label: 'Side view', required: false },
          { id: 'q24', type: 'photo', label: 'Back view', required: false },
          { id: 'q25', type: 'signature', label: 'I acknowledge the risks and agree to the coaching terms', required: true },
        ],
      },
    ],
  },
  {
    id: 'tmpl-checkin-weekly',
    name: 'Weekly Check-in',
    description: 'Quick weekly pulse — weight, mood, adherence, obstacles.',
    type: 'check_in',
    template: true,
    estimatedMinutes: 3,
    timesUsed: 18420,
    sections: [
      {
        id: 's1',
        title: 'This Week',
        questions: [
          { id: 'q1', type: 'number', label: 'Current weight (kg)', required: true, minValue: 30, maxValue: 250 },
          { id: 'q2', type: 'scale', label: 'Energy levels this week', required: true, minValue: 1, maxValue: 10 },
          { id: 'q3', type: 'scale', label: 'How consistent were you with the plan?', required: true, minValue: 1, maxValue: 10 },
          { id: 'q4', type: 'long_text', label: 'What went well this week?', required: false },
          { id: 'q5', type: 'long_text', label: 'What got in the way?', required: false },
          { id: 'q6', type: 'photo', label: 'Progress photo (optional)', required: false },
        ],
      },
    ],
  },
  {
    id: 'tmpl-injury-assessment',
    name: 'Injury Assessment',
    description: 'Detailed injury screening before programming. Use when clients report pain or limitations.',
    type: 'injury',
    template: true,
    estimatedMinutes: 8,
    timesUsed: 412,
    sections: [
      {
        id: 's1',
        title: 'Injury Details',
        questions: [
          { id: 'q1', type: 'single_choice', label: 'Body region', required: true,
            options: ['Neck', 'Upper back', 'Lower back', 'Shoulder', 'Elbow', 'Wrist', 'Hip', 'Knee', 'Ankle', 'Other'] },
          { id: 'q2', type: 'scale', label: 'Pain level right now', required: true, minValue: 0, maxValue: 10,
            scaleLabels: { min: 'No pain', max: 'Severe' } },
          { id: 'q3', type: 'single_choice', label: 'When did it start?', required: true,
            options: ['Today', 'This week', 'This month', '1-6 months ago', '6+ months ago'] },
          { id: 'q4', type: 'long_text', label: 'What movements make it worse?', required: true },
          { id: 'q5', type: 'long_text', label: 'What eases it?', required: false },
          { id: 'q6', type: 'single_choice', label: 'Have you seen a medical professional?', required: true,
            options: ['Yes — have diagnosis', 'Yes — no clear diagnosis', 'No, not yet', 'Plan to soon'] },
          { id: 'q7', type: 'file', label: 'Upload imaging/reports (if any)', required: false },
        ],
      },
    ],
  },
  {
    id: 'tmpl-nutrition-habits',
    name: 'Nutrition Habits Deep Dive',
    description: 'Pre-diet-plan assessment. Reveals habits, triggers, and patterns.',
    type: 'nutrition',
    template: true,
    estimatedMinutes: 6,
    timesUsed: 1203,
    sections: [
      {
        id: 's1',
        title: 'Current Patterns',
        questions: [
          { id: 'q1', type: 'number', label: 'How many meals per day (typical)?', required: true, minValue: 1, maxValue: 10 },
          { id: 'q2', type: 'number', label: 'How many snacks per day?', required: true, minValue: 0, maxValue: 10 },
          { id: 'q3', type: 'single_choice', label: 'How often do you eat out?', required: true,
            options: ['Rarely', '1-2x/week', '3-5x/week', 'Daily'] },
          { id: 'q4', type: 'multi_choice', label: 'Protein sources you regularly eat', required: true,
            options: ['Chicken', 'Beef', 'Fish', 'Eggs', 'Greek yogurt', 'Whey protein', 'Tofu/tempeh', 'Legumes'] },
        ],
      },
      {
        id: 's2',
        title: 'Relationship with Food',
        questions: [
          { id: 'q5', type: 'scale', label: 'How would you rate your current nutrition?', required: true, minValue: 1, maxValue: 10 },
          { id: 'q6', type: 'multi_choice', label: 'Do any of these apply?', required: false,
            options: ['I stress eat', 'I skip meals', 'Late-night snacking', 'Binge-restrict cycles', 'I count calories', 'I track macros'] },
          { id: 'q7', type: 'long_text', label: 'Anything else about your eating habits?', required: false },
        ],
      },
    ],
  },
  {
    id: 'tmpl-goal-deep',
    name: 'Goal Setting Workshop',
    description: 'Deep-dive on WHY the client wants to change. Fuels coach-client alignment.',
    type: 'goal',
    template: true,
    estimatedMinutes: 5,
    timesUsed: 687,
    sections: [
      {
        id: 's1',
        title: 'Your Why',
        questions: [
          { id: 'q1', type: 'long_text', label: 'Why now? What triggered this decision?', required: true,
            placeholder: 'e.g., turned 40, doctor visit, upcoming event…' },
          { id: 'q2', type: 'long_text', label: 'Describe yourself 6 months from now — physical, emotional, lifestyle', required: true },
          { id: 'q3', type: 'long_text', label: 'What have you tried before? What worked? What didn\'t?', required: true },
          { id: 'q4', type: 'long_text', label: 'What would stop you from hitting this goal?', required: true },
          { id: 'q5', type: 'scale', label: 'On a scale of 1-10, how committed are you?', required: true, minValue: 1, maxValue: 10 },
        ],
      },
    ],
  },
  {
    id: 'tmpl-sleep-recovery',
    name: 'Sleep & Recovery Audit',
    description: 'Identify recovery bottlenecks impacting training adaptation.',
    type: 'check_in',
    template: true,
    estimatedMinutes: 4,
    timesUsed: 298,
    sections: [
      {
        id: 's1',
        title: 'Sleep Quality',
        questions: [
          { id: 'q1', type: 'number', label: 'Average hours of sleep', required: true, minValue: 3, maxValue: 12 },
          { id: 'q2', type: 'scale', label: 'Sleep quality (1-10)', required: true, minValue: 1, maxValue: 10 },
          { id: 'q3', type: 'single_choice', label: 'Do you wake up during the night?', required: true,
            options: ['Rarely', 'Sometimes', 'Often', 'Every night'] },
          { id: 'q4', type: 'multi_choice', label: 'Sleep hygiene habits', required: false,
            options: ['Screens in bed', 'Caffeine after 2pm', 'Alcohol before bed', 'Late workouts', 'Consistent schedule', 'Dark room'] },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

export const QUESTION_TYPE_LABELS: Record<QuestionType, { label: string; icon: string }> = {
  short_text:     { label: 'Short text',    icon: 'Type' },
  long_text:      { label: 'Long text',     icon: 'AlignLeft' },
  number:         { label: 'Number',        icon: 'Hash' },
  single_choice:  { label: 'Single choice', icon: 'CircleDot' },
  multi_choice:   { label: 'Multi choice',  icon: 'ListChecks' },
  scale:          { label: 'Scale (1-10)',  icon: 'Gauge' },
  date:           { label: 'Date',          icon: 'Calendar' },
  photo:          { label: 'Photo upload',  icon: 'Camera' },
  file:           { label: 'File upload',   icon: 'FileUp' },
  signature:      { label: 'Signature',     icon: 'PenLine' },
};

export function createBlankQuestionnaire(): Questionnaire {
  return {
    id: `q-${Date.now()}`,
    name: 'Untitled Questionnaire',
    description: '',
    type: 'custom',
    template: false,
    estimatedMinutes: 5,
    sections: [
      {
        id: `s-${Date.now()}`,
        title: 'Section 1',
        questions: [],
      },
    ],
  };
}

export function createBlankQuestion(type: QuestionType = 'short_text'): Question {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    label: 'New question',
    required: false,
    ...((type === 'single_choice' || type === 'multi_choice') && { options: ['Option 1', 'Option 2'] }),
    ...(type === 'scale' && { minValue: 1, maxValue: 10 }),
  };
}

export function countQuestions(q: Questionnaire): number {
  return q.sections.reduce((sum, s) => sum + s.questions.length, 0);
}
