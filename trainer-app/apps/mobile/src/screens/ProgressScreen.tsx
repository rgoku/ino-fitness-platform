import React from 'react';
import { ScrollView } from 'react-native';
import { Box, Text } from '@shopify/restyle';

export default function ProgressScreen() {
  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box paddingVertical="lg" paddingHorizontal="md">
          <Text variant="heading1">Your Progress 📈</Text>
          <Text variant="bodySmall" color="textSecondary" marginTop="sm">
            Track your fitness journey
          </Text>
        </Box>

        {/* Progress Stats */}
        <Box paddingHorizontal="md" marginBottom="lg">
          <Text variant="heading3" marginBottom="md">
            This Week
          </Text>
          {[
            { label: 'Workouts Completed', value: '4/5', color: 'primary' as const },
            { label: 'Total Duration', value: '180 mins', color: 'success' as const },
            { label: 'Calories Burned', value: '2,840 kcal', color: 'warning' as const },
          ].map((stat, index) => (
            <Box
              key={index}
              backgroundColor="surface"
              padding="md"
              borderRadius="lg"
              marginBottom="md"
              borderWidth={1}
              borderColor="border"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Text variant="body">{stat.label}</Text>
              <Box
                backgroundColor={stat.color}
                paddingHorizontal="md"
                paddingVertical="sm"
                borderRadius="md"
              >
                <Text variant="bodySmall" color="white">
                  {stat.value}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Personal Records */}
        <Box paddingHorizontal="md">
          <Text variant="heading3" marginBottom="md">
            Personal Records 🏆
          </Text>
          {[
            { exercise: 'Bench Press', weight: '225 lbs', date: '2 weeks ago' },
            { exercise: 'Squat', weight: '315 lbs', date: '1 week ago' },
            { exercise: 'Deadlift', weight: '405 lbs', date: '3 days ago' },
          ].map((pr, index) => (
            <Box
              key={index}
              backgroundColor="surface"
              padding="md"
              borderRadius="lg"
              marginBottom="md"
              borderWidth={1}
              borderColor="border"
            >
              <Text variant="body" marginBottom="xs">
                {pr.exercise}
              </Text>
              <Text variant="heading3" color="primary" marginBottom="xs">
                {pr.weight}
              </Text>
              <Text variant="label" color="textSecondary">
                {pr.date}
              </Text>
            </Box>
          ))}
        </Box>
      </ScrollView>
    </Box>
  );
}
