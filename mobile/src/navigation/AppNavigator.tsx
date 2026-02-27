import React, { useMemo, memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import DietPlanScreen from '../screens/DietPlanScreen';
import WorkoutPlanScreen from '../screens/WorkoutPlanScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FoodPhotoScreen from '../screens/FoodPhotoScreen';
import FormCheckScreen from '../screens/FormCheckScreen';
import ChatScreen from '../screens/ChatScreen';
import WorkoutSessionScreen from '../screens/WorkoutSessionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_SCREEN_OPTIONS = {
  tabBarActiveTintColor: '#007AFF',
  tabBarInactiveTintColor: '#8E8E93',
  tabBarStyle: {
    backgroundColor: '#000000',
    borderTopColor: '#1C1C1E',
  },
  headerStyle: {
    backgroundColor: '#000000',
  },
  headerTintColor: '#FFFFFF',
};

const STACK_SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: '#000000' },
  headerTintColor: '#FFFFFF',
  contentStyle: { backgroundColor: '#000000' },
};

const MainTabs = memo(function MainTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_SCREEN_OPTIONS}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          headerTitle: 'INÖ',
        }}
      />
      <Tab.Screen 
        name="Diet" 
        component={DietPlanScreen}
        options={{
          tabBarLabel: 'Diet',
          headerTitle: 'Diet Plan',
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutPlanScreen}
        options={{
          tabBarLabel: 'Workout',
          headerTitle: 'Workout Plan',
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          headerTitle: 'Progress',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
});

export default function AppNavigator() {
  const { user, loading, hasOnboarded } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={STACK_SCREEN_OPTIONS}>
      {!user ? (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : !hasOnboarded ? (
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="FoodPhoto" 
            component={FoodPhotoScreen}
            options={{ title: 'Food Photo Analysis' }}
          />
          <Stack.Screen 
            name="FormCheck" 
            component={FormCheckScreen}
            options={{ title: 'Form Check' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: 'Chat' }}
          />
          <Stack.Screen 
            name="WorkoutSession" 
            component={WorkoutSessionScreen}
            options={{ title: 'Workout Session' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

