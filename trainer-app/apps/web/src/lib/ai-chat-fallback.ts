/**
 * AI Chat Fallback — Auto-responds when coach hasn't replied in 2 hours.
 * Uses client context (goals, recent workouts, compliance) for personalized responses.
 */

export interface ClientContext {
  name: string;
  goals: string[];
  compliance: number;
  currentStreak: number;
  recentWorkouts: string[];
  dietPlan?: string;
}

const COACH_RESPONSE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

export function shouldAutoRespond(lastCoachMessageAt: string | null): boolean {
  if (!lastCoachMessageAt) return true;
  const elapsed = Date.now() - new Date(lastCoachMessageAt).getTime();
  return elapsed > COACH_RESPONSE_TIMEOUT_MS;
}

export function generateAIResponse(clientMessage: string, context: ClientContext): string {
  const msg = clientMessage.toLowerCase();

  // Workout related
  if (msg.includes('workout') || msg.includes('exercise') || msg.includes('train')) {
    if (context.compliance >= 80) {
      return `Great question! Based on your ${context.currentStreak}-day streak and ${context.compliance}% compliance, you're doing amazing. Your coach will follow up with specific adjustments soon. In the meantime, stick to your current program — consistency is your superpower right now.`;
    }
    return `I can see you've been at ${context.compliance}% compliance recently. The most important thing right now is getting back on track with consistent sessions. Even a 20-minute workout counts. Your coach will review your program and may simplify it to help you build momentum. Hang in there, ${context.name.split(' ')[0]}!`;
  }

  // Diet/nutrition related
  if (msg.includes('diet') || msg.includes('food') || msg.includes('eat') || msg.includes('macro') || msg.includes('calorie')) {
    return `Good question about nutrition! Your coach will give you personalized advice based on your current plan. As a general tip: focus on hitting your protein target first (it's the most important macro for ${context.goals.includes('Build Muscle') ? 'muscle growth' : 'body composition'}), then fill in carbs and fats around your training. Stay hydrated!`;
  }

  // Motivation/struggling
  if (msg.includes('motivation') || msg.includes('struggling') || msg.includes('tired') || msg.includes('skip') || msg.includes('hard')) {
    return `I hear you, ${context.name.split(' ')[0]}. Every athlete has tough days — what separates the best is showing up anyway. Remember why you started: ${context.goals.join(', ')}. Even 50% effort is better than 0%. Your coach will check in with you soon with a plan to get you back on track.`;
  }

  // Progress/results
  if (msg.includes('progress') || msg.includes('result') || msg.includes('weight') || msg.includes('stronger')) {
    return `Your coach will review your progress data in detail. What I can see: you're at a ${context.currentStreak}-day streak with ${context.compliance}% adherence. ${context.compliance >= 70 ? 'Those numbers are solid — trust the process and results will follow.' : 'Let\'s focus on improving consistency first — that\'s the #1 predictor of results.'} Keep logging your workouts so we can track everything!`;
  }

  // Default
  return `Thanks for your message! Your coach has been notified and will respond soon. In the meantime, if you have any urgent questions about your workout or nutrition plan, feel free to ask and I'll do my best to help based on your profile and goals.`;
}

export function getAIDisclaimerMessage(): string {
  return 'This is an AI-generated response based on your profile. Your coach will review and follow up personally.';
}
