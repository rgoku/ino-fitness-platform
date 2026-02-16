import { apiService } from './apiService';
import { DietPlan, Meal, FoodDetectionResult, DailyMacros } from '../types';

class DietService {
  async generateAIDietPlan(biometrics: any, preferences: any): Promise<DietPlan> {
    return apiService.post<DietPlan>('/diet/plans/generate', {
      biometrics,
      preferences,
    });
  }

  async getDietPlans(userId: string): Promise<DietPlan[]> {
    return apiService.get<DietPlan[]>(`/diet/plans?userId=${userId}`);
  }

  async getDietPlan(planId: string): Promise<DietPlan> {
    return apiService.get<DietPlan>(`/diet/plans/${planId}`);
  }

  async createDietPlan(plan: Partial<DietPlan>): Promise<DietPlan> {
    return apiService.post<DietPlan>('/diet/plans', plan);
  }

  async updateDietPlan(planId: string, updates: Partial<DietPlan>): Promise<DietPlan> {
    return apiService.put<DietPlan>(`/diet/plans/${planId}`, updates);
  }

  async deleteDietPlan(planId: string): Promise<void> {
    return apiService.delete<void>(`/diet/plans/${planId}`);
  }

  async getMeals(planId?: string): Promise<Meal[]> {
    const url = planId ? `/diet/meals?planId=${planId}` : '/diet/meals';
    return apiService.get<Meal[]>(url);
  }

  async getMeal(mealId: string): Promise<Meal> {
    return apiService.get<Meal>(`/diet/meals/${mealId}`);
  }

  async analyzeFoodPhoto(imageUri: string, mealType: string): Promise<FoodDetectionResult> {
    const file = {
      uri: imageUri,
      name: 'food_photo.jpg',
      type: 'image/jpeg',
    };

    return apiService.uploadFile<FoodDetectionResult>(
      `/diet/analyze-food?mealType=${mealType}`,
      file
    );
  }

  async logFoodEntry(userId: string, foodData: any): Promise<any> {
    return apiService.post(`/diet/log/${userId}`, foodData);
  }

  async getDailyMacros(userId: string, date: string): Promise<DailyMacros> {
    return apiService.get<DailyMacros>(`/diet/macros?userId=${userId}&date=${date}`);
  }

  async getWeeklyMacros(userId: string, weekStartDate: string): Promise<DailyMacros[]> {
    return apiService.get<DailyMacros[]>(`/diet/macros/weekly?userId=${userId}&startDate=${weekStartDate}`);
  }

  async getRecipes(ingredients: string[], restrictions: string[] = []): Promise<Meal[]> {
    const params = new URLSearchParams({
      ingredients: ingredients.join(','),
      restrictions: restrictions.join(','),
    });

    return apiService.get<Meal[]>(`/diet/recipes?${params.toString()}`);
  }

  async getMealSwaps(mealId: string, count: number = 3): Promise<Meal[]> {
    return apiService.get<Meal[]>(`/diet/meals/${mealId}/swaps?count=${count}`);
  }

  async generateMealPrepGuide(planId: string): Promise<any> {
    return apiService.post(`/diet/meal-prep-guide`, { planId });
  }

  async getNutritionInsights(userId: string, days: number = 7): Promise<any> {
    return apiService.get(`/diet/insights?userId=${userId}&days=${days}`);
  }

  async addFavorite(mealId: string): Promise<any> {
    return apiService.post(`/diet/meals/${mealId}/favorite`, {});
  }

  async removeFavorite(mealId: string): Promise<any> {
    return apiService.delete(`/diet/meals/${mealId}/favorite`);
  }

  async getFavoriteMeals(userId: string): Promise<Meal[]> {
    return apiService.get<Meal[]>(`/diet/favorites?userId=${userId}`);
  }

  async updateMacrosTarget(userId: string, targets: any): Promise<any> {
    return apiService.put(`/diet/macros-target/${userId}`, targets);
  }

  async getRestrictedFoods(userId: string): Promise<string[]> {
    return apiService.get<string[]>(`/diet/restricted-foods/${userId}`);
  }

  async addRestrictedFood(userId: string, food: string): Promise<any> {
    return apiService.post(`/diet/restricted-foods/${userId}`, { food });
  }

  async removeRestrictedFood(userId: string, food: string): Promise<any> {
    return apiService.delete(`/diet/restricted-foods/${userId}/${food}`);
  }
}

export const dietService = new DietService();
