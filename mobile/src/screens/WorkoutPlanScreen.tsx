import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WorkoutPlan, Exercise } from '../types';
import { apiService } from '../services/apiService';
import * as offlineCache from '../services/offlineCache';

const colors = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
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
  white: '#FFFFFF',
};

const ExerciseRow = React.memo(({ item, index }: { item: Exercise; index: number }) => (
  <View style={styles.exerciseCard}>
    {/* Exercise Number */}
    <View style={styles.exerciseNumber}>
      <Text style={styles.exerciseNumberText}>{index + 1}</Text>
    </View>

    {/* Exercise Info */}
    <View style={styles.exerciseInfo}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={styles.exerciseMeta}>
        <Text style={styles.exerciseDetail}>
          {item.sets} x {item.reps}
        </Text>
        {null != item.weight && item.weight > 0 && (
          <>
            <View style={styles.metaDot} />
            <Text style={styles.exerciseDetail}>{item.weight}kg</Text>
          </>
        )}
      </View>
      {item.muscleGroups && item.muscleGroups.length > 0 && (
        <View style={styles.muscleChips}>
          {item.muscleGroups.map((group, i) => (
            <View key={i} style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>{group}</Text>
            </View>
          ))}
        </View>
      )}
      {item.videoUrl ? (
        <TouchableOpacity style={styles.demoButton}>
          <Text style={styles.demoButtonText}>Watch Demo</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
));
ExerciseRow.displayName = 'ExerciseRow';

const WorkoutPlanScreen = React.memo(({ navigation }: any) => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const loadWorkoutPlan = useCallback(async (fromCacheOnly = false) => {
    const cached = await offlineCache.getCached<WorkoutPlan>(offlineCache.CACHE_KEYS.WORKOUT_PLAN);
    if (cached) {
      setWorkoutPlan(cached);
      setIsOffline(false);
    }
    if (fromCacheOnly) { setLoading(false); return; }
    setLoading(true);
    try {
      const plan = await apiService.get<WorkoutPlan>('/workout-plans/current');
      setWorkoutPlan(plan);
      await offlineCache.setCached(offlineCache.CACHE_KEYS.WORKOUT_PLAN, plan);
      setIsOffline(false);
    } catch (error: any) {
      if (error?.message === 'Offline' && cached) setIsOffline(true);
      else console.error('Error loading workout plan:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWorkoutPlan(); }, [loadWorkoutPlan]);
  useEffect(() => {
    const unsub = offlineCache.onReconnect(() => loadWorkoutPlan());
    return unsub;
  }, [loadWorkoutPlan]);

  const startWorkout = useCallback(() => {
    if (workoutPlan) {
      navigation.navigate('WorkoutSession', { workoutPlanId: workoutPlan.id });
    }
  }, [workoutPlan, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!workoutPlan) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <View style={styles.emptyIcon}>
          <Text style={{ fontSize: 32 }}>💪</Text>
        </View>
        <Text style={styles.emptyTitle}>No workout plan</Text>
        <Text style={styles.emptyDesc}>Ask your coach to assign a plan, or generate one with AI.</Text>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Generate AI Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Offline Banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>Showing cached plan. Will sync when online.</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>TODAY'S WORKOUT</Text>
          <Text style={styles.headerTitle}>{workoutPlan.name}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{workoutPlan.exercises?.length ?? 0}</Text>
              <Text style={styles.metaLabel}>Exercises</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{workoutPlan.duration}</Text>
              <Text style={styles.metaLabel}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* Exercises */}
        <View style={styles.exerciseSection}>
          <Text style={styles.sectionLabel}>EXERCISES</Text>
          {(workoutPlan.exercises ?? []).map((item, index) => (
            <ExerciseRow key={item.id} item={item} index={index} />
          ))}
        </View>
      </ScrollView>

      {/* Floating Start Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={startWorkout} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
WorkoutPlanScreen.displayName = 'WorkoutPlanScreen';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingBottom: 100 },
  loadingContainer: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  headerLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 4 },
  headerTitle: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metaItem: { alignItems: 'center', flex: 1 },
  metaValue: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  metaLabel: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  metaDivider: { width: 1, height: 32, backgroundColor: colors.borderLight },

  // Section Label
  sectionLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 12 },

  // Exercise section
  exerciseSection: { paddingHorizontal: 24 },

  // Exercise Card
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  exerciseMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  exerciseDetail: { fontSize: 13, color: colors.textTertiary },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textTertiary },

  // Muscle chips
  muscleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  muscleChip: {
    backgroundColor: colors.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  muscleChipText: { fontSize: 11, fontWeight: '500', color: colors.blue },

  // Demo button
  demoButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  demoButtonText: { fontSize: 12, fontWeight: '500', color: colors.accent },

  // Floating button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 36,
    backgroundColor: 'rgba(250, 250, 250, 0.92)',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: colors.white },

  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  // Offline
  offlineBanner: { backgroundColor: colors.surfaceTertiary, padding: 10, marginHorizontal: 24, marginBottom: 12, borderRadius: 8 },
  offlineBannerText: { color: colors.textTertiary, fontSize: 12, textAlign: 'center' },
});

export default WorkoutPlanScreen;
