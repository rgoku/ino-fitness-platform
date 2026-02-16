import { createClient } from '@supabase/supabase-js';
import type {
  Client,
  TrainerWorkout,
  WorkoutExercise,
  LoggedSet,
  Trophy,
  ClientTrophy,
} from '@trainer-app/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication
export const authService = {
  async signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getUser() {
    return supabase.auth.getUser();
  },

  async getSession() {
    return supabase.auth.getSession();
  },
};

// Clients
export const clientService = {
  async getClients(trainerId: string) {
    return supabase
      .from('clients')
      .select('*')
      .eq('trainer_id', trainerId);
  },

  async getClient(clientId: string) {
    return supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
  },

  async createClient(trainerId: string, data: Omit<Client, 'id' | 'trainer_id' | 'created_at'>) {
    return supabase
      .from('clients')
      .insert({
        trainer_id: trainerId,
        ...data,
      })
      .select()
      .single();
  },

  async updateClient(clientId: string, data: Partial<Client>) {
    return supabase
      .from('clients')
      .update(data)
      .eq('id', clientId)
      .select()
      .single();
  },

  async deleteClient(clientId: string) {
    return supabase.from('clients').delete().eq('id', clientId);
  },
};

// Workouts
export const workoutService = {
  async getClientWorkouts(clientId: string) {
    return supabase
      .from('workouts')
      .select('*')
      .eq('client_id', clientId);
  },

  async getWorkout(workoutId: string) {
    return supabase
      .from('workouts')
      .select('*, workout_exercises(*)')
      .eq('id', workoutId)
      .single();
  },

  async createWorkout(trainerId: string, clientId: string, data: Omit<TrainerWorkout, 'id' | 'trainer_id' | 'client_id' | 'created_at'>) {
    return supabase
      .from('workouts')
      .insert({
        trainer_id: trainerId,
        client_id: clientId,
        ...data,
      })
      .select()
      .single();
  },

  async updateWorkout(workoutId: string, data: Partial<TrainerWorkout>) {
    return supabase
      .from('workouts')
      .update(data)
      .eq('id', workoutId)
      .select()
      .single();
  },

  async deleteWorkout(workoutId: string) {
    return supabase.from('workouts').delete().eq('id', workoutId);
  },
};

// Workout Exercises
export const exerciseService = {
  async getWorkoutExercises(workoutId: string) {
    return supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', workoutId)
      .order('order_index', { ascending: true });
  },

  async createExercise(data: Omit<WorkoutExercise, 'id' | 'created_at'>) {
    return supabase
      .from('workout_exercises')
      .insert(data)
      .select()
      .single();
  },

  async updateExercise(exerciseId: string, data: Partial<WorkoutExercise>) {
    return supabase
      .from('workout_exercises')
      .update(data)
      .eq('id', exerciseId)
      .select()
      .single();
  },

  async deleteExercise(exerciseId: string) {
    return supabase.from('workout_exercises').delete().eq('id', exerciseId);
  },
};

// Logged Sets
export const loggingService = {
  async logSet(data: Omit<LoggedSet, 'id' | 'created_at'>) {
    return supabase
      .from('logged_sets')
      .insert(data)
      .select()
      .single();
  },

  async getClientHistory(clientId: string, limit = 50) {
    return supabase
      .from('logged_sets')
      .select('*')
      .eq('client_id', clientId)
      .order('completed_at', { ascending: false })
      .limit(limit);
  },

  async getExerciseHistory(exerciseId: string, clientId: string) {
    return supabase
      .from('logged_sets')
      .select('*')
      .eq('workout_exercise_id', exerciseId)
      .eq('client_id', clientId)
      .order('completed_at', { ascending: false });
  },
};

// Trophies
export const trophyService = {
  async getTrophies() {
    return supabase.from('trophies').select('*');
  },

  async getClientTrophies(clientId: string) {
    return supabase
      .from('client_trophies')
      .select('*, trophies(*)')
      .eq('client_id', clientId);
  },

  async awardTrophy(clientId: string, trophyId: string) {
    return supabase
      .from('client_trophies')
      .insert({
        client_id: clientId,
        trophy_id: trophyId,
      })
      .select()
      .single();
  },

  async createCustomTrophy(data: Omit<Trophy, 'id' | 'created_at'>) {
    return supabase
      .from('trophies')
      .insert(data)
      .select()
      .single();
  },
};
