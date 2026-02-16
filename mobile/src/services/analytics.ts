/**
 * Analytics service for tracking user behavior
 * Supports multiple providers (Mixpanel, Amplitude, etc.)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private enabled: boolean = true;
  private userId: string | null = null;
  private initialized: boolean = false;

  /**
   * Initialize analytics service
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    // Check if analytics is enabled
    const analyticsEnabled = await AsyncStorage.getItem('analytics_enabled');
    this.enabled = analyticsEnabled !== 'false';

    if (userId) {
      this.userId = userId;
      await this.identify(userId);
    }

    this.initialized = true;
    this.track('app_opened');
  }

  /**
   * Identify user for analytics
   */
  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    this.userId = userId;
    
    // Store user ID
    await AsyncStorage.setItem('analytics_user_id', userId);

    // Here you would integrate with your analytics provider
    // Example: Mixpanel.identify(userId, traits);
    console.log('[Analytics] Identify:', userId, traits);
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.enabled || !this.initialized) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userId: this.userId,
      },
    };

    // Here you would send to your analytics provider
    // Example: Mixpanel.track(eventName, event.properties);
    console.log('[Analytics] Track:', event);

    // Store events locally for offline sync
    this.storeEventLocally(event);
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    // Example: Mixpanel.people.set(properties);
    console.log('[Analytics] Set user properties:', properties);
  }

  /**
   * Store event locally for offline sync
   */
  private async storeEventLocally(event: AnalyticsEvent): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('analytics_queue');
      const queue: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
      queue.push(event);
      
      // Keep only last 100 events
      if (queue.length > 100) {
        queue.shift();
      }
      
      await AsyncStorage.setItem('analytics_queue', JSON.stringify(queue));
    } catch (error) {
      console.error('[Analytics] Failed to store event locally:', error);
    }
  }

  /**
   * Sync queued events (call when online)
   */
  async syncQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('analytics_queue');
      if (!stored) return;

      const queue: AnalyticsEvent[] = JSON.parse(stored);
      
      // Send all queued events
      for (const event of queue) {
        // Send to analytics provider
        console.log('[Analytics] Syncing:', event);
      }

      // Clear queue after successful sync
      await AsyncStorage.removeItem('analytics_queue');
    } catch (error) {
      console.error('[Analytics] Failed to sync queue:', error);
    }
  }

  /**
   * Enable/disable analytics
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;
    await AsyncStorage.setItem('analytics_enabled', enabled.toString());
  }

  /**
   * Reset analytics (logout)
   */
  async reset(): Promise<void> {
    this.userId = null;
    await AsyncStorage.removeItem('analytics_user_id');
    await AsyncStorage.removeItem('analytics_queue');
  }
}

export const analytics = new AnalyticsService();

