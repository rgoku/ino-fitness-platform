// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  hasOnboarded: boolean;
  subscriptionTier: 'free' | 'coach_pro' | 'premium_ai';
  biometricsEnabled: boolean;
}

export interface UserBiometrics {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: Goal[];
}

export type Goal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance' | 'strength';

// Macros Types
export interface Macros {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface DailyMacros extends Macros {
  date: string;
  consumed: Macros;
  remaining: Macros;
}

// Diet Types
export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  macros: Macros;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl?: string;
  swappable: boolean;
  alternativeMeals?: Meal[];
}

export interface DietPlan {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  meals: Meal[];
  weeklyPlan: { [day: string]: Meal[] };
  generatedBy: 'ai' | 'coach';
  coachId?: string;
  citations?: string[]; // PubMed citations
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  macros: Macros;
}

// Workout Types
export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  videoUrl?: string;
  imageUrl?: string;
  sets: number;
  reps: number;
  weight?: number; // kg
  restSeconds: number;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  exercises: Exercise[];
  duration: number; // minutes
  generatedBy: 'ai' | 'coach';
  coachId?: string;
  createdOn: string;
}

export interface WorkoutSession {
  id: string;
  workoutPlanId: string;
  date: string;
  exercises: ExerciseSession[];
  completed: boolean;
  duration: number; // minutes
}

export interface ExerciseSession {
  exerciseId: string;
  sets: Set[];
  notes?: string;
  formCheckVideoUrl?: string;
}

export interface Set {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  restSeconds?: number;
}

// Progress Types
export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: BodyMeasurements;
  photos?: string[];
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  achievedAt: string;
  type: 'streak' | 'workout' | 'diet' | 'achievement';
}

// Coach Types
export interface Coach {
  id: string;
  userId: string;
  name: string;
  bio: string;
  specialties: string[];
  photoUrl?: string;
  clients: string[]; // User IDs
  createdAt: string;
}

export interface Message {
  id: string;
  userId: string;
  coachId?: string;
  senderType: 'user' | 'coach' | 'ai';
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

// AI Types
export interface FoodDetectionResult {
  foods: DetectedFood[];
  macros: Macros;
  confidence: number;
}

export interface DetectedFood {
  name: string;
  portionSize: number;
  unit: string;
  macros: Macros;
  confidence: number;
}

export interface FormAnalysisResult {
  exerciseName: string;
  repCount: number;
  feedback: FormFeedback[];
  score: number; // 0-100
}

export interface FormFeedback {
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  timestamp: number; // seconds into video
}

// Subscription Types
export type SubscriptionTier = 'free' | 'coach_pro' | 'premium_ai';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  stripeSubscriptionId: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

