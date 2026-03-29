import React, { useState, useEffect, useCallback, useMemo } from '../lib/react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { DailyMacros, Streak, Trophy } from '../types';
import { apiService } from '../services/apiService';
import { workoutService } from '../services/workoutService';
import { dietService } from '../services/dietService';
import { aiCoachService } from '../services/aiCoachService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Design Tokens ──────────────────────────────────────────────────────────

const colors = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F8F8',
  surfaceTertiary: '#F1F1F1',
  border: '#E4E4E7',
  borderLight: '#F0F0F2',
  textPrimary: '#09090B',
  textSecondary: '#52525B',
  textTertiary: '#A0A0AB',
  accent: '#10B981',
  accentLight: '#ECFDF5',
  accentDark: '#059669',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  orange: '#F97316',
  orangeLight: '#FFF7ED',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  white: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
};

// ─── Macro Ring ──────────��──────────────────────────────────────────────────

const MacroRing = React.memo(({ value, max, label, unit, color }: {
  value: number; max: number; label: string; unit: string; color: string;
}) => {
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
          <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.surfaceTertiary} strokeWidth={strokeWidth} />
          <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`} strokeDashoffset={offset} strokeLinecap="round" />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.ringValue}>{Math.round(value)}</Text>
        </View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
});

// ─── Macros Card ──────────────��─────────────────────���───────────────────────

const MacrosCard = React.memo(({ macros }: { macros: DailyMacros }) => (
  <View style={styles.card}>
    <Text style={styles.sectionLabel}>TODAY'S NUTRITION</Text>
    <View style={styles.macrosRow}>
      <MacroRing value={macros.consumed.calories} max={macros.calories} label="Calories" unit="cal" color={colors.accent} />
      <MacroRing value={macros.consumed.protein} max={macros.protein} label="Protein" unit="g" color={colors.blue} />
      <MacroRing value={macros.consumed.carbs} max={macros.carbs} label="Carbs" unit="g" color={colors.orange} />
      <MacroRing value={macros.consumed.fat} max={macros.fat} label="Fat" unit="g" color={colors.purple} />
    </View>
  </View>
));

// ─── AI Insight Card ────────────────────────────────────────────────────────

const AIInsightCard = React.memo(({ message }: { message: string }) => (
  <View style={styles.aiCard}>
    <View style={styles.aiHeader}>
      <View style={styles.aiBadge}>
        <Text style={styles.aiBadgeText}>AI</Text>
      </View>
      <Text style={styles.aiLabel}>AI Insight</Text>
    </View>
    <Text style={styles.aiMessage}>{message}</Text>
  </View>
));

// ─── Quick Actions ──────────────────────────────────────────────────────────

const QuickActions = React.memo(({ onFoodPhoto, onWorkout }: { onFoodPhoto: () => void; onWorkout: () => void }) => (
  <View style={styles.actionsRow}>
    <TouchableOpacity style={styles.actionCard} onPress={onFoodPhoto}>
      <View style={[styles.actionIcon, { backgroundColor: colors.accentLight }]}>
        <Text style={{ fontSize: 18 }}>📸</Text>
      </View>
      <Text style={styles.actionLabel}>Scan Food</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionCard} onPress={onWorkout}>
      <View style={[styles.actionIcon, { backgroundColor: colors.blueLight }]}>
        <Text style={{ fontSize: 18 }}>💪</Text>
      </View>
      <Text style={styles.actionLabel}>Start Workout</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionCard}>
      <View style={[styles.actionIcon, { backgroundColor: colors.purpleLight }]}>
        <Text style={{ fontSize: 18 }}>📊</Text>
      </View>
      <Text style={styles.actionLabel}>Progress</Text>
    </TouchableOpacity>
  </View>
));

// ─── Workout CTA ────────────────────────────────────────────────────────────

const WorkoutCTA = React.memo(({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.workoutCTA} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.workoutCTALabel}>TODAY'S WORKOUT</Text>
    <Text style={styles.workoutCTATitle}>Upper Body Strength</Text>
    <View style={styles.workoutCTAMeta}>
      <Text style={styles.workoutCTAMetaText}>4 exercises</Text>
      <View style={styles.metaDot} />
      <Text style={styles.workoutCTAMetaText}>45 min</Text>
    </View>
    <View style={styles.workoutCTAButton}>
      <Text style={styles.workoutCTAButtonText}>Start Workout</Text>
    </View>
  </TouchableOpacity>
));

// ─── Streak Banner ──────��───────────────────────────────────────────────────

const StreakBanner = React.memo(({ streak }: { streak: Streak }) => (
  <View style={styles.streakBanner}>
    <View style={styles.streakIcon}>
      <Text style={{ fontSize: 20 }}>🔥</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.streakValue}>{streak.currentStreak} day streak</Text>
      <Text style={styles.streakSub}>Longest: {streak.longestStreak} days</Text>
    </View>
  </View>
));

// ─── Trophies ───────���───────────────────────────────────────────────────────

const TrophiesCard = React.memo(({ trophies }: { trophies: Trophy[] }) => {
  const slice = useMemo(() => trophies.slice(0, 3), [trophies]);
  if (slice.length === 0) return null;
  return (
    <View style={{ marginHorizontal: 24, marginBottom: 24 }}>
      <Text style={styles.sectionLabel}>RECENT TROPHIES</Text>
      {slice.map((trophy) => (
        <View key={trophy.id} style={styles.trophyRow}>
          <View style={styles.trophyIcon}>
            <Text style={{ fontSize: 20 }}>{trophy.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.trophyName}>{trophy.name}</Text>
            <Text style={styles.trophyDate}>{new Date(trophy.achievedAt).toLocaleDateString()}</Text>
          </View>
        </View>
      ))}
    </View>
  );
});

// ─── Home Screen ────────────────────────────────────────────────────────────

const HomeScreen = React.memo(({ navigation }: any) => {
  const { user } = useAuth();
  const [macros, setMacros] = useState(null) as [DailyMacros | null, (v: DailyMacros | null) => void];
  const [streak, setStreak] = useState(null) as [Streak | null, (v: Streak | null) => void];
  const [trophies, setTrophies] = useState([]) as unknown as [Trophy[], (v: Trophy[]) => void];
  const [loading, setLoading] = useState(true) as [boolean, (v: boolean) => void];
  const [todayWorkout, setTodayWorkout] = useState(null) as [any, (v: any) => void];
  const [todayMeals, setTodayMeals] = useState(null) as [any, (v: any) => void];

  const loadDashboardData = useCallback(async () => {
    try {
      if (!user?.id) return;
      const [macrosData, streakData, trophiesData] = await Promise.all([
        apiService.get<DailyMacros>('/macros/today'),
        apiService.get<Streak>(`/streaks/${user.id}`),
        apiService.get<Trophy[]>(`/trophies/${user.id}`),
        aiCoachService.getMotivation(user.id),
      ]);
      setMacros(macrosData);
      setStreak(streakData);
      setTrophies(trophiesData);
      const plans = await workoutService.getWorkoutPlans(user.id);
      if (plans.length > 0) setTodayWorkout(plans[0]);
      const diets = await dietService.getDietPlans(user.id);
      if (diets.length > 0) setTodayMeals(diets[0]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onFoodPhoto = useCallback(() => navigation.navigate('FoodPhoto'), [navigation]);
  const onWorkout = useCallback(() => navigation.navigate('WorkoutSession'), [navigation]);
  const onWorkoutCard = useCallback(() => navigation.navigate('Workout'), [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>GOOD MORNING</Text>
        <Text style={styles.headerTitle}>Let's train, {user?.name?.split(' ')[0]}.</Text>
      </View>

      {/* Streak */}
      {streak && streak.currentStreak > 0 && <StreakBanner streak={streak} />}

      {/* Workout CTA */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <WorkoutCTA onPress={onWorkoutCard} />
      </View>

      {/* Macros */}
      {macros && (
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <MacrosCard macros={macros} />
        </View>
      )}

      {/* AI Insight */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <AIInsightCard message="Your protein intake is 15% below target. Try adding a shake post-workout to hit your goals." />
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <QuickActions onFoodPhoto={onFoodPhoto} onWorkout={onWorkout} />
      </View>

      {/* Trophies */}
      <TrophiesCard trophies={trophies} />
    </ScrollView>
  );
});

export default HomeScreen;

// ─── Styles ─���───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  // Section Label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.textTertiary,
    marginBottom: 12,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Macros
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  ringLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },

  // AI Insight
  aiCard: {
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  aiBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.accent,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.accent,
  },
  aiMessage: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
  },

  // Quick Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Workout CTA
  workoutCTA: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  workoutCTALabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.7)',
  },
  workoutCTATitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
    marginTop: 4,
  },
  workoutCTAMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  workoutCTAMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  workoutCTAButton: {
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  workoutCTAButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },

  // Streak
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  streakSub: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },

  // Trophies
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  trophyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  trophyDate: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
