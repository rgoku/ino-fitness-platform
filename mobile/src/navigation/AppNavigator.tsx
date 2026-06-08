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
import CheckInScreen from '../screens/CheckInScreen';
import JournalScreen from '../screens/JournalScreen';
import HabitsScreen from '../screens/HabitsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import GroceryListScreen from '../screens/GroceryListScreen';
import BookingsScreen from '../screens/BookingsScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_SCREEN_OPTIONS = {
  tabBarActiveTintColor: '#2563EB',
  tabBarInactiveTintColor: '#64748B',
  tabBarStyle: {
    backgroundColor: '#0A0F1E',
    borderTopColor: '#1E293B',
    borderTopWidth: 0.5,
  },
  headerStyle: {
    backgroundColor: '#0A0F1E',
  },
  headerTintColor: '#FFFFFF',
};

const STACK_SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: '#0A0F1E' },
  headerTintColor: '#FFFFFF',
  contentStyle: { backgroundColor: '#0A0F1E' },
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
          <Stack.Screen
            name="CheckIn"
            component={CheckInScreen}
            options={{ title: 'Weekly Check-in' }}
          />
          <Stack.Screen
            name="Journal"
            component={JournalScreen}
            options={{ title: 'Daily Journal' }}
          />
          <Stack.Screen
            name="Habits"
            component={HabitsScreen}
            options={{ title: 'Daily Habits' }}
          />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{ title: 'Leaderboard' }}
          />
          <Stack.Screen
            name="Challenges"
            component={ChallengesScreen}
            options={{ title: 'Challenges' }}
          />
          <Stack.Screen
            name="GroceryList"
            component={GroceryListScreen}
            options={{ title: 'Grocery List' }}
          />
          <Stack.Screen
            name="Bookings"
            component={BookingsScreen}
            options={{ title: 'Bookings' }}
          />
          <Stack.Screen
            name="AIAssistant"
            component={AIAssistantScreen}
            options={{ title: 'AI Assistant' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

