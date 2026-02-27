import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer, type NavigationContainerRef } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Sentry from '@sentry/react-native';
import { offlineQueue } from './src/services/offlineQueue';
import { analytics } from './src/services/analytics';
import * as notificationService from './src/services/notificationService';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

const linking = {
  prefixes: ['ino-fitness://'],
  config: {
    screens: {
      Main: {
        path: '',
        screens: {
          Home: 'home',
          Diet: 'diet',
          Workout: 'workout',
          Progress: 'progress',
          Profile: 'profile',
        },
      },
      FoodPhoto: 'food-photo',
      FormCheck: 'form-check',
      Chat: 'chat',
      WorkoutSession: 'workout-session',
    },
  },
};

// Initialize Sentry
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.1, // 10% of transactions
  });
}

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<Record<string, object | undefined>> | null>(null);

  useEffect(() => {
    // Initialize services
    const initServices = async () => {
      try {
        await offlineQueue.initialize();
        await analytics.initialize();
        await notificationService.init(navigationRef);
        // App opened from killed state by a notification tap
        await notificationService.handleLastNotificationResponse(navigationRef);
      } catch (error) {
        console.error('Failed to initialize services:', error);
        Sentry.captureException(error);
      }
    };

    initServices();

    return () => {
      offlineQueue.destroy();
      notificationService.cleanup();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <NavigationContainer ref={navigationRef as React.RefObject<NavigationContainerRef<Record<string, object | undefined>>>} linking={linking}>
              <AppNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </StripeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

