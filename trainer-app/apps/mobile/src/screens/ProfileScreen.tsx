import React from 'react';
import { ScrollView } from 'react-native';
import { Box, Text } from '@shopify/restyle';

export default function ProfileScreen() {
  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Profile Header */}
        <Box
          paddingVertical="lg"
          paddingHorizontal="md"
          backgroundColor="primary"
          alignItems="center"
        >
          <Text style={{ fontSize: 64 }} marginBottom="md">
            👤
          </Text>
          <Text variant="heading2" color="white" marginBottom="xs">
            Alex Johnson
          </Text>
          <Text variant="body" color="white" opacity={0.8}>
            Fitness Enthusiast
          </Text>
        </Box>

        {/* Stats */}
        <Box paddingHorizontal="md" marginTop="lg" marginBottom="lg">
          <Text variant="heading3" marginBottom="md">
            Overview
          </Text>
          {[
            { label: 'Total Workouts', value: '45' },
            { label: 'Streak', value: '12 days' },
            { label: 'Member Since', value: '6 months' },
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
            >
              <Text variant="body">{stat.label}</Text>
              <Text variant="heading3" color="primary">
                {stat.value}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Settings */}
        <Box paddingHorizontal="md" marginBottom="xl">
          <Text variant="heading3" marginBottom="md">
            Settings
          </Text>
          {[
            { label: 'Edit Profile', icon: '✏️' },
            { label: 'Preferences', icon: '⚙️' },
            { label: 'Privacy Policy', icon: '🔒' },
            { label: 'About', icon: 'ℹ️' },
          ].map((item, index) => (
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
              <Box flexDirection="row" alignItems="center" gap={12}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <Text variant="body">{item.label}</Text>
              </Box>
              <Text style={{ fontSize: 18 }}>›</Text>
            </Box>
          ))}
        </Box>
      </ScrollView>
    </Box>
  );
}
