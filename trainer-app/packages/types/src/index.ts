/**
 * Core domain types for the trainer app
 * Shared between mobile and web apps
 */

// User & Auth
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'trainer' | 'admin';
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

// Reminders
export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  message: string;
  remind_at: string; // ISO datetime
  repeat?: string; // ISO interval or cron
  channel: 'in-app' | 'push' | 'email';
  sent: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateReminderRequest {
  title: string;
  remind_at: string;
  message?: string;
  repeat?: string;
  channel?: 'in-app' | 'push' | 'email';
}

// Diet Plans
export interface Meal {
  id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  nutritional_benefits?: string;
  research_backed: boolean;
}

export interface DietPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  calorie_target: number;
  protein_target: number;
  carb_target: number;
  fat_target: number;
  scientific_basis?: string;
  evidence_level: 'high' | 'moderate' | 'preliminary';
  research_citations?: string[];
  research_verified: boolean;
  meals: Meal[];
  supplement_recommendations?: Supplement[];
  created_at: string;
  updated_at: string;
}

export interface CreateDietPlanRequest {
  biometrics: {
    age: number;
    weight: number;
    height: number;
    goal: string;
  };
  preferences: {
    restrictions: string[];
    cuisines: string[];
  };
}

// Supplements
export interface Supplement {
  name: string;
  typical_dose: string;
  safety_notes: string;
  citations: string[];
  evidence_summary?: string;
  evidence_level: 'high' | 'moderate' | 'preliminary';
}

export interface SupplementRecommendation {
  user_id: string;
  goals: string[];
  supplements: Supplement[];
  generated_at: string;
}

// Workouts
export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_groups: string[];
  equipment: string[];
  sets: number;
  reps: number;
  rest_seconds: number;
  instructions: string[];
  video_url?: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // weeks
  focus_areas: string[];
  exercises: Exercise[];
  created_at: string;
  updated_at: string;
}

// Form Check
export interface FormCheckRequest {
  exercise_name: string;
  file: Blob;
  file_type: 'video/mp4' | 'image/jpeg' | 'image/png';
}

export interface FormCheckResult {
  exercise_name: string;
  score: number; // 0-100
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  warnings: string[];
  safety_level: 'safe' | 'caution' | 'dangerous';
}

// Progress
export interface ProgressEntry {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
  measurements?: Record<string, number>;
  mood?: string;
  notes?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Notification
export interface NotificationPayload {
  channel: 'in-app' | 'push' | 'email';
  title: string;
  message: string;
  data?: Record<string, any>;
}

// Stats
export interface ClientStats {
  total_clients: number;
  active_clients: number;
  pending_approval: number;
  total_plans_created: number;
  avg_client_adherence: number;
}

// ============================================
// Supabase Trainer Portal Types
// ============================================

// Clients
export interface Client {
  id: string;
  trainer_id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  avatar_url?: string;
}

// Workouts (Trainer-assigned)
export interface TrainerWorkout {
  id: string;
  client_id: string;
  trainer_id: string;
  name: string;
  week?: number;
  day?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateTrainerWorkoutRequest {
  client_id: string;
  name: string;
  week?: number;
  day?: number;
  notes?: string;
}

// Workout Exercises
export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_name: string;
  sets?: number;
  reps?: string;
  rpe?: string;
  rest?: string;
  video_url?: string;
  notes?: string;
  order_index?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateWorkoutExerciseRequest {
  workout_id: string;
  exercise_name: string;
  sets?: number;
  reps?: string;
  rpe?: string;
  rest?: string;
  video_url?: string;
  notes?: string;
  order_index?: number;
}

// Logged Sets (workout history)
export interface LoggedSet {
  id: string;
  client_id: string;
  workout_exercise_id: string;
  reps: number;
  weight?: number;
  completed_at: string;
  created_at: string;
}

export interface CreateLoggedSetRequest {
  client_id: string;
  workout_exercise_id: string;
  reps: number;
  weight?: number;
}

// Trophies and Achievements
export type TrophyType = 'workout_count' | 'pr' | 'streak' | 'bodyweight' | 'custom';

export interface Trophy {
  id: string;
  title: string;
  description?: string;
  icon: string;
  type: TrophyType;
  threshold?: number;
  created_by_trainer: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClientTrophy {
  id: string;
  client_id: string;
  trophy_id: string;
  awarded_at: string;
}

export interface CreateTrophyRequest {
  title: string;
  description?: string;
  icon?: string;
  type: TrophyType;
  threshold?: number;
}

// Workout Statistics
export interface WorkoutStats {
  client_id: string;
  total_workouts_completed: number;
  total_exercises: number;
  total_sets_logged: number;
  avg_reps_per_set: number;
  personal_records: number;
}
