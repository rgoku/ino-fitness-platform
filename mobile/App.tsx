import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as Sentry from '@sentry/react-native';
import { offlineQueue } from './src/services/offlineQueue';
import { analytics } from './src/services/analytics';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

// Initialize Sentry
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: false,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.1, // 10% of transactions
  });
}

export default function App() {
  useEffect(() => {
    // Initialize services
    const initServices = async () => {
      try {
        // Initialize offline queue
        await offlineQueue.initialize();
        
        // Initialize analytics
        await analytics.initialize();
      } catch (error) {
        console.error('Failed to initialize services:', error);
        Sentry.captureException(error);
      }
    };

    initServices();

    // Cleanup on unmount
    return () => {
      offlineQueue.destroy();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
            <NavigationContainer>
              <AppNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </StripeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

