import React from 'react';
import { ScrollView, View, Dimensions, Pressable } from 'react-native';
import { Box, Text } from '@shopify/restyle';
import Svg, { Circle } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Box paddingHorizontal="l" paddingTop="xl" paddingBottom="m">
          <Text variant="caption">YOUR JOURNEY</Text>
          <Text variant="h1" marginTop="xs">Progress</Text>
        </Box>

        {/* Streak Card */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Box
            backgroundColor="surface"
            borderRadius="xl"
            padding="l"
            borderWidth={1}
            borderColor="borderLight"
            alignItems="center"
          >
            <View style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Text variant="metric" color="orange" style={{ fontSize: 28 }}>
                12
              </Text>
            </View>
            <Text variant="subLg">Day Streak</Text>
            <Text variant="caption" marginTop="xs">
              Longest: 21 days
            </Text>
          </Box>
        </Box>

        {/* This Week Stats */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Text variant="label" marginBottom="m">THIS WEEK</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <StatTile label="Workouts" value="4" subvalue="/5" color="#10B981" />
            <StatTile label="Duration" value="180" subvalue="min" color="#3B82F6" />
            <StatTile label="Volume" value="12.4" subvalue="tons" color="#8B5CF6" />
          </View>
        </Box>

        {/* Weight Chart Placeholder */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Text variant="label" marginBottom="m">WEIGHT TREND</Text>
          <Box
            backgroundColor="surface"
            borderRadius="xl"
            padding="l"
            borderWidth={1}
            borderColor="borderLight"
          >
            {/* Simplified chart visualization */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
              {[82, 81.5, 81.2, 80.8, 80.5, 80.3, 80.0].map((w, i) => {
                const maxW = 82;
                const minW = 79;
                const height = ((w - minW) / (maxW - minW)) * 60 + 20;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height,
                      backgroundColor: i === 6 ? '#10B981' : '#D1FAE5',
                      borderRadius: 4,
                    }}
                  />
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text variant="caption">Mon</Text>
              <Text variant="caption">Today</Text>
            </View>
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', marginTop: 12,
              paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F1F1',
            }}>
              <View>
                <Text variant="caption">Current</Text>
                <Text variant="metricSm" style={{ fontVariant: ['tabular-nums'] }}>80.0 kg</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="caption">This week</Text>
                <Text variant="subSm" color="success">-0.5 kg</Text>
              </View>
            </View>
          </Box>
        </Box>

        {/* Strength PRs */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Text variant="label" marginBottom="m">PERSONAL RECORDS</Text>
          {[
            { exercise: 'Bench Press', weight: '102.5 kg', date: '2 weeks ago' },
            { exercise: 'Squat', weight: '142.5 kg', date: '1 week ago' },
            { exercise: 'Deadlift', weight: '185 kg', date: '3 days ago' },
          ].map((pr, i) => (
            <Box
              key={i}
              backgroundColor="surface"
              padding="m"
              borderRadius="l"
              marginBottom="s"
              borderWidth={1}
              borderColor="borderLight"
              flexDirection="row"
              alignItems="center"
            >
              <Box
                width={36}
                height={36}
                borderRadius="m"
                backgroundColor="warningLight"
                alignItems="center"
                justifyContent="center"
                marginRight="m"
              >
                <Text style={{ fontSize: 16 }}>🏆</Text>
              </Box>
              <Box flex={1}>
                <Text variant="subSm">{pr.exercise}</Text>
                <Text variant="caption" marginTop="xs">{pr.date}</Text>
              </Box>
              <Text variant="subMd" color="primary" style={{ fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                {pr.weight}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Body Composition Rings */}
        <Box paddingHorizontal="l" marginBottom="l">
          <Text variant="label" marginBottom="m">BODY COMPOSITION</Text>
          <Box
            backgroundColor="surface"
            borderRadius="xl"
            padding="l"
            borderWidth={1}
            borderColor="borderLight"
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <BodyMetric value={80.0} unit="kg" label="Weight" target={78} />
              <BodyMetric value={16.2} unit="%" label="Body Fat" target={14} />
              <BodyMetric value={67.3} unit="kg" label="Lean Mass" target={67} />
            </View>
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}

// ─── Stat Tile ──────────────────────────────────────────────────────────────

function StatTile({ label, value, subvalue, color }: {
  label: string; value: string; subvalue: string; color: string;
}) {
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
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text variant="metricSm" style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
        <Text variant="caption" marginLeft="xs">{subvalue}</Text>
      </View>
      <Text variant="caption" marginTop="xs">{label}</Text>
    </Box>
  );
}

// ─── Body Metric ────────────────────────────────────────────────────────────

function BodyMetric({ value, unit, label, target }: {
  value: number; unit: string; label: string; target: number;
}) {
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Text variant="metricSm" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
        <Text variant="caption"> {unit}</Text>
      </Text>
      <Text variant="caption">{label}</Text>
      <Text variant="caption" color="textTertiary">
        Target: {target}{unit}
      </Text>
    </View>
  );
}
