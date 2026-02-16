// Mock data for development — the UI is fully demonstrable without a backend

export interface MockClient {
  id: string;
  trainer_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  status: 'active' | 'at-risk' | 'inactive';
  compliance: number;
  lastActive: string;
  joinedAt: string;
  workoutsAssigned: number;
  workoutsCompleted: number;
  currentStreak: number;
  flags: string[];
}

export interface MockWorkout {
  id: string;
  client_id: string;
  trainer_id: string;
  name: string;
  week?: number;
  day?: number;
  notes?: string;
  exercises: MockExercise[];
  created_at: string;
}

export interface MockExercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  sets?: number;
  reps?: string;
  rpe?: number;
  rest?: string;
  notes?: string;
  order_index: number;
}

export interface MockLoggedSet {
  id: string;
  client_id: string;
  client_name: string;
  exercise_name: string;
  reps: number;
  weight?: number;
  completed_at: string;
}

export interface MockMessage {
  id: string;
  client_id: string;
  client_name: string;
  sender: 'coach' | 'client';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface MockNotification {
  id: string;
  type: 'check-in' | 'message' | 'milestone' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  client_id?: string;
}

export interface MockTemplate {
  id: string;
  trainer_id: string;
  name: string;
  description: string;
  weeks: number;
  days_per_week: number;
  exercise_count: number;
  is_public: boolean;
  created_at: string;
}

export interface MockTemplateExercise {
  id: string;
  template_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  order_index: number;
}

// --- Clients ---
export const mockClients: MockClient[] = [
  {
    id: 'c1', trainer_id: 'coach-1', name: 'James Wilson', email: 'james@email.com',
    status: 'active', compliance: 94, lastActive: new Date(Date.now() - 2 * 3600000).toISOString(),
    joinedAt: '2025-09-15T00:00:00Z', workoutsAssigned: 48, workoutsCompleted: 45,
    currentStreak: 12, flags: [],
  },
  {
    id: 'c2', trainer_id: 'coach-1', name: 'Maria Santos', email: 'maria@email.com',
    status: 'active', compliance: 88, lastActive: new Date(Date.now() - 5 * 3600000).toISOString(),
    joinedAt: '2025-10-01T00:00:00Z', workoutsAssigned: 36, workoutsCompleted: 32,
    currentStreak: 8, flags: [],
  },
  {
    id: 'c3', trainer_id: 'coach-1', name: 'Alex Chen', email: 'alex.c@email.com',
    status: 'at-risk', compliance: 52, lastActive: new Date(Date.now() - 8 * 86400000).toISOString(),
    joinedAt: '2025-08-20T00:00:00Z', workoutsAssigned: 56, workoutsCompleted: 29,
    currentStreak: 0, flags: ['Missed 3 sessions', 'No check-in this week'],
  },
  {
    id: 'c4', trainer_id: 'coach-1', name: 'Sophie Turner', email: 'sophie.t@email.com',
    status: 'active', compliance: 91, lastActive: new Date(Date.now() - 1 * 3600000).toISOString(),
    joinedAt: '2025-11-10T00:00:00Z', workoutsAssigned: 24, workoutsCompleted: 22,
    currentStreak: 15, flags: [],
  },
  {
    id: 'c5', trainer_id: 'coach-1', name: 'Mike Johnson', email: 'mike.j@email.com',
    status: 'at-risk', compliance: 41, lastActive: new Date(Date.now() - 14 * 86400000).toISOString(),
    joinedAt: '2025-07-05T00:00:00Z', workoutsAssigned: 64, workoutsCompleted: 26,
    currentStreak: 0, flags: ['Inactive 2 weeks', 'Low compliance'],
  },
  {
    id: 'c6', trainer_id: 'coach-1', name: 'Emma Davis', email: 'emma.d@email.com',
    status: 'active', compliance: 97, lastActive: new Date(Date.now() - 30 * 60000).toISOString(),
    joinedAt: '2025-06-01T00:00:00Z', workoutsAssigned: 80, workoutsCompleted: 78,
    currentStreak: 22, flags: [],
  },
  {
    id: 'c7', trainer_id: 'coach-1', name: 'Ryan Park', email: 'ryan.p@email.com',
    status: 'active', compliance: 76, lastActive: new Date(Date.now() - 2 * 86400000).toISOString(),
    joinedAt: '2025-12-01T00:00:00Z', workoutsAssigned: 16, workoutsCompleted: 12,
    currentStreak: 4, flags: [],
  },
  {
    id: 'c8', trainer_id: 'coach-1', name: 'Lisa Kim', email: 'lisa.k@email.com',
    status: 'inactive', compliance: 15, lastActive: new Date(Date.now() - 30 * 86400000).toISOString(),
    joinedAt: '2025-05-15T00:00:00Z', workoutsAssigned: 40, workoutsCompleted: 6,
    currentStreak: 0, flags: ['Inactive 30 days'],
  },
  {
    id: 'c9', trainer_id: 'coach-1', name: 'Tom Bradley', email: 'tom.b@email.com',
    status: 'active', compliance: 83, lastActive: new Date(Date.now() - 6 * 3600000).toISOString(),
    joinedAt: '2025-11-20T00:00:00Z', workoutsAssigned: 20, workoutsCompleted: 17,
    currentStreak: 6, flags: [],
  },
  {
    id: 'c10', trainer_id: 'coach-1', name: 'Nina Patel', email: 'nina.p@email.com',
    status: 'active', compliance: 89, lastActive: new Date(Date.now() - 12 * 3600000).toISOString(),
    joinedAt: '2025-10-15T00:00:00Z', workoutsAssigned: 32, workoutsCompleted: 28,
    currentStreak: 10, flags: [],
  },
  {
    id: 'c11', trainer_id: 'coach-1', name: 'Carlos Rivera', email: 'carlos.r@email.com',
    status: 'active', compliance: 72, lastActive: new Date(Date.now() - 3 * 86400000).toISOString(),
    joinedAt: '2025-09-01T00:00:00Z', workoutsAssigned: 44, workoutsCompleted: 32,
    currentStreak: 2, flags: ['Declining compliance'],
  },
  {
    id: 'c12', trainer_id: 'coach-1', name: 'Hannah Lee', email: 'hannah.l@email.com',
    status: 'active', compliance: 95, lastActive: new Date(Date.now() - 4 * 3600000).toISOString(),
    joinedAt: '2025-08-10T00:00:00Z', workoutsAssigned: 52, workoutsCompleted: 49,
    currentStreak: 18, flags: [],
  },
];

// --- Logged Sets (recent activity) ---
export const mockLoggedSets: MockLoggedSet[] = [
  { id: 'ls1', client_id: 'c6', client_name: 'Emma Davis', exercise_name: 'Barbell Squat', reps: 8, weight: 80, completed_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'ls2', client_id: 'c6', client_name: 'Emma Davis', exercise_name: 'Romanian Deadlift', reps: 10, weight: 65, completed_at: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: 'ls3', client_id: 'c4', client_name: 'Sophie Turner', exercise_name: 'Bench Press', reps: 6, weight: 50, completed_at: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: 'ls4', client_id: 'c1', client_name: 'James Wilson', exercise_name: 'Pull-ups', reps: 12, weight: undefined, completed_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'ls5', client_id: 'c1', client_name: 'James Wilson', exercise_name: 'Overhead Press', reps: 8, weight: 45, completed_at: new Date(Date.now() - 2.5 * 3600000).toISOString() },
  { id: 'ls6', client_id: 'c12', client_name: 'Hannah Lee', exercise_name: 'Hip Thrust', reps: 12, weight: 90, completed_at: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 'ls7', client_id: 'c2', client_name: 'Maria Santos', exercise_name: 'Lat Pulldown', reps: 10, weight: 40, completed_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'ls8', client_id: 'c9', client_name: 'Tom Bradley', exercise_name: 'Dumbbell Row', reps: 10, weight: 30, completed_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 'ls9', client_id: 'c10', client_name: 'Nina Patel', exercise_name: 'Leg Press', reps: 12, weight: 120, completed_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: 'ls10', client_id: 'c7', client_name: 'Ryan Park', exercise_name: 'Incline Bench', reps: 8, weight: 55, completed_at: new Date(Date.now() - 24 * 3600000).toISOString() },
];

// --- Messages ---
export const mockMessages: MockMessage[] = [
  { id: 'm1', client_id: 'c1', client_name: 'James Wilson', sender: 'client', content: 'Hey coach, feeling great after today\'s session! The new program is really working.', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), read: false },
  { id: 'm2', client_id: 'c3', client_name: 'Alex Chen', sender: 'client', content: 'Sorry I missed this week, had some family stuff. Will be back Monday.', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), read: false },
  { id: 'm3', client_id: 'c6', client_name: 'Emma Davis', sender: 'client', content: 'Just hit a new PR on squats! 80kg for 8 reps!', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
  { id: 'm4', client_id: 'c4', client_name: 'Sophie Turner', sender: 'coach', content: 'Great work on your bench press progression! Let\'s add 2.5kg next week.', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: true },
  { id: 'm5', client_id: 'c2', client_name: 'Maria Santos', sender: 'client', content: 'Can we adjust my diet plan? I think I need more carbs on training days.', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), read: true },
  { id: 'm6', client_id: 'c5', client_name: 'Mike Johnson', sender: 'coach', content: 'Hey Mike, I noticed you haven\'t checked in lately. Everything okay?', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), read: true },
  { id: 'm7', client_id: 'c12', client_name: 'Hannah Lee', sender: 'client', content: 'Should I deload this week? Feeling a bit fatigued.', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), read: false },
  { id: 'm8', client_id: 'c9', client_name: 'Tom Bradley', sender: 'client', content: 'Thanks for the form tips on deadlifts, made a huge difference!', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), read: true },
];

// --- Notifications ---
export const mockNotifications: MockNotification[] = [
  { id: 'n1', type: 'check-in', title: 'New Check-in', message: 'Emma Davis submitted a check-in', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: false, client_id: 'c6' },
  { id: 'n2', type: 'milestone', title: 'Streak Milestone', message: 'Hannah Lee hit an 18-day streak!', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false, client_id: 'c12' },
  { id: 'n3', type: 'alert', title: 'Client At-Risk', message: 'Mike Johnson has been inactive for 14 days', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), read: false, client_id: 'c5' },
  { id: 'n4', type: 'message', title: 'New Message', message: 'Alex Chen sent you a message', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), read: false, client_id: 'c3' },
  { id: 'n5', type: 'check-in', title: 'New Check-in', message: 'James Wilson submitted a check-in', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), read: true, client_id: 'c1' },
  { id: 'n6', type: 'milestone', title: 'New PR', message: 'Sophie Turner set a new bench press PR', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), read: true, client_id: 'c4' },
  { id: 'n7', type: 'alert', title: 'Declining Compliance', message: 'Carlos Rivera compliance dropped below 75%', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), read: true, client_id: 'c11' },
];

// --- Templates ---
export const mockTemplates: MockTemplate[] = [
  { id: 't1', trainer_id: 'coach-1', name: 'Hypertrophy A - Upper/Lower', description: 'Classic upper/lower split for muscle growth. 4 days per week with progressive overload.', weeks: 8, days_per_week: 4, exercise_count: 24, is_public: false, created_at: '2025-11-01T00:00:00Z' },
  { id: 't2', trainer_id: 'coach-1', name: 'Strength Block', description: 'Peaking block focused on compound lifts with heavy singles and doubles.', weeks: 4, days_per_week: 3, exercise_count: 15, is_public: false, created_at: '2025-10-15T00:00:00Z' },
  { id: 't3', trainer_id: 'coach-1', name: 'Beginner Full Body', description: 'Introductory full-body program for new clients. Focus on movement quality.', weeks: 12, days_per_week: 3, exercise_count: 18, is_public: true, created_at: '2025-09-01T00:00:00Z' },
  { id: 't4', trainer_id: 'coach-1', name: 'PPL Advanced', description: 'Push/Pull/Legs split with advanced techniques: drop sets, rest-pause, myo reps.', weeks: 6, days_per_week: 6, exercise_count: 36, is_public: false, created_at: '2025-12-01T00:00:00Z' },
  { id: 't5', trainer_id: 'coach-1', name: 'Cut Maintenance', description: 'Reduced volume program to maintain strength during a calorie deficit.', weeks: 8, days_per_week: 3, exercise_count: 12, is_public: true, created_at: '2025-11-20T00:00:00Z' },
];

export const mockTemplateExercises: MockTemplateExercise[] = [
  { id: 'te1', template_id: 't1', exercise_name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest_seconds: 120, notes: 'Pause at bottom', order_index: 0 },
  { id: 'te2', template_id: 't1', exercise_name: 'Barbell Row', sets: 4, reps: '8-10', rest_seconds: 120, notes: '', order_index: 1 },
  { id: 'te3', template_id: 't1', exercise_name: 'Overhead Press', sets: 3, reps: '8-12', rest_seconds: 90, notes: 'Strict form', order_index: 2 },
  { id: 'te4', template_id: 't1', exercise_name: 'Lat Pulldown', sets: 3, reps: '10-12', rest_seconds: 90, notes: '', order_index: 3 },
  { id: 'te5', template_id: 't1', exercise_name: 'Dumbbell Curl', sets: 3, reps: '12-15', rest_seconds: 60, notes: 'Superset with tricep extension', order_index: 4 },
  { id: 'te6', template_id: 't1', exercise_name: 'Tricep Extension', sets: 3, reps: '12-15', rest_seconds: 60, notes: '', order_index: 5 },
  { id: 'te7', template_id: 't1', exercise_name: 'Barbell Squat', sets: 4, reps: '6-8', rest_seconds: 180, notes: 'ATG depth', order_index: 6 },
  { id: 'te8', template_id: 't1', exercise_name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest_seconds: 120, notes: '', order_index: 7 },
  { id: 'te9', template_id: 't1', exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_seconds: 120, notes: '', order_index: 8 },
  { id: 'te10', template_id: 't1', exercise_name: 'Leg Curl', sets: 3, reps: '12-15', rest_seconds: 60, notes: '', order_index: 9 },
  { id: 'te11', template_id: 't1', exercise_name: 'Calf Raise', sets: 4, reps: '15-20', rest_seconds: 60, notes: 'Slow eccentric', order_index: 10 },
];

// --- Workouts assigned to clients ---
export const mockWorkouts: MockWorkout[] = [
  {
    id: 'w1', client_id: 'c1', trainer_id: 'coach-1', name: 'Upper Body A', week: 4, day: 1, notes: 'Push focus',
    exercises: [
      { id: 'e1', workout_id: 'w1', exercise_name: 'Bench Press', sets: 4, reps: '6-8', rpe: 8, rest: '3min', notes: '', order_index: 0 },
      { id: 'e2', workout_id: 'w1', exercise_name: 'Overhead Press', sets: 3, reps: '8-10', rpe: 7, rest: '2min', notes: '', order_index: 1 },
      { id: 'e3', workout_id: 'w1', exercise_name: 'Incline DB Press', sets: 3, reps: '10-12', rest: '90s', notes: '', order_index: 2 },
    ],
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'w2', client_id: 'c1', trainer_id: 'coach-1', name: 'Lower Body A', week: 4, day: 2,
    exercises: [
      { id: 'e4', workout_id: 'w2', exercise_name: 'Squat', sets: 4, reps: '5', rpe: 9, rest: '4min', notes: 'Belt up', order_index: 0 },
      { id: 'e5', workout_id: 'w2', exercise_name: 'RDL', sets: 3, reps: '8-10', rest: '2min', notes: '', order_index: 1 },
    ],
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'w3', client_id: 'c6', trainer_id: 'coach-1', name: 'Full Body', week: 8, day: 1,
    exercises: [
      { id: 'e6', workout_id: 'w3', exercise_name: 'Barbell Squat', sets: 4, reps: '8', rest: '3min', notes: '', order_index: 0 },
      { id: 'e7', workout_id: 'w3', exercise_name: 'Hip Thrust', sets: 4, reps: '10-12', rest: '2min', notes: '', order_index: 1 },
      { id: 'e8', workout_id: 'w3', exercise_name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '90s', notes: '', order_index: 2 },
    ],
    created_at: '2026-01-15T00:00:00Z',
  },
];

// --- Analytics data ---
export const mockWeeklyCompliance = [
  { week: 'W1', compliance: 78 },
  { week: 'W2', compliance: 81 },
  { week: 'W3', compliance: 76 },
  { week: 'W4', compliance: 84 },
  { week: 'W5', compliance: 82 },
  { week: 'W6', compliance: 79 },
  { week: 'W7', compliance: 85 },
  { week: 'W8', compliance: 83 },
];

export const mockWeeklyActivity = [
  { week: 'W1', sets: 342 },
  { week: 'W2', sets: 378 },
  { week: 'W3', sets: 310 },
  { week: 'W4', sets: 395 },
  { week: 'W5', sets: 402 },
  { week: 'W6', sets: 368 },
  { week: 'W7', sets: 415 },
  { week: 'W8', sets: 390 },
];
