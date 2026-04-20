export type NotificationType =
  | 'workout_reminder'
  | 'meal_reminder'
  | 'coach_message'
  | 'achievement_unlocked'
  | 'weekly_report'
  | 'check_in_due'
  | 'streak_warning';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}
