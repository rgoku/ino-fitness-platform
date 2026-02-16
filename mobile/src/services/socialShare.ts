/**
 * Social sharing service
 */
import Share from 'react-native-share';
import { analytics } from './analytics';

interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
  subject?: string;
}

class SocialShareService {
  /**
   * Share workout
   */
  async shareWorkout(workout: any): Promise<void> {
    const message = `💪 Just completed ${workout.name}!\n\n${workout.exercises?.length || 0} exercises\n${workout.duration || 'N/A'} minutes`;
    
    await this.share({
      title: 'Check out my workout!',
      message,
      url: `https://ino.fitness/workouts/${workout.id}`,
    });

    analytics.track('workout_shared', { workout_id: workout.id });
  }

  /**
   * Share progress/PR
   */
  async shareProgress(progress: any): Promise<void> {
    const message = `🎉 New Personal Record!\n\n${progress.exercise}: ${progress.weight}lbs x ${progress.reps} reps`;
    
    await this.share({
      title: 'New PR!',
      message,
    });

    analytics.track('progress_shared', { progress_id: progress.id });
  }

  /**
   * Share achievement
   */
  async shareAchievement(achievement: any): Promise<void> {
    const message = `🏆 Unlocked: ${achievement.name}!\n\n${achievement.description}`;
    
    await this.share({
      title: 'New Achievement!',
      message,
    });

    analytics.track('achievement_shared', { achievement_id: achievement.id });
  }

  /**
   * Generic share method
   */
  async share(options: ShareOptions): Promise<void> {
    try {
      await Share.open({
        title: options.title,
        message: options.message,
        url: options.url,
        subject: options.subject,
      });
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.message !== 'User did not share') {
        console.error('[SocialShare] Share error:', error);
      }
    }
  }
}

export const socialShare = new SocialShareService();

