// Mock data for development — swap to Supabase services for production

export interface ClientHealthProfile {
  sex: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  bodyFatPercent: number;
  dailySteps: number;
  occupation: 'sedentary-desk' | 'lightly-active' | 'active-job' | 'very-active-job';
  activityLevel: string;
  diabetes: 'none' | 'type1' | 'type2' | 'pre-diabetic';
  pcos: boolean;
  thyroid: 'none' | 'hypothyroid' | 'hyperthyroid';
  bloodPressure: 'normal' | 'high' | 'low';
  digestiveIssues: string[];
  allergies: string[];
  foodIntolerances: string[];
  injuries: string;
  pregnancyStatus: 'none' | 'pregnant' | 'breastfeeding';
}

export interface ClientLifestyleProfile {
  sleepHours: number;
  caffeineTolerance: 'none' | 'low' | 'moderate' | 'high';
  alcohol: 'none' | 'occasional' | 'moderate' | 'heavy';
  waterIntake: number;
  stressEating: boolean;
  lateNightSnacking: boolean;
  currentSupplements: string[];
}

export interface ClientFoodPreferences {
  proteinSources: string[];
  carbSources: string[];
  fatSources: string[];
  hatedFoods: string;
  restrictions: string[];
  cuisines: string[];
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  mealPrepTime: 15 | 30 | 45 | 60;
}

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
  healthProfile?: ClientHealthProfile;
  lifestyleProfile?: ClientLifestyleProfile;
  foodPreferences?: ClientFoodPreferences;
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
    id: 'c1', trainer_id: 'coach-1', name: 'James W.', email: 'jameswilson88@gmail.com',
    status: 'active', compliance: 94, lastActive: new Date(Date.now() - 2 * 3600000).toISOString(),
    joinedAt: '2025-09-15T00:00:00Z', workoutsAssigned: 48, workoutsCompleted: 45,
    currentStreak: 12, flags: [],
    healthProfile: {
      sex: 'male', age: 28, weight: 85, height: 178, bodyFatPercent: 14, dailySteps: 10000,
      occupation: 'sedentary-desk', activityLevel: 'active',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: [], allergies: [], foodIntolerances: [], injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 7.5, caffeineTolerance: 'moderate', alcohol: 'occasional', waterIntake: 3,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['creatine', 'whey protein'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'beef', 'fish', 'eggs', 'whey', 'greek-yogurt'],
      carbSources: ['rice', 'potatoes', 'oats', 'sweet-potato'],
      fatSources: ['avocado', 'nuts', 'olive-oil'],
      hatedFoods: '', restrictions: [], cuisines: ['mediterranean', 'asian'],
      cookingSkill: 'intermediate', mealPrepTime: 30,
    },
  },
  {
    id: 'c2', trainer_id: 'coach-1', name: 'Maria S.', email: 'maria.santos@outlook.com',
    status: 'active', compliance: 88, lastActive: new Date(Date.now() - 5 * 3600000).toISOString(),
    joinedAt: '2025-10-01T00:00:00Z', workoutsAssigned: 36, workoutsCompleted: 32,
    currentStreak: 8, flags: [],
    healthProfile: {
      sex: 'female', age: 32, weight: 62, height: 165, bodyFatPercent: 22, dailySteps: 8000,
      occupation: 'lightly-active', activityLevel: 'moderate',
      diabetes: 'none', pcos: true, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: [], allergies: [], foodIntolerances: [], injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 7, caffeineTolerance: 'low', alcohol: 'none', waterIntake: 2.5,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['vitamin d', 'iron', 'inositol'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'fish', 'eggs', 'greek-yogurt'],
      carbSources: ['rice', 'sweet-potato', 'quinoa', 'fruits'],
      fatSources: ['avocado', 'olive-oil', 'nuts'],
      hatedFoods: 'liver', restrictions: [], cuisines: ['mediterranean', 'latin-american'],
      cookingSkill: 'intermediate', mealPrepTime: 30,
    },
  },
  {
    id: 'c3', trainer_id: 'coach-1', name: 'Alex Chen', email: 'alexc.dev@gmail.com',
    status: 'at-risk', compliance: 52, lastActive: new Date(Date.now() - 8 * 86400000).toISOString(),
    joinedAt: '2025-08-20T00:00:00Z', workoutsAssigned: 56, workoutsCompleted: 29,
    currentStreak: 0, flags: ['3 missed sessions', 'No check-in since Feb 8'],
    healthProfile: {
      sex: 'male', age: 26, weight: 88, height: 175, bodyFatPercent: 18, dailySteps: 6000,
      occupation: 'sedentary-desk', activityLevel: 'light',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: [], allergies: [], foodIntolerances: [], injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 6, caffeineTolerance: 'high', alcohol: 'moderate', waterIntake: 2,
      stressEating: true, lateNightSnacking: true, currentSupplements: ['creatine'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'beef', 'eggs', 'whey'],
      carbSources: ['rice', 'pasta', 'bread', 'potatoes'],
      fatSources: ['peanut-butter', 'cheese', 'butter'],
      hatedFoods: 'mushrooms, Brussels sprouts', restrictions: [], cuisines: ['north-american', 'asian'],
      cookingSkill: 'beginner', mealPrepTime: 15,
    },
  },
  {
    id: 'c4', trainer_id: 'coach-1', name: 'Sophie T.', email: 'sophiet@icloud.com',
    status: 'active', compliance: 91, lastActive: new Date(Date.now() - 1 * 3600000).toISOString(),
    joinedAt: '2025-11-10T00:00:00Z', workoutsAssigned: 24, workoutsCompleted: 22,
    currentStreak: 15, flags: [],
    healthProfile: {
      sex: 'female', age: 24, weight: 58, height: 168, bodyFatPercent: 20, dailySteps: 12000,
      occupation: 'lightly-active', activityLevel: 'active',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: [], allergies: [], foodIntolerances: ['gluten'], injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 8, caffeineTolerance: 'low', alcohol: 'occasional', waterIntake: 2.5,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['vitamin b12', 'iron', 'omega-3 algae'],
    },
    foodPreferences: {
      proteinSources: ['tofu', 'eggs', 'greek-yogurt'],
      carbSources: ['quinoa', 'sweet-potato', 'oats', 'fruits', 'rice'],
      fatSources: ['avocado', 'nuts', 'olive-oil', 'coconut-oil'],
      hatedFoods: '', restrictions: ['vegetarian', 'gluten-free'], cuisines: ['mediterranean', 'indian', 'asian'],
      cookingSkill: 'advanced', mealPrepTime: 45,
    },
  },
  {
    id: 'c5', trainer_id: 'coach-1', name: 'Mike J.', email: 'mjohnson@yahoo.com',
    status: 'at-risk', compliance: 41, lastActive: new Date(Date.now() - 14 * 86400000).toISOString(),
    joinedAt: '2025-07-05T00:00:00Z', workoutsAssigned: 64, workoutsCompleted: 26,
    currentStreak: 0, flags: ['Gone quiet — 2 weeks', 'Was at 78% last month'],
    healthProfile: {
      sex: 'male', age: 34, weight: 95, height: 182, bodyFatPercent: 24, dailySteps: 5000,
      occupation: 'sedentary-desk', activityLevel: 'light',
      diabetes: 'pre-diabetic', pcos: false, thyroid: 'none', bloodPressure: 'high',
      digestiveIssues: ['gerd'], allergies: [], foodIntolerances: [], injuries: 'Lower back herniation L4-L5', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 5.5, caffeineTolerance: 'high', alcohol: 'moderate', waterIntake: 1.5,
      stressEating: true, lateNightSnacking: true, currentSupplements: ['multivitamin'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'beef', 'turkey', 'eggs'],
      carbSources: ['rice', 'potatoes', 'bread', 'pasta'],
      fatSources: ['cheese', 'butter', 'peanut-butter'],
      hatedFoods: 'fish, tofu', restrictions: [], cuisines: ['north-american', 'latin-american'],
      cookingSkill: 'beginner', mealPrepTime: 15,
    },
  },
  {
    id: 'c6', trainer_id: 'coach-1', name: 'Emma D.', email: 'emmad.fitness@gmail.com',
    status: 'active', compliance: 97, lastActive: new Date(Date.now() - 30 * 60000).toISOString(),
    joinedAt: '2025-06-01T00:00:00Z', workoutsAssigned: 80, workoutsCompleted: 78,
    currentStreak: 22, flags: [],
    healthProfile: {
      sex: 'female', age: 27, weight: 64, height: 170, bodyFatPercent: 18, dailySteps: 12000,
      occupation: 'lightly-active', activityLevel: 'very-active',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: [], allergies: [], foodIntolerances: [], injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 8, caffeineTolerance: 'moderate', alcohol: 'none', waterIntake: 3,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['creatine', 'caffeine'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'turkey', 'fish', 'eggs', 'tofu', 'greek-yogurt'],
      carbSources: ['rice', 'oats', 'sweet-potato', 'quinoa', 'fruits'],
      fatSources: ['avocado', 'nuts', 'olive-oil'],
      hatedFoods: '', restrictions: [], cuisines: ['mediterranean', 'asian'],
      cookingSkill: 'advanced', mealPrepTime: 45,
    },
  },
  {
    id: 'c7', trainer_id: 'coach-1', name: 'Ryan Park', email: 'ryanp@hotmail.com',
    status: 'active', compliance: 76, lastActive: new Date(Date.now() - 2 * 86400000).toISOString(),
    joinedAt: '2025-12-01T00:00:00Z', workoutsAssigned: 16, workoutsCompleted: 12,
    currentStreak: 4, flags: [],
    healthProfile: {
      sex: 'male', age: 22, weight: 75, height: 180, bodyFatPercent: 15, dailySteps: 8000,
      occupation: 'sedentary-desk', activityLevel: 'moderate',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: [], allergies: ['shellfish'], foodIntolerances: [], injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 7, caffeineTolerance: 'moderate', alcohol: 'occasional', waterIntake: 2.5,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['whey protein'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'beef', 'fish', 'eggs', 'whey'],
      carbSources: ['rice', 'potatoes', 'oats', 'pasta'],
      fatSources: ['peanut-butter', 'nuts', 'olive-oil'],
      hatedFoods: '', restrictions: [], cuisines: ['asian', 'north-american'],
      cookingSkill: 'beginner', mealPrepTime: 15,
    },
  },
  {
    id: 'c8', trainer_id: 'coach-1', name: 'Lisa Kim', email: 'lisakfit@gmail.com',
    status: 'inactive', compliance: 15, lastActive: new Date(Date.now() - 30 * 86400000).toISOString(),
    joinedAt: '2025-05-15T00:00:00Z', workoutsAssigned: 40, workoutsCompleted: 6,
    currentStreak: 0, flags: ['Inactive 30+ days'],
    healthProfile: {
      sex: 'female', age: 29, weight: 55, height: 160, bodyFatPercent: 25, dailySteps: 4000,
      occupation: 'sedentary-desk', activityLevel: 'sedentary',
      diabetes: 'none', pcos: false, thyroid: 'hypothyroid', bloodPressure: 'low',
      digestiveIssues: [], allergies: [], foodIntolerances: ['lactose'], injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 6, caffeineTolerance: 'none', alcohol: 'none', waterIntake: 1.5,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['levothyroxine', 'vitamin d', 'selenium'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'fish', 'tofu', 'eggs'],
      carbSources: ['rice', 'sweet-potato', 'fruits'],
      fatSources: ['avocado', 'olive-oil', 'coconut-oil'],
      hatedFoods: 'red meat', restrictions: ['dairy-free'], cuisines: ['asian', 'mediterranean'],
      cookingSkill: 'intermediate', mealPrepTime: 30,
    },
  },
  {
    id: 'c9', trainer_id: 'coach-1', name: 'Tom B.', email: 'tombradley@pm.me',
    status: 'active', compliance: 83, lastActive: new Date(Date.now() - 6 * 3600000).toISOString(),
    joinedAt: '2025-11-20T00:00:00Z', workoutsAssigned: 20, workoutsCompleted: 17,
    currentStreak: 6, flags: [],
    healthProfile: {
      sex: 'male', age: 30, weight: 82, height: 176, bodyFatPercent: 16, dailySteps: 10000,
      occupation: 'active-job', activityLevel: 'active',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: [], allergies: [], foodIntolerances: [], injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 7.5, caffeineTolerance: 'moderate', alcohol: 'occasional', waterIntake: 3,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['creatine', 'fish oil'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'beef', 'fish', 'turkey', 'eggs', 'whey'],
      carbSources: ['rice', 'potatoes', 'oats', 'bread', 'sweet-potato'],
      fatSources: ['avocado', 'nuts', 'peanut-butter', 'olive-oil'],
      hatedFoods: '', restrictions: [], cuisines: ['north-american', 'mediterranean'],
      cookingSkill: 'intermediate', mealPrepTime: 30,
    },
  },
  {
    id: 'c10', trainer_id: 'coach-1', name: 'Nina P.', email: 'nina.patel@live.com',
    status: 'active', compliance: 89, lastActive: new Date(Date.now() - 12 * 3600000).toISOString(),
    joinedAt: '2025-10-15T00:00:00Z', workoutsAssigned: 32, workoutsCompleted: 28,
    currentStreak: 10, flags: [],
    healthProfile: {
      sex: 'female', age: 28, weight: 60, height: 163, bodyFatPercent: 21, dailySteps: 10000,
      occupation: 'lightly-active', activityLevel: 'moderate',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: [], allergies: ['peanuts'], foodIntolerances: ['lactose'],
      injuries: '', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 7, caffeineTolerance: 'low', alcohol: 'none', waterIntake: 2.5,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['calcium', 'vitamin d'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'fish', 'turkey', 'eggs', 'greek-yogurt'],
      carbSources: ['rice', 'quinoa', 'sweet-potato', 'fruits', 'oats'],
      fatSources: ['avocado', 'olive-oil', 'coconut-oil'],
      hatedFoods: 'peanuts, shellfish', restrictions: ['nut-allergy'], cuisines: ['indian', 'mediterranean', 'asian'],
      cookingSkill: 'intermediate', mealPrepTime: 30,
    },
  },
  {
    id: 'c11', trainer_id: 'coach-1', name: 'Carlos R.', email: 'carlosrivera@gmail.com',
    status: 'active', compliance: 72, lastActive: new Date(Date.now() - 3 * 86400000).toISOString(),
    joinedAt: '2025-09-01T00:00:00Z', workoutsAssigned: 44, workoutsCompleted: 32,
    currentStreak: 2, flags: ['Consistency dropping'],
    healthProfile: {
      sex: 'male', age: 31, weight: 90, height: 178, bodyFatPercent: 19, dailySteps: 7000,
      occupation: 'sedentary-desk', activityLevel: 'moderate',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'high',
      digestiveIssues: [], allergies: [], foodIntolerances: [], injuries: 'Rotator cuff strain (right)', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 6.5, caffeineTolerance: 'high', alcohol: 'occasional', waterIntake: 2,
      stressEating: true, lateNightSnacking: false, currentSupplements: ['fish oil', 'magnesium'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'beef', 'turkey', 'eggs', 'whey'],
      carbSources: ['rice', 'potatoes', 'pasta', 'bread'],
      fatSources: ['cheese', 'peanut-butter', 'olive-oil', 'butter'],
      hatedFoods: 'tofu, liver', restrictions: [], cuisines: ['latin-american', 'north-american', 'middle-eastern'],
      cookingSkill: 'intermediate', mealPrepTime: 30,
    },
  },
  {
    id: 'c12', trainer_id: 'coach-1', name: 'Hannah L.', email: 'hannah.lee@outlook.com',
    status: 'active', compliance: 95, lastActive: new Date(Date.now() - 4 * 3600000).toISOString(),
    joinedAt: '2025-08-10T00:00:00Z', workoutsAssigned: 52, workoutsCompleted: 49,
    currentStreak: 18, flags: [],
    healthProfile: {
      sex: 'female', age: 25, weight: 66, height: 172, bodyFatPercent: 19, dailySteps: 12000,
      occupation: 'lightly-active', activityLevel: 'active',
      diabetes: 'none', pcos: false, thyroid: 'none', bloodPressure: 'normal',
      digestiveIssues: ['ibs'], allergies: [], foodIntolerances: ['fructose'],
      injuries: 'Knee tendinitis (left)', pregnancyStatus: 'none',
    },
    lifestyleProfile: {
      sleepHours: 7, caffeineTolerance: 'moderate', alcohol: 'none', waterIntake: 2.8,
      stressEating: false, lateNightSnacking: false, currentSupplements: ['turmeric', 'fish oil', 'probiotics'],
    },
    foodPreferences: {
      proteinSources: ['chicken', 'fish', 'turkey', 'eggs', 'whey', 'greek-yogurt'],
      carbSources: ['rice', 'oats', 'sweet-potato', 'quinoa'],
      fatSources: ['avocado', 'nuts', 'olive-oil'],
      hatedFoods: 'spicy food, garlic', restrictions: [], cuisines: ['mediterranean', 'asian', 'north-american'],
      cookingSkill: 'advanced', mealPrepTime: 45,
    },
  },
];

// --- Logged Sets (recent activity) ---
export const mockLoggedSets: MockLoggedSet[] = [
  { id: 'ls1', client_id: 'c6', client_name: 'Emma D.', exercise_name: 'Barbell Squat', reps: 8, weight: 80, completed_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'ls2', client_id: 'c6', client_name: 'Emma D.', exercise_name: 'Romanian Deadlift', reps: 10, weight: 65, completed_at: new Date(Date.now() - 35 * 60000).toISOString() },
  { id: 'ls3', client_id: 'c4', client_name: 'Sophie T.', exercise_name: 'Bench Press', reps: 6, weight: 50, completed_at: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: 'ls4', client_id: 'c1', client_name: 'James W.', exercise_name: 'Pull-ups', reps: 12, weight: undefined, completed_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'ls5', client_id: 'c1', client_name: 'James W.', exercise_name: 'OHP', reps: 8, weight: 45, completed_at: new Date(Date.now() - 2.5 * 3600000).toISOString() },
  { id: 'ls6', client_id: 'c12', client_name: 'Hannah L.', exercise_name: 'Hip Thrust', reps: 12, weight: 90, completed_at: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 'ls7', client_id: 'c2', client_name: 'Maria S.', exercise_name: 'Lat Pulldown', reps: 10, weight: 40, completed_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'ls8', client_id: 'c9', client_name: 'Tom B.', exercise_name: 'DB Row', reps: 10, weight: 30, completed_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 'ls9', client_id: 'c10', client_name: 'Nina P.', exercise_name: 'Leg Press', reps: 12, weight: 120, completed_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: 'ls10', client_id: 'c7', client_name: 'Ryan Park', exercise_name: 'Incline Bench', reps: 8, weight: 55, completed_at: new Date(Date.now() - 24 * 3600000).toISOString() },
];

// --- Messages ---
export const mockMessages: MockMessage[] = [
  { id: 'm1', client_id: 'c1', client_name: 'James W.', sender: 'client', content: 'hey, felt really good today. think the deload helped a lot', timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), read: false },
  { id: 'm2', client_id: 'c3', client_name: 'Alex Chen', sender: 'client', content: 'sorry for going MIA, had some stuff come up with family. back on monday for sure', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), read: false },
  { id: 'm3', client_id: 'c6', client_name: 'Emma D.', sender: 'client', content: 'PR!! 80kg x 8 on squat', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
  { id: 'm4', client_id: 'c4', client_name: 'Sophie T.', sender: 'coach', content: 'Bench is moving well — lets bump it 2.5kg next week and see how it feels', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: true },
  { id: 'm5', client_id: 'c2', client_name: 'Maria S.', sender: 'client', content: 'do u think I should add more carbs on training days? feeling kinda flat in the gym lately', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), read: true },
  { id: 'm6', client_id: 'c5', client_name: 'Mike J.', sender: 'coach', content: 'Hey Mike — noticed you\'ve been quiet. Everything alright? No pressure, just checking in', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), read: true },
  { id: 'm7', client_id: 'c12', client_name: 'Hannah L.', sender: 'client', content: 'think i need a deload this week, everything feels heavy and im not sleeping great', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), read: false },
  { id: 'm8', client_id: 'c9', client_name: 'Tom B.', sender: 'client', content: 'those deadlift cues you gave me were so helpful honestly, felt so much better', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), read: true },
];

// --- Notifications ---
export const mockNotifications: MockNotification[] = [
  { id: 'n1', type: 'check-in', title: 'Check-in from Emma', message: 'Emma D. logged her session', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: false, client_id: 'c6' },
  { id: 'n2', type: 'milestone', title: '18-day streak', message: 'Hannah L. is on a roll', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false, client_id: 'c12' },
  { id: 'n3', type: 'alert', title: 'Mike went quiet', message: 'No activity in 14 days', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), read: false, client_id: 'c5' },
  { id: 'n4', type: 'message', title: 'New message', message: 'Alex Chen sent a message', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), read: false, client_id: 'c3' },
  { id: 'n5', type: 'check-in', title: 'Check-in from James', message: 'James W. logged his session', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), read: true, client_id: 'c1' },
  { id: 'n6', type: 'milestone', title: 'New PR', message: 'Sophie T. hit a bench press PR', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), read: true, client_id: 'c4' },
  { id: 'n7', type: 'alert', title: 'Consistency dip', message: 'Carlos R. dropped below 75%', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), read: true, client_id: 'c11' },
];

// --- Templates ---
export const mockTemplates: MockTemplate[] = [
  { id: 't1', trainer_id: 'coach-1', name: 'Hypertrophy A — Upper/Lower', description: 'My go-to for intermediate clients. 4x/week upper-lower with RPE-based progression. Been running variations of this since 2023.', weeks: 8, days_per_week: 4, exercise_count: 24, is_public: false, created_at: '2025-11-01T00:00:00Z' },
  { id: 't2', trainer_id: 'coach-1', name: 'Peaking Block (Strength)', description: '4-week block for clients prepping for a max test or comp. Heavy singles/doubles on SBD, minimal accessories.', weeks: 4, days_per_week: 3, exercise_count: 15, is_public: false, created_at: '2025-10-15T00:00:00Z' },
  { id: 't3', trainer_id: 'coach-1', name: 'Onboarding — Full Body', description: 'For brand new clients. Keeps it simple: compound movements, moderate volume, focus on learning the patterns before adding load.', weeks: 12, days_per_week: 3, exercise_count: 18, is_public: true, created_at: '2025-09-01T00:00:00Z' },
  { id: 't4', trainer_id: 'coach-1', name: 'PPL (Advanced)', description: 'Push/Pull/Legs 6x/week. Drop sets, rest-pause, myo reps — the works. Only for clients who\'ve been training 2+ years.', weeks: 6, days_per_week: 6, exercise_count: 36, is_public: false, created_at: '2025-12-01T00:00:00Z' },
  { id: 't5', trainer_id: 'coach-1', name: 'Cut Phase — Maintenance', description: 'Stripped back volume to hold onto strength during a deficit. 3x/week, compounds only, no junk volume.', weeks: 8, days_per_week: 3, exercise_count: 12, is_public: true, created_at: '2025-11-20T00:00:00Z' },
];

export const mockTemplateExercises: MockTemplateExercise[] = [
  { id: 'te1', template_id: 't1', exercise_name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest_seconds: 120, notes: 'Pause at bottom', order_index: 0 },
  { id: 'te2', template_id: 't1', exercise_name: 'Barbell Row', sets: 4, reps: '8-10', rest_seconds: 120, notes: '', order_index: 1 },
  { id: 'te3', template_id: 't1', exercise_name: 'Overhead Press', sets: 3, reps: '8-12', rest_seconds: 90, notes: 'Strict', order_index: 2 },
  { id: 'te4', template_id: 't1', exercise_name: 'Lat Pulldown', sets: 3, reps: '10-12', rest_seconds: 90, notes: '', order_index: 3 },
  { id: 'te5', template_id: 't1', exercise_name: 'DB Curl', sets: 3, reps: '12-15', rest_seconds: 60, notes: 'SS w/ tricep ext', order_index: 4 },
  { id: 'te6', template_id: 't1', exercise_name: 'Tricep Extension', sets: 3, reps: '12-15', rest_seconds: 60, notes: '', order_index: 5 },
  { id: 'te7', template_id: 't1', exercise_name: 'Barbell Squat', sets: 4, reps: '6-8', rest_seconds: 180, notes: 'ATG', order_index: 6 },
  { id: 'te8', template_id: 't1', exercise_name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest_seconds: 120, notes: '', order_index: 7 },
  { id: 'te9', template_id: 't1', exercise_name: 'Leg Press', sets: 3, reps: '10-12', rest_seconds: 120, notes: '', order_index: 8 },
  { id: 'te10', template_id: 't1', exercise_name: 'Leg Curl', sets: 3, reps: '12-15', rest_seconds: 60, notes: '', order_index: 9 },
  { id: 'te11', template_id: 't1', exercise_name: 'Calf Raise', sets: 4, reps: '15-20', rest_seconds: 60, notes: 'Slow ecc', order_index: 10 },
];

// --- Workouts assigned to clients ---
export const mockWorkouts: MockWorkout[] = [
  {
    id: 'w1', client_id: 'c1', trainer_id: 'coach-1', name: 'Upper A', week: 4, day: 1, notes: 'Push focus',
    exercises: [
      { id: 'e1', workout_id: 'w1', exercise_name: 'Bench Press', sets: 4, reps: '6-8', rpe: 8, rest: '3min', notes: '', order_index: 0 },
      { id: 'e2', workout_id: 'w1', exercise_name: 'OHP', sets: 3, reps: '8-10', rpe: 7, rest: '2min', notes: '', order_index: 1 },
      { id: 'e3', workout_id: 'w1', exercise_name: 'Incline DB Press', sets: 3, reps: '10-12', rest: '90s', notes: '', order_index: 2 },
    ],
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'w2', client_id: 'c1', trainer_id: 'coach-1', name: 'Lower A', week: 4, day: 2,
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

// --- Diet Plans ---
export interface MockMeal {
  id: string;
  diet_plan_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  nutritional_benefits: string;
  research_backed: boolean;
  proteinSource?: string;
  carbSource?: string;
  fatSource?: string;
}

export interface MockResearchCitation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  summary: string;
}

export interface GroceryItem {
  name: string;
  quantity: string;
  category: 'protein' | 'carbs' | 'fats' | 'produce' | 'dairy' | 'pantry' | 'supplements';
}

export interface SupplementTiming {
  name: string;
  dose: string;
  timing: 'morning' | 'pre-workout' | 'post-workout' | 'with-meals' | 'bedtime';
  notes?: string;
}

export interface MockDietPlan {
  id: string;
  client_id: string;
  client_name: string;
  name: string;
  description: string;
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  rest_day_calories: number;
  rest_day_protein: number;
  rest_day_carbs: number;
  rest_day_fat: number;
  generated_by: 'ai' | 'coach';
  scientific_basis: string;
  evidence_level: 'high' | 'moderate' | 'preliminary';
  research_citations: MockResearchCitation[];
  supplement_recommendations: string[];
  meals: MockMeal[];
  rest_day_meals: MockMeal[];
  grocery_list: GroceryItem[];
  supplement_schedule: SupplementTiming[];
  water_target: number;
  sodium_target: number;
  fiber_target: number;
  created_at: string;
  blood_work_informed?: boolean;
}

export const mockDietPlans: MockDietPlan[] = [
  {
    id: 'dp1',
    client_id: 'c1',
    client_name: 'James W.',
    name: 'Lean Bulk — High Protein',
    description: 'Surplus plan I wrote for James after his strength block. 500kcal over maintenance with protein skewed high since he responds well to 2.2g/kg+.',
    calories_target: 3100,
    protein_target: 210,
    carbs_target: 380,
    fat_target: 80,
    generated_by: 'ai',
    scientific_basis: 'Protein intake of 1.6–2.2g/kg/day maximizes muscle protein synthesis during a caloric surplus. Leucine threshold of ~2.5g per meal optimizes mTOR signaling for hypertrophy.',
    evidence_level: 'high',
    research_citations: [
      { id: 'rc1', title: 'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults', authors: 'Morton RW, Murphy KT, McKellar SR, et al.', journal: 'British Journal of Sports Medicine', year: 2018, doi: '10.1136/bjsports-2017-097608', summary: 'Protein supplementation beyond 1.6g/kg/day showed diminishing returns for muscle hypertrophy, though higher intakes up to 2.2g/kg/day may still provide marginal benefits.' },
      { id: 'rc2', title: 'Recent Perspectives Regarding the Role of Dietary Protein for the Promotion of Muscle Hypertrophy with Resistance Exercise Training', authors: 'Stokes T, Hector AJ, Morton RW, et al.', journal: 'Nutrients', year: 2018, doi: '10.3390/nu10020180', summary: 'Distribution of protein across 4 meals/day with ≥0.4g/kg per meal optimizes 24h muscle protein synthesis.' },
      { id: 'rc3', title: 'International Society of Sports Nutrition Position Stand: protein and exercise', authors: 'Jäger R, Kerksick CM, Campbell BI, et al.', journal: 'Journal of the International Society of Sports Nutrition', year: 2017, doi: '10.1186/s12970-017-0177-8', summary: 'ISSN recommends 1.4–2.0g/kg/day for exercising individuals, with higher intakes (2.3–3.1g/kg) during caloric restriction.' },
    ],
    supplement_recommendations: ['Creatine monohydrate 5g/day', 'Whey protein isolate post-workout', 'Vitamin D3 2000 IU if levels < 30ng/mL'],
    meals: [
      { id: 'ml1', diet_plan_id: 'dp1', name: 'Greek Yogurt Power Bowl', meal_type: 'breakfast', calories: 680, protein: 48, carbs: 82, fat: 16, ingredients: ['Greek yogurt (300g)', 'Granola (60g)', 'Banana', 'Mixed berries (100g)', 'Honey (1 tbsp)', 'Chia seeds (1 tbsp)'], instructions: ['Layer yogurt in a bowl', 'Top with granola, sliced banana, and berries', 'Drizzle honey and sprinkle chia seeds'], nutritional_benefits: 'High leucine content from Greek yogurt triggers muscle protein synthesis. Berries provide anthocyanins that may reduce exercise-induced oxidative stress.', research_backed: true, proteinSource: 'greek-yogurt', carbSource: 'oats', fatSource: 'nuts' },
      { id: 'ml2', diet_plan_id: 'dp1', name: 'Chicken & Sweet Potato Bowl', meal_type: 'lunch', calories: 820, protein: 55, carbs: 95, fat: 22, ingredients: ['Chicken breast (200g)', 'Sweet potato (250g)', 'Broccoli (150g)', 'Olive oil (1 tbsp)', 'Soy sauce (1 tbsp)', 'Sesame seeds'], instructions: ['Grill chicken breast seasoned with soy sauce', 'Roast cubed sweet potato at 200°C for 25 min', 'Steam broccoli and assemble'], nutritional_benefits: 'Sweet potato provides complex carbohydrates for glycogen replenishment. Broccoli contains sulforaphane which may support recovery.', research_backed: true, proteinSource: 'chicken', carbSource: 'sweet-potato', fatSource: 'olive-oil' },
      { id: 'ml3', diet_plan_id: 'dp1', name: 'Salmon with Jasmine Rice', meal_type: 'dinner', calories: 780, protein: 52, carbs: 88, fat: 24, ingredients: ['Atlantic salmon fillet (200g)', 'Jasmine rice (200g cooked)', 'Asparagus (150g)', 'Lemon', 'Garlic (2 cloves)', 'Olive oil (1 tsp)'], instructions: ['Season salmon with lemon and garlic', 'Pan-sear skin-side down 4 min, flip 3 min', 'Serve over rice with roasted asparagus'], nutritional_benefits: 'Salmon provides omega-3 fatty acids (EPA/DHA) which reduce exercise-induced inflammation and may enhance mTOR-mediated muscle protein synthesis.', research_backed: true, proteinSource: 'fish', carbSource: 'rice', fatSource: 'olive-oil' },
      { id: 'ml4', diet_plan_id: 'dp1', name: 'Post-Workout Shake', meal_type: 'snack', calories: 420, protein: 45, carbs: 52, fat: 6, ingredients: ['Whey protein isolate (1.5 scoops)', 'Banana', 'Oat milk (300ml)', 'Peanut butter (0.5 tbsp)', 'Ice'], instructions: ['Blend all ingredients until smooth', 'Consume within 30 min post-training'], nutritional_benefits: 'Fast-absorbing whey protein provides rapid aminoacidemia. Combined with simple carbs for insulin-mediated glucose and amino acid uptake.', research_backed: true, proteinSource: 'whey', carbSource: 'fruits', fatSource: 'peanut-butter' },
    ],
    rest_day_calories: 2600,
    rest_day_protein: 210,
    rest_day_carbs: 266,
    rest_day_fat: 90,
    rest_day_meals: [
      { id: 'ml1r', diet_plan_id: 'dp1', name: 'Egg White & Avocado Toast', meal_type: 'breakfast', calories: 520, protein: 38, carbs: 42, fat: 22, ingredients: ['Egg whites (5)', 'Whole egg (1)', 'Sourdough bread (2 slices)', 'Avocado (½)', 'Cherry tomatoes'], instructions: ['Scramble egg whites and whole egg', 'Toast sourdough, top with smashed avocado', 'Add eggs and tomatoes'], nutritional_benefits: 'Complete amino acid profile from eggs with healthy fats from avocado.', research_backed: true, proteinSource: 'eggs', carbSource: 'bread', fatSource: 'avocado' },
      { id: 'ml2r', diet_plan_id: 'dp1', name: 'Chicken & Roasted Veg', meal_type: 'lunch', calories: 680, protein: 52, carbs: 55, fat: 24, ingredients: ['Chicken breast (200g)', 'Brown rice (150g cooked)', 'Zucchini (1)', 'Bell pepper (1)', 'Olive oil (1 tbsp)'], instructions: ['Grill chicken breast', 'Roast vegetables at 200°C for 20 min', 'Serve over brown rice'], nutritional_benefits: 'Lower carb than training day while maintaining protein for recovery.', research_backed: true, proteinSource: 'chicken', carbSource: 'rice', fatSource: 'olive-oil' },
      { id: 'ml3r', diet_plan_id: 'dp1', name: 'Salmon with Greens', meal_type: 'dinner', calories: 620, protein: 48, carbs: 35, fat: 30, ingredients: ['Atlantic salmon (180g)', 'Mixed greens (150g)', 'Avocado (½)', 'Cherry tomatoes', 'EVOO dressing (1 tbsp)'], instructions: ['Bake salmon at 200°C for 12 min', 'Assemble salad with greens and avocado', 'Drizzle olive oil dressing'], nutritional_benefits: 'Higher fat, lower carb meal for rest day. Omega-3s support recovery.', research_backed: true, proteinSource: 'fish', carbSource: 'vegetables', fatSource: 'avocado' },
      { id: 'ml4r', diet_plan_id: 'dp1', name: 'Cottage Cheese & Berries', meal_type: 'snack', calories: 280, protein: 32, carbs: 24, fat: 6, ingredients: ['Cottage cheese (250g)', 'Mixed berries (100g)', 'Cinnamon'], instructions: ['Top cottage cheese with berries and cinnamon'], nutritional_benefits: 'Casein provides slow-release amino acids for rest day recovery.', research_backed: true, proteinSource: 'greek-yogurt', carbSource: 'fruits', fatSource: 'cheese' },
    ],
    grocery_list: [
      { name: 'Chicken breast', quantity: '800g', category: 'protein' },
      { name: 'Atlantic salmon', quantity: '580g', category: 'protein' },
      { name: 'Greek yogurt', quantity: '550g', category: 'dairy' },
      { name: 'Egg whites', quantity: '10', category: 'protein' },
      { name: 'Whey protein isolate', quantity: '1.5 scoops', category: 'supplements' },
      { name: 'Sweet potato', quantity: '250g', category: 'carbs' },
      { name: 'Jasmine rice', quantity: '200g cooked', category: 'carbs' },
      { name: 'Brown rice', quantity: '150g cooked', category: 'carbs' },
      { name: 'Sourdough bread', quantity: '2 slices', category: 'carbs' },
      { name: 'Avocado', quantity: '2', category: 'fats' },
      { name: 'Olive oil', quantity: '3 tbsp', category: 'fats' },
      { name: 'Broccoli', quantity: '150g', category: 'produce' },
      { name: 'Asparagus', quantity: '150g', category: 'produce' },
      { name: 'Mixed berries', quantity: '200g', category: 'produce' },
      { name: 'Bananas', quantity: '2', category: 'produce' },
    ],
    supplement_schedule: [
      { name: 'Creatine monohydrate', dose: '5g', timing: 'morning', notes: 'Mix with water or shake' },
      { name: 'Whey protein isolate', dose: '1.5 scoops', timing: 'post-workout', notes: 'Within 30 min of training' },
      { name: 'Vitamin D3', dose: '2000 IU', timing: 'morning', notes: 'Take with breakfast (fat enhances absorption)' },
    ],
    water_target: 3.2,
    sodium_target: 2300,
    fiber_target: 35,
    created_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'dp2',
    client_id: 'c6',
    client_name: 'Emma D.',
    name: 'Recomp — Performance Focus',
    description: 'Emma wants to stay around the same weight but get leaner. Cycling carbs higher on training days, lower on rest. She trains 5x/week so the split works well.',
    calories_target: 2200,
    protein_target: 155,
    carbs_target: 240,
    fat_target: 68,
    generated_by: 'ai',
    scientific_basis: 'Body recomposition is achievable in trained individuals through strategic caloric cycling. Higher carbohydrate intake on training days supports performance while moderate deficit on rest days promotes fat oxidation.',
    evidence_level: 'high',
    research_citations: [
      { id: 'rc4', title: 'Body Recomposition: Can Trained Individuals Build Muscle and Lose Fat at the Same Time?', authors: 'Barakat C, Pearson J, Escalante G, et al.', journal: 'Strength and Conditioning Journal', year: 2020, doi: '10.1519/SSC.0000000000000584', summary: 'Trained individuals can achieve simultaneous fat loss and muscle gain with adequate protein (≥2.0g/kg), resistance training, and moderate caloric deficit.' },
      { id: 'rc5', title: 'Nutritional Strategies to Promote Postexercise Recovery', authors: 'Kerksick CM, Arent S, Schoenfeld BJ, et al.', journal: 'International Journal of Sport Nutrition and Exercise Metabolism', year: 2017, doi: '10.1123/ijsnem.2017-0010', summary: 'Carbohydrate periodization aligned with training demands optimizes glycogen resynthesis while allowing fat oxidation on non-training days.' },
    ],
    supplement_recommendations: ['Creatine monohydrate 3–5g/day', 'Caffeine 3mg/kg pre-workout (if tolerated)'],
    meals: [
      { id: 'ml5', diet_plan_id: 'dp2', name: 'Egg White & Avocado Toast', meal_type: 'breakfast', calories: 480, protein: 32, carbs: 42, fat: 20, ingredients: ['Egg whites (5)', 'Whole egg (1)', 'Sourdough bread (2 slices)', 'Avocado (½)', 'Cherry tomatoes', 'Everything bagel seasoning'], instructions: ['Scramble egg whites and whole egg together', 'Toast sourdough, top with smashed avocado', 'Add eggs and halved tomatoes, season'], nutritional_benefits: 'Eggs provide complete amino acid profile. Avocado supplies monounsaturated fats supporting hormone production.', research_backed: true, proteinSource: 'eggs', carbSource: 'bread', fatSource: 'avocado' },
      { id: 'ml6', diet_plan_id: 'dp2', name: 'Turkey Meatball Wrap', meal_type: 'lunch', calories: 580, protein: 42, carbs: 58, fat: 18, ingredients: ['Lean ground turkey (150g)', 'Whole wheat tortilla', 'Mixed greens', 'Tzatziki (2 tbsp)', 'Red onion', 'Cucumber'], instructions: ['Form turkey into small meatballs, bake at 190°C for 18 min', 'Warm tortilla, add greens and sliced veg', 'Add meatballs and drizzle tzatziki'], nutritional_benefits: 'Turkey provides lean protein with high bioavailability. Whole wheat wrap adds fiber for sustained energy.', research_backed: true, proteinSource: 'turkey', carbSource: 'bread', fatSource: 'olive-oil' },
      { id: 'ml7', diet_plan_id: 'dp2', name: 'Teriyaki Tofu Stir-Fry', meal_type: 'dinner', calories: 620, protein: 38, carbs: 72, fat: 20, ingredients: ['Firm tofu (200g)', 'Brown rice (180g cooked)', 'Bell peppers', 'Snap peas (100g)', 'Teriyaki sauce (2 tbsp)', 'Sesame oil (1 tsp)'], instructions: ['Press and cube tofu, pan-fry until golden', 'Stir-fry vegetables in sesame oil', 'Toss with teriyaki, serve over brown rice'], nutritional_benefits: 'Soy protein contains all essential amino acids and isoflavones with potential anti-inflammatory effects.', research_backed: true, proteinSource: 'tofu', carbSource: 'rice', fatSource: 'coconut-oil' },
      { id: 'ml8', diet_plan_id: 'dp2', name: 'Cottage Cheese & Berries', meal_type: 'snack', calories: 220, protein: 28, carbs: 22, fat: 4, ingredients: ['Low-fat cottage cheese (200g)', 'Blueberries (80g)', 'Cinnamon'], instructions: ['Top cottage cheese with berries and cinnamon'], nutritional_benefits: 'Casein protein from cottage cheese provides slow-releasing amino acids, ideal before overnight fasting periods.', research_backed: true, proteinSource: 'greek-yogurt', carbSource: 'fruits', fatSource: 'cheese' },
    ],
    rest_day_calories: 1900,
    rest_day_protein: 155,
    rest_day_carbs: 168,
    rest_day_fat: 72,
    rest_day_meals: [
      { id: 'ml5r', diet_plan_id: 'dp2', name: 'Egg White & Avocado Toast', meal_type: 'breakfast', calories: 480, protein: 32, carbs: 42, fat: 20, ingredients: ['Egg whites (5)', 'Whole egg (1)', 'Sourdough bread (2 slices)', 'Avocado (½)', 'Cherry tomatoes'], instructions: ['Scramble egg whites and whole egg', 'Toast sourdough, top with avocado and tomatoes'], nutritional_benefits: 'Same breakfast on rest days — consistency helps compliance.', research_backed: true, proteinSource: 'eggs', carbSource: 'bread', fatSource: 'avocado' },
      { id: 'ml6r', diet_plan_id: 'dp2', name: 'Tuna Salad Bowl', meal_type: 'lunch', calories: 420, protein: 42, carbs: 28, fat: 16, ingredients: ['Canned tuna (170g)', 'Mixed greens (100g)', 'Cucumber', 'Cherry tomatoes', 'EVOO (1 tbsp)', 'Lemon'], instructions: ['Drain tuna, flake over greens', 'Add vegetables, dress with olive oil and lemon'], nutritional_benefits: 'Lower carb lunch on rest days. Tuna provides lean protein.', research_backed: true, proteinSource: 'fish', carbSource: 'vegetables', fatSource: 'olive-oil' },
      { id: 'ml7r', diet_plan_id: 'dp2', name: 'Chicken Breast & Roasted Veg', meal_type: 'dinner', calories: 520, protein: 48, carbs: 35, fat: 22, ingredients: ['Chicken breast (180g)', 'Zucchini (1)', 'Bell pepper (1)', 'Red onion (½)', 'Olive oil (1 tbsp)'], instructions: ['Season and grill chicken', 'Roast vegetables at 200°C', 'Serve together'], nutritional_benefits: 'High protein dinner with reduced carbs for rest day.', research_backed: true, proteinSource: 'chicken', carbSource: 'vegetables', fatSource: 'olive-oil' },
      { id: 'ml8r', diet_plan_id: 'dp2', name: 'Cottage Cheese & Berries', meal_type: 'snack', calories: 220, protein: 28, carbs: 22, fat: 4, ingredients: ['Low-fat cottage cheese (200g)', 'Blueberries (80g)', 'Cinnamon'], instructions: ['Top cottage cheese with berries and cinnamon'], nutritional_benefits: 'Slow-releasing casein protein before bed.', research_backed: true, proteinSource: 'greek-yogurt', carbSource: 'fruits', fatSource: 'cheese' },
    ],
    grocery_list: [
      { name: 'Egg whites', quantity: '20', category: 'protein' },
      { name: 'Lean ground turkey', quantity: '150g', category: 'protein' },
      { name: 'Firm tofu', quantity: '200g', category: 'protein' },
      { name: 'Cottage cheese', quantity: '400g', category: 'dairy' },
      { name: 'Canned tuna', quantity: '170g', category: 'protein' },
      { name: 'Chicken breast', quantity: '180g', category: 'protein' },
      { name: 'Sourdough bread', quantity: '4 slices', category: 'carbs' },
      { name: 'Brown rice', quantity: '180g cooked', category: 'carbs' },
      { name: 'Whole wheat tortilla', quantity: '1', category: 'carbs' },
      { name: 'Avocado', quantity: '2', category: 'fats' },
      { name: 'Olive oil', quantity: '3 tbsp', category: 'fats' },
      { name: 'Blueberries', quantity: '160g', category: 'produce' },
      { name: 'Bell peppers', quantity: '3', category: 'produce' },
      { name: 'Mixed greens', quantity: '200g', category: 'produce' },
    ],
    supplement_schedule: [
      { name: 'Creatine monohydrate', dose: '5g', timing: 'morning', notes: 'Daily, even on rest days' },
      { name: 'Caffeine', dose: '200mg', timing: 'pre-workout', notes: 'Only on training days' },
    ],
    water_target: 2.6,
    sodium_target: 2300,
    fiber_target: 30,
    created_at: '2026-02-12T00:00:00Z',
  },
  {
    id: 'dp3',
    client_id: 'c3',
    client_name: 'Alex Chen',
    name: 'Cut Phase — Protein-Sparing',
    description: 'Alex is in a deficit trying to hold onto muscle while dropping weight. Keeping protein very high and spreading it across 5 meals. He skips breakfast so meal 1 is at 11am.',
    calories_target: 1850,
    protein_target: 185,
    carbs_target: 160,
    fat_target: 52,
    generated_by: 'ai',
    scientific_basis: 'During caloric restriction, elevated protein intake (2.3–3.1g/kg lean body mass) preserves fat-free mass. Resistance training combined with high protein intake during energy deficit maintains or increases lean body mass.',
    evidence_level: 'moderate',
    research_citations: [
      { id: 'rc6', title: 'Higher compared with lower dietary protein during an energy deficit combined with intense exercise promotes greater lean mass gain and fat mass loss', authors: 'Longland TM, Oikawa SY, Mitchell CJ, et al.', journal: 'The American Journal of Clinical Nutrition', year: 2016, doi: '10.3945/ajcn.115.119339', summary: 'Consuming 2.4g/kg/day during a 40% energy deficit resulted in greater lean mass gains compared to 1.2g/kg/day in resistance-trained men.' },
      { id: 'rc7', title: 'Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation', authors: 'Helms ER, Aragon AA, Fitschen PJ', journal: 'Journal of the International Society of Sports Nutrition', year: 2014, doi: '10.1186/1550-2783-11-20', summary: 'Recommends 2.3–3.1g/kg lean body mass protein during contest prep to maximize muscle retention in energy deficit.' },
    ],
    supplement_recommendations: ['Creatine monohydrate 5g/day (water retention is fine, ignore the scale)', 'Magnesium glycinate 400mg before bed', 'Multivitamin to cover micronutrient gaps in deficit'],
    meals: [
      { id: 'ml9', diet_plan_id: 'dp3', name: 'Tuna & Rice Cakes', meal_type: 'lunch', calories: 380, protein: 42, carbs: 32, fat: 8, ingredients: ['Canned tuna in water (170g)', 'Rice cakes (3)', 'Mustard', 'Cucumber slices', 'Lemon juice'], instructions: ['Drain tuna, mix with mustard and lemon', 'Spread onto rice cakes, top with cucumber'], nutritional_benefits: 'Tuna provides lean complete protein with minimal caloric overhead. Rice cakes offer quick-digesting carbs without added fats.', research_backed: true, proteinSource: 'fish', carbSource: 'rice', fatSource: 'olive-oil' },
      { id: 'ml10', diet_plan_id: 'dp3', name: 'Chicken Breast & Roasted Veg', meal_type: 'dinner', calories: 520, protein: 50, carbs: 38, fat: 16, ingredients: ['Chicken breast (200g)', 'Zucchini (1)', 'Bell pepper (1)', 'Red onion (½)', 'Olive oil spray', 'Italian herbs'], instructions: ['Season chicken, grill or air-fry 6 min per side', 'Toss chopped veg with oil spray and herbs', 'Roast veg at 200°C for 20 min'], nutritional_benefits: 'Chicken breast is one of the highest protein-per-calorie whole foods. Roasted vegetables add volume and fiber with minimal calories.', research_backed: true, proteinSource: 'chicken', carbSource: 'vegetables', fatSource: 'olive-oil' },
      { id: 'ml11', diet_plan_id: 'dp3', name: 'Protein Oats', meal_type: 'snack', calories: 350, protein: 35, carbs: 40, fat: 8, ingredients: ['Rolled oats (50g)', 'Whey protein (1 scoop)', 'Almond milk (200ml)', 'Blueberries (50g)'], instructions: ['Cook oats with almond milk', 'Stir in whey protein off heat', 'Top with blueberries'], nutritional_benefits: 'Beta-glucan fiber in oats supports satiety during caloric restriction. Combining whey with slow carbs extends aminoacidemia.', research_backed: true, proteinSource: 'whey', carbSource: 'oats', fatSource: 'nuts' },
      { id: 'ml12', diet_plan_id: 'dp3', name: 'Greek Yogurt Bark', meal_type: 'snack', calories: 280, protein: 30, carbs: 28, fat: 6, ingredients: ['Greek yogurt (250g)', 'Dark chocolate chips (15g)', 'Strawberries (50g)', 'Granola (20g)'], instructions: ['Spread yogurt on parchment-lined tray', 'Top with chocolate, strawberries, granola', 'Freeze 2h, break into pieces'], nutritional_benefits: 'High-protein snack that satisfies sweet cravings during a cut. Dark chocolate provides flavanols with potential cardiovascular benefits.', research_backed: false, proteinSource: 'greek-yogurt', carbSource: 'oats', fatSource: 'cheese' },
    ],
    rest_day_calories: 1650,
    rest_day_protein: 185,
    rest_day_carbs: 112,
    rest_day_fat: 55,
    rest_day_meals: [
      { id: 'ml9r', diet_plan_id: 'dp3', name: 'Tuna Salad', meal_type: 'lunch', calories: 350, protein: 42, carbs: 15, fat: 14, ingredients: ['Canned tuna (170g)', 'Mixed greens (100g)', 'Cucumber', 'EVOO (1 tbsp)', 'Lemon'], instructions: ['Flake tuna over greens, dress with olive oil and lemon'], nutritional_benefits: 'Very low carb lunch for rest day deficit.', research_backed: true, proteinSource: 'fish', carbSource: 'vegetables', fatSource: 'olive-oil' },
      { id: 'ml10r', diet_plan_id: 'dp3', name: 'Chicken & Greens', meal_type: 'dinner', calories: 480, protein: 50, carbs: 20, fat: 22, ingredients: ['Chicken breast (200g)', 'Spinach (100g)', 'Mushrooms (100g)', 'Olive oil (1 tbsp)', 'Garlic'], instructions: ['Grill chicken, sauté spinach and mushrooms in olive oil'], nutritional_benefits: 'High protein, low carb dinner. Spinach adds iron and magnesium.', research_backed: true, proteinSource: 'chicken', carbSource: 'vegetables', fatSource: 'olive-oil' },
      { id: 'ml11r', diet_plan_id: 'dp3', name: 'Protein Shake', meal_type: 'snack', calories: 280, protein: 40, carbs: 15, fat: 6, ingredients: ['Whey protein (1.5 scoops)', 'Almond milk (300ml)', 'Ice'], instructions: ['Blend and drink'], nutritional_benefits: 'Quick lean protein hit without excess carbs.', research_backed: true, proteinSource: 'whey', carbSource: 'fruits', fatSource: 'nuts' },
      { id: 'ml12r', diet_plan_id: 'dp3', name: 'Cottage Cheese', meal_type: 'snack', calories: 180, protein: 28, carbs: 8, fat: 4, ingredients: ['Low-fat cottage cheese (200g)', 'Cinnamon'], instructions: ['Simple — eat before bed'], nutritional_benefits: 'Casein before sleep for overnight recovery.', research_backed: true, proteinSource: 'greek-yogurt', carbSource: 'vegetables', fatSource: 'cheese' },
    ],
    grocery_list: [
      { name: 'Canned tuna', quantity: '340g', category: 'protein' },
      { name: 'Chicken breast', quantity: '400g', category: 'protein' },
      { name: 'Whey protein', quantity: '2.5 scoops', category: 'supplements' },
      { name: 'Greek yogurt', quantity: '250g', category: 'dairy' },
      { name: 'Cottage cheese', quantity: '200g', category: 'dairy' },
      { name: 'Rice cakes', quantity: '3', category: 'carbs' },
      { name: 'Rolled oats', quantity: '50g', category: 'carbs' },
      { name: 'Olive oil', quantity: '3 tbsp', category: 'fats' },
      { name: 'Almond milk', quantity: '500ml', category: 'dairy' },
      { name: 'Mixed greens', quantity: '200g', category: 'produce' },
      { name: 'Blueberries', quantity: '50g', category: 'produce' },
      { name: 'Zucchini', quantity: '1', category: 'produce' },
      { name: 'Bell pepper', quantity: '1', category: 'produce' },
      { name: 'Spinach', quantity: '100g', category: 'produce' },
    ],
    supplement_schedule: [
      { name: 'Creatine monohydrate', dose: '5g', timing: 'morning', notes: 'Water retention is normal — ignore the scale' },
      { name: 'Magnesium glycinate', dose: '400mg', timing: 'bedtime', notes: 'Supports sleep quality during deficit' },
      { name: 'Multivitamin', dose: '1 tablet', timing: 'morning', notes: 'Cover micronutrient gaps in caloric deficit' },
    ],
    water_target: 2.8,
    sodium_target: 2000,
    fiber_target: 28,
    created_at: '2026-02-08T00:00:00Z',
  },
  {
    id: 'dp4',
    client_id: 'c4',
    client_name: 'Sophie T.',
    name: 'Strength-Focused Nutrition',
    description: 'Wrote this for Sophie manually — she\'s vegetarian and wants to hit her protein targets without supplements. Took some work but it\'s doable at her weight.',
    calories_target: 2400,
    protein_target: 130,
    carbs_target: 300,
    fat_target: 75,
    generated_by: 'coach',
    scientific_basis: 'Vegetarian athletes can meet protein requirements through strategic food combining. Complementary plant proteins (legumes + grains) provide complete amino acid profiles when consumed across the day.',
    evidence_level: 'preliminary',
    research_citations: [
      { id: 'rc8', title: 'Plant Proteins: Assessing Their Nutritional Quality and Effects on Health and Physical Function', authors: 'Berrazaga I, Micard V, Gueugneau M, Walrand S', journal: 'Nutrients', year: 2019, doi: '10.3390/nu11112584', summary: 'Plant protein blends can match animal protein for muscle protein synthesis when total leucine content is sufficient and protein intake is adequate.' },
    ],
    supplement_recommendations: ['B12 supplement (vegetarian essential)', 'Iron — get levels checked first', 'Omega-3 algae-based if not eating eggs'],
    meals: [
      { id: 'ml13', diet_plan_id: 'dp4', name: 'Tofu Scramble on Rye', meal_type: 'breakfast', calories: 520, protein: 32, carbs: 52, fat: 20, ingredients: ['Firm tofu (200g)', 'Rye bread (2 slices)', 'Spinach (50g)', 'Nutritional yeast (2 tbsp)', 'Turmeric', 'Cherry tomatoes'], instructions: ['Crumble tofu into pan with turmeric and nutritional yeast', 'Sauté with spinach and tomatoes', 'Serve on toasted rye'], nutritional_benefits: 'Tofu provides complete plant protein. Nutritional yeast adds B12 and gives a savory depth that makes this feel less "health-food".', research_backed: true, proteinSource: 'tofu', carbSource: 'bread', fatSource: 'olive-oil' },
      { id: 'ml14', diet_plan_id: 'dp4', name: 'Lentil & Halloumi Bowl', meal_type: 'lunch', calories: 650, protein: 38, carbs: 72, fat: 22, ingredients: ['Red lentils (80g dry)', 'Halloumi (80g)', 'Quinoa (60g dry)', 'Roasted beetroot', 'Tahini dressing (1 tbsp)'], instructions: ['Cook lentils and quinoa separately', 'Slice and pan-fry halloumi until golden', 'Assemble bowl, drizzle tahini'], nutritional_benefits: 'Lentils + quinoa provide complementary amino acids covering all essential aminos. Halloumi adds leucine-rich protein.', research_backed: true, proteinSource: 'tofu', carbSource: 'quinoa', fatSource: 'nuts' },
      { id: 'ml15', diet_plan_id: 'dp4', name: 'Chickpea Pasta Arrabiata', meal_type: 'dinner', calories: 680, protein: 35, carbs: 88, fat: 20, ingredients: ['Chickpea pasta (100g)', 'Crushed tomatoes (200g)', 'Chickpeas (100g canned)', 'Garlic (3 cloves)', 'Chili flakes', 'Parmesan (20g)'], instructions: ['Cook pasta al dente', 'Sauté garlic and chili, add tomatoes and chickpeas', 'Simmer 10 min, toss with pasta, top with parmesan'], nutritional_benefits: 'Chickpea pasta provides ~25g protein per 100g serving. Double chickpea source maximizes plant protein without supplements.', research_backed: true, proteinSource: 'tofu', carbSource: 'pasta', fatSource: 'cheese' },
      { id: 'ml16', diet_plan_id: 'dp4', name: 'Peanut Butter Banana Smoothie', meal_type: 'snack', calories: 380, protein: 22, carbs: 48, fat: 14, ingredients: ['Soy milk (300ml)', 'Banana', 'Peanut butter (1.5 tbsp)', 'Rolled oats (30g)', 'Cinnamon'], instructions: ['Blend everything until smooth'], nutritional_benefits: 'Soy milk provides 7g protein per cup with a complete amino acid profile. Peanut butter adds healthy fats and additional plant protein.', research_backed: false, proteinSource: 'tofu', carbSource: 'oats', fatSource: 'peanut-butter' },
    ],
    rest_day_calories: 2100,
    rest_day_protein: 130,
    rest_day_carbs: 210,
    rest_day_fat: 82,
    rest_day_meals: [
      { id: 'ml13r', diet_plan_id: 'dp4', name: 'Tofu Scramble on Rye', meal_type: 'breakfast', calories: 520, protein: 32, carbs: 52, fat: 20, ingredients: ['Firm tofu (200g)', 'Rye bread (2 slices)', 'Spinach (50g)', 'Nutritional yeast (2 tbsp)', 'Turmeric', 'Cherry tomatoes'], instructions: ['Same as training day'], nutritional_benefits: 'Consistent breakfast helps compliance.', research_backed: true, proteinSource: 'tofu', carbSource: 'bread', fatSource: 'olive-oil' },
      { id: 'ml14r', diet_plan_id: 'dp4', name: 'Lentil Soup', meal_type: 'lunch', calories: 480, protein: 28, carbs: 58, fat: 14, ingredients: ['Red lentils (100g)', 'Carrots (2)', 'Celery (2 stalks)', 'Vegetable broth (400ml)', 'Cumin', 'Lemon'], instructions: ['Sauté carrots and celery', 'Add lentils and broth, simmer 20 min', 'Season with cumin and lemon'], nutritional_benefits: 'Warming comfort meal with lower calories for rest day.', research_backed: true, proteinSource: 'tofu', carbSource: 'potatoes', fatSource: 'olive-oil' },
      { id: 'ml15r', diet_plan_id: 'dp4', name: 'Chickpea & Halloumi Salad', meal_type: 'dinner', calories: 550, protein: 32, carbs: 48, fat: 26, ingredients: ['Chickpeas (150g)', 'Halloumi (60g)', 'Mixed greens', 'Tahini (1 tbsp)', 'Lemon'], instructions: ['Pan-fry halloumi, toss chickpeas with greens and tahini'], nutritional_benefits: 'Good protein from combined plant + dairy sources.', research_backed: true, proteinSource: 'tofu', carbSource: 'quinoa', fatSource: 'nuts' },
      { id: 'ml16r', diet_plan_id: 'dp4', name: 'PB Banana Smoothie', meal_type: 'snack', calories: 350, protein: 20, carbs: 42, fat: 14, ingredients: ['Soy milk (250ml)', 'Banana', 'Peanut butter (1 tbsp)', 'Oats (25g)'], instructions: ['Blend smooth'], nutritional_benefits: 'Slightly smaller portion for rest day.', research_backed: false, proteinSource: 'tofu', carbSource: 'oats', fatSource: 'peanut-butter' },
    ],
    grocery_list: [
      { name: 'Firm tofu', quantity: '400g', category: 'protein' },
      { name: 'Halloumi', quantity: '140g', category: 'dairy' },
      { name: 'Red lentils', quantity: '180g', category: 'protein' },
      { name: 'Chickpeas (canned)', quantity: '250g', category: 'protein' },
      { name: 'Chickpea pasta', quantity: '100g', category: 'carbs' },
      { name: 'Quinoa', quantity: '60g', category: 'carbs' },
      { name: 'Rye bread', quantity: '4 slices', category: 'carbs' },
      { name: 'Soy milk', quantity: '550ml', category: 'dairy' },
      { name: 'Peanut butter', quantity: '2.5 tbsp', category: 'fats' },
      { name: 'Tahini', quantity: '2 tbsp', category: 'fats' },
      { name: 'Parmesan', quantity: '20g', category: 'dairy' },
      { name: 'Spinach', quantity: '100g', category: 'produce' },
      { name: 'Bananas', quantity: '2', category: 'produce' },
      { name: 'Beetroot', quantity: '1', category: 'produce' },
    ],
    supplement_schedule: [
      { name: 'Vitamin B12', dose: '1000mcg', timing: 'morning', notes: 'Essential for vegetarians' },
      { name: 'Iron', dose: '18mg', timing: 'morning', notes: 'Take with vitamin C for absorption — check levels first' },
      { name: 'Omega-3 (algae)', dose: '500mg DHA', timing: 'with-meals', notes: 'Plant-based alternative to fish oil' },
    ],
    water_target: 2.4,
    sodium_target: 2300,
    fiber_target: 32,
    created_at: '2026-01-28T00:00:00Z',
  },
  {
    id: 'dp5',
    client_id: 'c12',
    client_name: 'Hannah L.',
    name: 'Anti-Inflammatory Protocol',
    description: 'Hannah has some joint issues and asked about diet changes that might help. Built this around the research — omega-3s, turmeric, tart cherry, reducing processed stuff.',
    calories_target: 2100,
    protein_target: 140,
    carbs_target: 245,
    fat_target: 65,
    generated_by: 'ai',
    scientific_basis: 'Chronic low-grade inflammation impairs recovery and joint health. Dietary patterns rich in omega-3 fatty acids, polyphenols, and curcuminoids have demonstrated anti-inflammatory effects comparable to low-dose NSAIDs in some clinical trials.',
    evidence_level: 'moderate',
    research_citations: [
      { id: 'rc9', title: 'Omega-3 Fatty Acids and Inflammatory Processes: From Molecules to Man', authors: 'Calder PC', journal: 'Biochemical Society Transactions', year: 2017, doi: '10.1042/BST20160474', summary: 'EPA and DHA at doses of 2–4g/day reduce inflammatory markers (CRP, IL-6, TNF-α) through competitive inhibition of arachidonic acid metabolism.' },
      { id: 'rc10', title: 'Efficacy of Turmeric Extracts and Curcumin for Alleviating the Symptoms of Joint Arthritis', authors: 'Daily JW, Yang M, Park S', journal: 'Journal of Medicinal Food', year: 2016, doi: '10.1089/jmf.2016.3705', summary: 'Turmeric extracts (equivalent to 1000mg/day curcumin) showed significant improvement in arthritis symptoms compared to placebo.' },
      { id: 'rc11', title: 'Influence of Tart Cherry Juice on Indices of Recovery Following Marathon Running', authors: 'Howatson G, McHugh MP, Hill JA, et al.', journal: 'Scandinavian Journal of Medicine & Science in Sports', year: 2010, doi: '10.1111/j.1600-0838.2009.01005.x', summary: 'Tart cherry juice consumption reduced inflammation markers and accelerated strength recovery after strenuous exercise.' },
    ],
    supplement_recommendations: ['Fish oil 2–3g EPA+DHA daily (with food)', 'Turmeric/curcumin 500mg 2x/day with black pepper', 'Tart cherry concentrate 30ml before bed'],
    meals: [
      { id: 'ml17', diet_plan_id: 'dp5', name: 'Turmeric Oatmeal with Walnuts & Berries', meal_type: 'breakfast', calories: 450, protein: 18, carbs: 62, fat: 16, ingredients: ['Rolled oats (60g)', 'Oat milk (250ml)', 'Walnuts (20g)', 'Blueberries (80g)', 'Turmeric (1 tsp)', 'Black pepper (pinch)', 'Honey (1 tsp)'], instructions: ['Cook oats with oat milk and turmeric', 'Add black pepper (enhances curcumin absorption)', 'Top with crushed walnuts, berries, and honey'], nutritional_benefits: 'Turmeric with black pepper increases curcumin bioavailability by 2000%. Walnuts are the richest nut source of ALA omega-3. Blueberries provide anthocyanins with anti-inflammatory properties.', research_backed: true, proteinSource: 'whey', carbSource: 'oats', fatSource: 'nuts' },
      { id: 'ml18', diet_plan_id: 'dp5', name: 'Mediterranean Salmon Bowl', meal_type: 'lunch', calories: 620, protein: 45, carbs: 52, fat: 24, ingredients: ['Wild salmon (180g)', 'Farro (60g dry)', 'Cucumber', 'Cherry tomatoes', 'Kalamata olives (6)', 'Red onion', 'Extra virgin olive oil (1 tbsp)', 'Lemon juice'], instructions: ['Cook farro according to package directions', 'Bake salmon at 200°C for 12 min', 'Chop vegetables, toss with olive oil and lemon', 'Flake salmon over farro and veg'], nutritional_benefits: 'Wild salmon provides 1.5–2g omega-3 per serving. Mediterranean-style meals consistently show anti-inflammatory effects in clinical trials. EVOO contains oleocanthal with ibuprofen-like properties.', research_backed: true, proteinSource: 'fish', carbSource: 'quinoa', fatSource: 'olive-oil' },
      { id: 'ml19', diet_plan_id: 'dp5', name: 'Ginger Chicken & Bok Choy', meal_type: 'dinner', calories: 580, protein: 48, carbs: 55, fat: 16, ingredients: ['Chicken thigh (boneless, 180g)', 'Brown rice (180g cooked)', 'Bok choy (2 heads)', 'Fresh ginger (1 tbsp grated)', 'Garlic (2 cloves)', 'Low-sodium soy sauce (1 tbsp)', 'Sesame oil (1 tsp)'], instructions: ['Marinate chicken in ginger, garlic, and soy sauce 15 min', 'Pan-sear chicken thigh, slice', 'Sauté bok choy in sesame oil', 'Serve over brown rice'], nutritional_benefits: 'Ginger contains gingerols with demonstrated anti-inflammatory and analgesic effects. Bok choy provides calcium and vitamin K for bone and joint support.', research_backed: true, proteinSource: 'chicken', carbSource: 'rice', fatSource: 'coconut-oil' },
      { id: 'ml20', diet_plan_id: 'dp5', name: 'Tart Cherry Recovery Smoothie', meal_type: 'snack', calories: 320, protein: 25, carbs: 42, fat: 6, ingredients: ['Tart cherry juice (120ml)', 'Whey protein (1 scoop)', 'Frozen mango (80g)', 'Spinach (handful)', 'Water (100ml)'], instructions: ['Blend all ingredients until smooth', 'Best consumed 30–60 min after training'], nutritional_benefits: 'Tart cherry anthocyanins reduce DOMS and accelerate recovery. Combined with whey for post-exercise repair.', research_backed: true, proteinSource: 'whey', carbSource: 'fruits', fatSource: 'olive-oil' },
    ],
    rest_day_calories: 1900,
    rest_day_protein: 140,
    rest_day_carbs: 172,
    rest_day_fat: 70,
    rest_day_meals: [
      { id: 'ml17r', diet_plan_id: 'dp5', name: 'Turmeric Oatmeal with Walnuts & Berries', meal_type: 'breakfast', calories: 450, protein: 18, carbs: 62, fat: 16, ingredients: ['Rolled oats (60g)', 'Oat milk (250ml)', 'Walnuts (20g)', 'Blueberries (80g)', 'Turmeric (1 tsp)', 'Black pepper (pinch)', 'Honey (1 tsp)'], instructions: ['Same as training day — anti-inflammatory breakfast stays consistent'], nutritional_benefits: 'Anti-inflammatory compounds from turmeric and walnuts.', research_backed: true, proteinSource: 'whey', carbSource: 'oats', fatSource: 'nuts' },
      { id: 'ml18r', diet_plan_id: 'dp5', name: 'Salmon & Avocado Salad', meal_type: 'lunch', calories: 520, protein: 42, carbs: 25, fat: 30, ingredients: ['Wild salmon (150g)', 'Mixed greens (120g)', 'Avocado (½)', 'Walnuts (15g)', 'EVOO (1 tbsp)', 'Lemon'], instructions: ['Bake salmon, flake over salad', 'Add avocado and walnuts, dress with oil and lemon'], nutritional_benefits: 'Triple omega-3 sources (salmon + walnuts + EVOO) for maximum anti-inflammatory effect.', research_backed: true, proteinSource: 'fish', carbSource: 'vegetables', fatSource: 'avocado' },
      { id: 'ml19r', diet_plan_id: 'dp5', name: 'Chicken & Vegetable Stir-Fry', meal_type: 'dinner', calories: 480, protein: 42, carbs: 38, fat: 16, ingredients: ['Chicken breast (150g)', 'Bok choy (2 heads)', 'Ginger', 'Garlic', 'Sesame oil (1 tsp)', 'Brown rice (100g cooked)'], instructions: ['Stir-fry chicken with ginger and garlic', 'Add bok choy, serve over small portion of rice'], nutritional_benefits: 'Ginger and garlic both contain anti-inflammatory compounds.', research_backed: true, proteinSource: 'chicken', carbSource: 'rice', fatSource: 'coconut-oil' },
      { id: 'ml20r', diet_plan_id: 'dp5', name: 'Tart Cherry Recovery Smoothie', meal_type: 'snack', calories: 280, protein: 22, carbs: 38, fat: 4, ingredients: ['Tart cherry juice (100ml)', 'Whey protein (¾ scoop)', 'Frozen mango (60g)', 'Water'], instructions: ['Blend smooth — smaller rest day portion'], nutritional_benefits: 'Tart cherry for ongoing recovery support.', research_backed: true, proteinSource: 'whey', carbSource: 'fruits', fatSource: 'olive-oil' },
    ],
    grocery_list: [
      { name: 'Wild salmon', quantity: '330g', category: 'protein' },
      { name: 'Chicken thigh/breast', quantity: '330g', category: 'protein' },
      { name: 'Whey protein', quantity: '1.75 scoops', category: 'supplements' },
      { name: 'Rolled oats', quantity: '120g', category: 'carbs' },
      { name: 'Brown rice', quantity: '280g cooked', category: 'carbs' },
      { name: 'Farro', quantity: '60g', category: 'carbs' },
      { name: 'Walnuts', quantity: '55g', category: 'fats' },
      { name: 'Olive oil (EVOO)', quantity: '3 tbsp', category: 'fats' },
      { name: 'Avocado', quantity: '1', category: 'fats' },
      { name: 'Blueberries', quantity: '160g', category: 'produce' },
      { name: 'Bok choy', quantity: '4 heads', category: 'produce' },
      { name: 'Tart cherry juice', quantity: '220ml', category: 'produce' },
      { name: 'Frozen mango', quantity: '140g', category: 'produce' },
      { name: 'Spinach', quantity: '1 bunch', category: 'produce' },
      { name: 'Turmeric', quantity: '2 tsp', category: 'pantry' },
      { name: 'Fresh ginger', quantity: '2 tbsp', category: 'produce' },
    ],
    supplement_schedule: [
      { name: 'Fish oil (EPA+DHA)', dose: '2–3g', timing: 'with-meals', notes: 'Take with lunch or dinner for best absorption' },
      { name: 'Turmeric/curcumin', dose: '500mg', timing: 'morning', notes: 'Take with black pepper and fat' },
      { name: 'Turmeric/curcumin', dose: '500mg', timing: 'bedtime', notes: 'Second dose before sleep' },
      { name: 'Tart cherry concentrate', dose: '30ml', timing: 'bedtime', notes: 'May improve sleep quality + reduce inflammation' },
    ],
    water_target: 2.8,
    sodium_target: 2000,
    fiber_target: 30,
    created_at: '2026-02-15T00:00:00Z',
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
