import { apiService } from './apiService';
import { Message, Coach } from '../types';

class CoachingService {
  async getAvailableCoaches(): Promise<Coach[]> {
    return apiService.get<Coach[]>('/coaching/coaches');
  }

  async getCoachProfile(coachId: string): Promise<Coach> {
    return apiService.get<Coach>(`/coaching/coaches/${coachId}`);
  }

  async hireCoach(coachId: string, userId: string): Promise<any> {
    return apiService.post('/coaching/hire', {
      coachId,
      userId,
    });
  }

  async getMyCoaches(userId: string): Promise<Coach[]> {
    return apiService.get<Coach[]>(`/coaching/my-coaches?userId=${userId}`);
  }

  async sendMessage(recipientId: string, content: string, type: string = 'text'): Promise<Message> {
    return apiService.post<Message>('/coaching/messages', {
      recipientId,
      content,
      type,
    });
  }

  async getConversation(coachId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    return apiService.get<Message[]>(
      `/coaching/conversations/${coachId}?limit=${limit}&offset=${offset}`
    );
  }

  async markConversationAsRead(coachId: string): Promise<any> {
    return apiService.post(`/coaching/conversations/${coachId}/read`, {});
  }

  async sendFormCheckRequest(coachId: string, imageUris: string[], exerciseName: string): Promise<any> {
    // Upload images and send request
    return apiService.post(`/coaching/form-check-requests`, {
      coachId,
      imageUris,
      exerciseName,
    });
  }

  async sendProgressUpdate(coachId: string, data: any): Promise<any> {
    return apiService.post(`/coaching/progress-updates`, {
      coachId,
      ...data,
    });
  }

  async getCoachFeedback(feedbackId: string): Promise<any> {
    return apiService.get(`/coaching/feedback/${feedbackId}`);
  }

  async getCoachingHistory(userId: string): Promise<any> {
    return apiService.get(`/coaching/history?userId=${userId}`);
  }

  async requestFormCheck(coachId: string, videoUri: string, exerciseName: string): Promise<any> {
    const file = {
      uri: videoUri,
      name: 'form_check.mp4',
      type: 'video/mp4',
    };

    return apiService.uploadFile<any>(`/coaching/form-check?coachId=${coachId}&exercise=${exerciseName}`, file);
  }

  async endCoachingSession(coachId: string): Promise<any> {
    return apiService.post(`/coaching/end-session`, { coachId });
  }

  async leaveReview(coachId: string, rating: number, review: string): Promise<any> {
    return apiService.post(`/coaching/reviews`, {
      coachId,
      rating,
      review,
    });
  }

  async scheduleCoachingSession(coachId: string, startTime: string, duration: number): Promise<any> {
    return apiService.post(`/coaching/schedule`, {
      coachId,
      startTime,
      duration,
    });
  }

  async getUpcomingSessions(userId: string): Promise<any[]> {
    return apiService.get(`/coaching/sessions/upcoming?userId=${userId}`);
  }

  async cancelSession(sessionId: string): Promise<any> {
    return apiService.post(`/coaching/sessions/${sessionId}/cancel`, {});
  }

  async rescheduleSession(sessionId: string, newStartTime: string): Promise<any> {
    return apiService.post(`/coaching/sessions/${sessionId}/reschedule`, {
      startTime: newStartTime,
    });
  }
}

export const coachingService = new CoachingService();
