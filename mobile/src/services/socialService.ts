import { apiService } from './apiService';

export interface BookingDTO {
  id: string;
  session_type: string;
  coach_name: string | null;
  client_name: string | null;
  scheduled_at: string | null;
  duration_min: number;
  mode: string;
  status: string;
  notes: string | null;
}

export interface ChallengeDTO {
  id: string;
  name: string;
  description: string | null;
  metric: string;
  goal: number | null;
  entry_fee: string | null;
  prize_pool: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: 'upcoming' | 'active' | 'past';
  days_left: number | null;
  participant_count: number;
  joined: boolean;
  my_progress: number;
  my_rank: number | null;
}

export interface LeaderboardEntryDTO {
  id: string;
  name: string;
  compliance: number;
  streak: number;
  volume: number;
  is_current_user: boolean;
  rank: number;
}

export interface GroceryCategoryDTO {
  id: string;
  label: string;
  items: { name: string; quantity: string }[];
}

class SocialService {
  getBookings(): Promise<BookingDTO[]> {
    return apiService.get<BookingDTO[]>('/bookings');
  }
  createBooking(body: { session_type: string; scheduled_at: string; mode?: string; coach_id?: string; duration_min?: number }): Promise<BookingDTO> {
    return apiService.post<BookingDTO>('/bookings', body);
  }
  updateBookingStatus(id: string, status: string): Promise<BookingDTO> {
    return apiService.patch<BookingDTO>(`/bookings/${id}/status`, { status });
  }

  getChallenges(): Promise<ChallengeDTO[]> {
    return apiService.get<ChallengeDTO[]>('/challenges');
  }
  joinChallenge(id: string): Promise<ChallengeDTO> {
    return apiService.post<ChallengeDTO>(`/challenges/${id}/join`, {});
  }

  getLeaderboard(metric: 'compliance' | 'streaks' | 'volume'): Promise<{ metric: string; entries: LeaderboardEntryDTO[] }> {
    return apiService.get(`/social/leaderboard?metric=${metric}`);
  }

  getGroceryList(): Promise<{ plan_id: string | null; categories: GroceryCategoryDTO[] }> {
    return apiService.get('/grocery/list');
  }
}

export const socialService = new SocialService();
