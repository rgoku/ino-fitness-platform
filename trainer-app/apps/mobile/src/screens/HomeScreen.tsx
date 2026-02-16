import React from 'react';
import { ScrollView, View } from 'react-native';
import { Box, Text } from '@shopify/restyle';

export default function HomeScreen() {
  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Box paddingVertical="lg" paddingHorizontal="md">
          <Text variant="heading1">Welcome Back! 👋</Text>
          <Text variant="bodySmall" color="textSecondary" marginTop="sm">
            Let's crush your fitness goals today
          </Text>
        </Box>

        {/* Quick Stats */}
        <Box paddingHorizontal="md" marginBottom="lg">
          <Text variant="heading3" marginBottom="md">
            Today's Stats
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <StatCard label="Workouts" value="2" emoji="💪" />
            <StatCard label="Calories" value="450" emoji="🔥" />
            <StatCard label="Steps" value="8,234" emoji="👟" />
          </View>
        </Box>

        {/* Upcoming Workouts */}
        <Box paddingHorizontal="md" marginBottom="lg">
          <Text variant="heading3" marginBottom="md">
            Today's Workout
          </Text>
          <Box
            backgroundColor="surface"
            padding="md"
            borderRadius="lg"
            borderWidth={1}
            borderColor="border"
          >
            <Text variant="body" marginBottom="sm">
              Upper Body Strength 💪
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              4 exercises • 45 mins
            </Text>
          </Box>
        </Box>

        {/* Motivational Quote */}
        <Box paddingHorizontal="md">
          <Box
            backgroundColor="primary"
            padding="lg"
            borderRadius="lg"
            marginBottom="xl"
          >
            <Text variant="body" color="white" marginBottom="sm">
              "The only bad workout is the one you didn't do."
            </Text>
            <Text variant="label" color="white" opacity={0.8}>
              — Unknown
            </Text>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  emoji: string;
}

function StatCard({ label, value, emoji }: StatCardProps) {
  return (
    <Box
      flex={1}
      backgroundColor="surface"
      padding="md"
      borderRadius="lg"
      borderWidth={1}
      borderColor="border"
      alignItems="center"
    >
      <Text style={{ fontSize: 28 }} marginBottom="xs">
        {emoji}
      </Text>
      <Text variant="heading3" marginBottom="xs">
        {value}
      </Text>
      <Text variant="label">{label}</Text>
    </Box>
  );
}
