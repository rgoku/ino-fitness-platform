import { apiService } from './apiService';
import { Message } from '../types';

class AICoachService {
  async sendMessage(userId: string, content: string, context: string = 'general'): Promise<Message> {
    return apiService.post<Message>('/ai/chat', {
      userId,
      content,
      context,
    });
  }

  async getConversationHistory(userId: string, limit: number = 50): Promise<Message[]> {
    return apiService.get<Message[]>(`/ai/conversations?userId=${userId}&limit=${limit}`);
  }

  async getMotivation(userId: string): Promise<string> {
    return apiService.get<string>(`/ai/motivation?userId=${userId}`);
  }

  async getWorkoutTips(exerciseName: string, level: string = 'intermediate'): Promise<string> {
    return apiService.get<string>(`/ai/tips?exercise=${exerciseName}&level=${level}`);
  }

  async getNutritionAdvice(mealType: string, preferences: any): Promise<string> {
    return apiService.post<string>('/ai/nutrition-advice', {
      mealType,
      preferences,
    });
  }

  async generateWorkoutModification(originalExercise: string, constraints: any): Promise<any> {
    return apiService.post('/ai/modify-exercise', {
      exercise: originalExercise,
      constraints,
    });
  }

  async getMealRecommendation(calories: number, macroPrefs: any): Promise<any> {
    return apiService.post('/ai/recommend-meal', {
      calories,
      macroPrefs,
    });
  }

  async analyzeProgress(userId: string, days: number = 30): Promise<any> {
    return apiService.get(`/ai/progress-analysis?userId=${userId}&days=${days}`);
  }

  async getPersonalizedPlan(userId: string, goals: string[], duration: number): Promise<any> {
    return apiService.post('/ai/personalized-plan', {
      userId,
      goals,
      duration,
    });
  }

  async askQuestion(userId: string, question: string, category: string = 'general'): Promise<Message> {
    return apiService.post<Message>('/ai/ask', {
      userId,
      question,
      category,
    });
  }

  async getAnswerFollowUp(messageId: string, followUp: string): Promise<Message> {
    return apiService.post<Message>(`/ai/follow-up/${messageId}`, {
      followUp,
    });
  }

  async searchKnowledgeBase(query: string): Promise<any[]> {
    return apiService.get(`/ai/search?q=${encodeURIComponent(query)}`);
  }

  async clearConversation(userId: string): Promise<any> {
    return apiService.post(`/ai/clear-conversation`, { userId });
  }

  async getPersonalizedInsights(userId: string): Promise<any> {
    return apiService.get(`/ai/insights?userId=${userId}`);
  }

  async getFitnessAssessment(userId: string): Promise<any> {
    return apiService.get(`/ai/assessment?userId=${userId}`);
  }

  async getRecoveryRecommendations(userId: string): Promise<any> {
    return apiService.get(`/ai/recovery?userId=${userId}`);
  }

  async generateWeeklyReport(userId: string): Promise<any> {
    return apiService.get(`/ai/weekly-report?userId=${userId}`);
  }
}

export const aiCoachService = new AICoachService();
