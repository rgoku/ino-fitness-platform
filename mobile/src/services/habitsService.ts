import { apiService } from './apiService';

export interface HabitLog {
  id: string;
  habit_type: string;
  value: number;
  target: number | null;
  unit: string | null;
  notes: string | null;
  date: string;
  created_at: string;
}

export interface TodaySummary {
  date: string;
  habits: HabitLog[];
  completion_rate: number;
}

/** Thin wrapper over the backend /habits endpoints. */
class HabitsService {
  getToday(): Promise<TodaySummary> {
    return apiService.get<TodaySummary>('/habits/today');
  }

  getHistory(days: number = 30): Promise<HabitLog[]> {
    return apiService.get<HabitLog[]>(`/habits/history?days=${days}`);
  }

  logHabit(habitType: string, value: number, target: number = 1): Promise<HabitLog> {
    return apiService.post<HabitLog>('/habits', {
      habit_type: habitType,
      value,
      target,
    });
  }
}

export const habitsService = new HabitsService();
