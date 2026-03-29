import React from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Box, Text } from '@shopify/restyle';
import Svg, { Circle } from 'react-native-svg';

export default function HomeScreen() {
  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Box paddingHorizontal="l" paddingTop="xl" paddingBottom="m">
          <Text variant="caption" marginBottom="xs">
            GOOD MORNING
          </Text>
          <Text variant="h1">
            Let's train.
          </Text>
        </Box>

        {/* Today's Workout CTA */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Pressable>
            <Box
              backgroundColor="primary"
              padding="l"
              borderRadius="xl"
              style={{
                shadowColor: '#10B981',
                shadowOpacity: 0.2,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
              }}
            >
              <Text variant="label" color="white" style={{ opacity: 0.7 }}>
                TODAY'S WORKOUT
              </Text>
              <Text variant="h2" color="white" marginTop="xs">
                Upper Body Strength
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <Text variant="bodySm" color="white" style={{ opacity: 0.8 }}>
                  4 exercises
                </Text>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                <Text variant="bodySm" color="white" style={{ opacity: 0.8 }}>
                  45 min
                </Text>
              </View>
              <Box
                backgroundColor="white"
                paddingHorizontal="l"
                paddingVertical="m"
                borderRadius="m"
                marginTop="l"
                alignItems="center"
              >
                <Text variant="subMd" color="primary" style={{ fontWeight: '600' }}>
                  Start Workout
                </Text>
              </Box>
            </Box>
          </Pressable>
        </Box>

        {/* Macro Rings */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Text variant="label" marginBottom="m">
            TODAY'S NUTRITION
          </Text>
          <Box
            backgroundColor="surface"
            borderRadius="xl"
            padding="l"
            borderWidth={1}
            borderColor="borderLight"
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <MacroRing value={1450} max={2200} label="Calories" unit="cal" color="#10B981" />
              <MacroRing value={120} max={165} label="Protein" unit="g" color="#3B82F6" />
              <MacroRing value={180} max={250} label="Carbs" unit="g" color="#F97316" />
              <MacroRing value={48} max={70} label="Fat" unit="g" color="#8B5CF6" />
            </View>
          </Box>
        </Box>

        {/* AI Insight */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Box
            backgroundColor="primaryLight"
            borderRadius="l"
            padding="m"
            borderWidth={1}
            borderColor="borderLight"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <View style={{
                width: 20, height: 20, borderRadius: 6,
                backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 10 }}>AI</Text>
              </View>
              <Text variant="caption" color="primary" style={{ fontWeight: '500' }}>
                AI Insight
              </Text>
            </View>
            <Text variant="bodySm" color="textPrimary">
              Your protein intake has been 15% below target this week. Try adding a shake post-workout.
            </Text>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Text variant="label" marginBottom="m">
            THIS WEEK
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <QuickStat label="Workouts" value="4/5" color="#10B981" />
            <QuickStat label="Streak" value="12d" color="#F97316" />
            <QuickStat label="Consistency" value="87%" color="#3B82F6" />
          </View>
        </Box>

        {/* Quick Actions */}
        <Box paddingHorizontal="l" marginBottom="l">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable style={{ flex: 1 }}>
              <Box
                backgroundColor="surface"
                padding="m"
                borderRadius="l"
                alignItems="center"
                borderWidth={1}
                borderColor="borderLight"
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Text style={{ fontSize: 18 }}>📸</Text>
                </View>
                <Text variant="subSm">Scan Food</Text>
              </Box>
            </Pressable>
            <Pressable style={{ flex: 1 }}>
              <Box
                backgroundColor="surface"
                padding="m"
                borderRadius="l"
                alignItems="center"
                borderWidth={1}
                borderColor="borderLight"
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Text style={{ fontSize: 18 }}>💬</Text>
                </View>
                <Text variant="subSm">Message Coach</Text>
              </Box>
            </Pressable>
            <Pressable style={{ flex: 1 }}>
              <Box
                backgroundColor="surface"
                padding="m"
                borderRadius="l"
                alignItems="center"
                borderWidth={1}
                borderColor="borderLight"
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Text style={{ fontSize: 18 }}>📊</Text>
                </View>
                <Text variant="subSm">Progress</Text>
              </Box>
            </Pressable>
          </View>
        </Box>
      </ScrollView>
    </Box>
  );
}

// ─── Macro Ring Component ───────────────────────────────────────────────────

interface MacroRingProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}

function MacroRing({ value, max, label, unit, color }: MacroRingProps) {
  const size = 64;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(value / max, 1);
  const offset = circumference - percentage * circumference;

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F1F1F1"
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text variant="subSm" style={{ fontVariant: ['tabular-nums'] }}>
            {Math.round(value)}
          </Text>
        </View>
      </View>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

// ─── Quick Stat Card ────────────────────────────────────────────────────────

function QuickStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Box
      flex={1}
      backgroundColor="surface"
      padding="m"
      borderRadius="l"
      borderWidth={1}
      borderColor="borderLight"
    >
      <View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: color, marginBottom: 8,
      }} />
      <Text variant="metricSm" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text variant="caption" marginTop="xs">
        {label}
      </Text>
    </Box>
  );
}
