import { useQuery } from '@tanstack/react-query';
import { api, USE_API } from '@/lib/api';

export type AlertSeverity = 'critical' | 'warn' | 'info';
export type AlertType =
  | 'weight_stall'
  | 'low_adherence'
  | 'skipped_workouts'
  | 'nutrition_miss'
  | 'sleep_decline'
  | 'recovery_decline';

export interface CoachAlert {
  id: string;
  client_id: string;
  client_name: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metric?: Record<string, unknown>;
  created_at: string;
}

export interface AlertSummary {
  critical: number;
  warn: number;
  info: number;
  total: number;
}

export function useAlerts() {
  return useQuery({
    queryKey: ['coach-alerts'],
    queryFn: async (): Promise<CoachAlert[]> => {
      if (USE_API) {
        return api.get<CoachAlert[]>('/api/v1/coaching/alerts');
      }
      return [];
    },
    refetchInterval: 60_000,
  });
}

export function useAlertSummary() {
  return useQuery({
    queryKey: ['coach-alerts-summary'],
    queryFn: async (): Promise<AlertSummary> => {
      if (USE_API) {
        return api.get<AlertSummary>('/api/v1/coaching/alerts/summary');
      }
      return { critical: 0, warn: 0, info: 0, total: 0 };
    },
    refetchInterval: 60_000,
  });
}
