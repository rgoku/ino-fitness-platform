import { apiService } from './apiService';
import { WorkoutPlan, WorkoutSession, Exercise, FormAnalysisResult } from '../types';

class WorkoutService {
  async generateAIWorkoutPlan(biometrics: any): Promise<WorkoutPlan> {
    return apiService.post<WorkoutPlan>('/workouts/plans/generate', {
      biometrics,
    });
  }

  async getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    return apiService.get<WorkoutPlan[]>(`/workouts/plans?userId=${userId}`);
  }

  async getWorkoutPlan(planId: string): Promise<WorkoutPlan> {
    return apiService.get<WorkoutPlan>(`/workouts/plans/${planId}`);
  }

  async createWorkoutPlan(plan: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    return apiService.post<WorkoutPlan>('/workouts/plans', plan);
  }

  async updateWorkoutPlan(planId: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    return apiService.put<WorkoutPlan>(`/workouts/plans/${planId}`, updates);
  }

  async deleteWorkoutPlan(planId: string): Promise<void> {
    return apiService.delete<void>(`/workouts/plans/${planId}`);
  }

  async getExerciseDetails(exerciseId: string): Promise<Exercise> {
    return apiService.get<Exercise>(`/exercises/${exerciseId}`);
  }

  async startWorkoutSession(planId: string): Promise<WorkoutSession> {
    return apiService.post<WorkoutSession>('/workouts/sessions', {
      workoutPlanId: planId,
    });
  }

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    return apiService.put<WorkoutSession>(`/workouts/sessions/${sessionId}`, updates);
  }

  async completeWorkoutSession(sessionId: string, sessionData: any): Promise<WorkoutSession> {
    return apiService.post<WorkoutSession>(`/workouts/sessions/${sessionId}/complete`, sessionData);
  }

  async getWorkoutSessions(userId: string, limit: number = 10): Promise<WorkoutSession[]> {
    return apiService.get<WorkoutSession[]>(`/workouts/sessions?userId=${userId}&limit=${limit}`);
  }

  async analyzeFormFromVideo(sessionId: string, videoUri: string, exerciseName: string): Promise<FormAnalysisResult> {
    const file = {
      uri: videoUri,
      name: 'form_check.mp4',
      type: 'video/mp4',
    };

    return apiService.uploadFile<FormAnalysisResult>(
      `/workouts/analyze-form?sessionId=${sessionId}&exercise=${exerciseName}`,
      file
    );
  }

  async analyzeFormFromImage(image: any, exerciseName: string): Promise<FormAnalysisResult> {
    const file = {
      uri: image.uri,
      name: 'form_check.jpg',
      type: 'image/jpeg',
    };

    return apiService.uploadFile<FormAnalysisResult>(
      `/workouts/analyze-form-image?exercise=${exerciseName}`,
      file
    );
  }

  async getSuggestedExercises(muscleGroup: string, equipment: string[] = []): Promise<Exercise[]> {
    const params = new URLSearchParams({
      muscleGroup,
      equipment: equipment.join(','),
    });

    return apiService.get<Exercise[]>(`/exercises/suggestions?${params.toString()}`);
  }

  async getExerciseLibrary(): Promise<Exercise[]> {
    return apiService.get<Exercise[]>('/exercises/library');
  }

  async logExerciseSet(sessionId: string, exerciseId: string, setData: any): Promise<any> {
    return apiService.post(`/workouts/sessions/${sessionId}/exercises/${exerciseId}/sets`, setData);
  }

  async getWorkoutStats(userId: string, days: number = 30): Promise<any> {
    return apiService.get(`/workouts/stats?userId=${userId}&days=${days}`);
  }

  async favoriteExercise(exerciseId: string): Promise<any> {
    return apiService.post(`/exercises/${exerciseId}/favorite`, {});
  }

  async unfavoriteExercise(exerciseId: string): Promise<any> {
    return apiService.delete(`/exercises/${exerciseId}/favorite`);
  }

  async getFavoriteExercises(userId: string): Promise<Exercise[]> {
    return apiService.get<Exercise[]>(`/exercises/favorites?userId=${userId}`);
  }
}

export const workoutService = new WorkoutService();
