import { apiService } from './apiService';
import { ProgressEntry, Trophy, Streak } from '../types';

class ProgressService {
  async logProgress(userId: string, data: Partial<ProgressEntry>): Promise<ProgressEntry> {
    return apiService.post<ProgressEntry>(`/progress/${userId}`, data);
  }

  async getProgress(userId: string, days: number = 90): Promise<ProgressEntry[]> {
    return apiService.get<ProgressEntry[]>(`/progress?userId=${userId}&days=${days}`);
  }

  async getProgressEntry(progressId: string): Promise<ProgressEntry> {
    return apiService.get<ProgressEntry>(`/progress/${progressId}`);
  }

  async updateProgressEntry(progressId: string, updates: Partial<ProgressEntry>): Promise<ProgressEntry> {
    return apiService.put<ProgressEntry>(`/progress/${progressId}`, updates);
  }

  async deleteProgressEntry(progressId: string): Promise<void> {
    return apiService.delete<void>(`/progress/${progressId}`);
  }

  async addWeightEntry(userId: string, weight: number, date: string): Promise<ProgressEntry> {
    return apiService.post<ProgressEntry>(`/progress/${userId}/weight`, {
      weight,
      date,
    });
  }

  async addMeasurements(userId: string, measurements: any, date: string): Promise<ProgressEntry> {
    return apiService.post<ProgressEntry>(`/progress/${userId}/measurements`, {
      measurements,
      date,
    });
  }

  async addPhotoProgress(userId: string, photoUri: string, category: string = 'general'): Promise<ProgressEntry> {
    const file = {
      uri: photoUri,
      name: `progress_${Date.now()}.jpg`,
      type: 'image/jpeg',
    };

    return apiService.uploadFile<ProgressEntry>(
      `/progress/${userId}/photos?category=${category}`,
      file
    );
  }

  async getPhotoTimeline(userId: string): Promise<string[]> {
    return apiService.get<string[]>(`/progress/${userId}/timeline`);
  }

  async getWeightTrend(userId: string, days: number = 90): Promise<any> {
    return apiService.get(`/progress/${userId}/weight-trend?days=${days}`);
  }

  async getBodyMetricsTrend(userId: string, metric: string, days: number = 90): Promise<any> {
    return apiService.get(`/progress/${userId}/metrics-trend?metric=${metric}&days=${days}`);
  }

  async getTrophies(userId: string): Promise<Trophy[]> {
    return apiService.get<Trophy[]>(`/progress/${userId}/trophies`);
  }

  async getStreak(userId: string): Promise<Streak> {
    return apiService.get<Streak>(`/progress/${userId}/streak`);
  }

  async getAchievements(userId: string): Promise<any[]> {
    return apiService.get(`/progress/${userId}/achievements`);
  }

  async compareBefore(userId: string, daysBefore: number = 90): Promise<any> {
    return apiService.get(`/progress/${userId}/compare?days=${daysBefore}`);
  }

  async getProgressSummary(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    return apiService.get(`/progress/${userId}/summary?period=${period}`);
  }

  async getGoalProgress(userId: string, goalId: string): Promise<any> {
    return apiService.get(`/progress/${userId}/goals/${goalId}`);
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<any> {
    return apiService.post(`/progress/${userId}/achievements/${achievementId}/unlock`, {});
  }

  async shareProgress(userId: string, progressId: string): Promise<string> {
    return apiService.post<string>(`/progress/${progressId}/share`, { userId });
  }

  async getMonthlyReport(userId: string, month: number, year: number): Promise<any> {
    return apiService.get(`/progress/${userId}/report?month=${month}&year=${year}`);
  }

  async logMood(userId: string, mood: string, date: string): Promise<ProgressEntry> {
    return apiService.post<ProgressEntry>(`/progress/${userId}/mood`, {
      mood,
      date,
    });
  }

  async getMoodTrend(userId: string, days: number = 30): Promise<any> {
    return apiService.get(`/progress/${userId}/mood-trend?days=${days}`);
  }
}

export const progressService = new ProgressService();
