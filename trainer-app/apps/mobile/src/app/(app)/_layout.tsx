import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animationEnabled: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{
          headerShown: false,
          animationEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="form-check" 
        options={{
          title: 'Form Check',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="diet-plan/[id]" 
        options={{
          title: 'Diet Plan Details',
        }} 
      />
      <Stack.Screen 
        name="workout/[id]" 
        options={{
          title: 'Workout Session',
        }} 
      />
    </Stack>
  );
}
