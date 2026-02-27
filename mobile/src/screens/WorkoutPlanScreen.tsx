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

const ExerciseRow = React.memo(({ item, index }: { item: Exercise; index: number }) => (
  <View style={styles.exerciseCard}>
    <Text style={styles.exerciseNumber}>{index + 1}</Text>
    <View style={styles.exerciseInfo}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseDetails}>
        {item.sets} sets × {item.reps} reps
        {null != item.weight && item.weight > 0 ? ` @ ${item.weight}kg` : ''}
      </Text>
      <Text style={styles.exerciseMuscles}>
        {item.muscleGroups?.join(', ') ?? ''}
      </Text>
      {item.videoUrl ? (
        <TouchableOpacity style={styles.videoButton}>
          <Text style={styles.videoButtonText}>📹 Watch Demo</Text>
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
    if (fromCacheOnly) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const plan = await apiService.get<WorkoutPlan>('/workout-plans/current');
      setWorkoutPlan(plan);
      await offlineCache.setCached(offlineCache.CACHE_KEYS.WORKOUT_PLAN, plan);
      setIsOffline(false);
    } catch (error: any) {
      if (error?.message === 'Offline' && cached) {
        setIsOffline(true);
      } else {
        console.error('Error loading workout plan:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkoutPlan();
  }, [loadWorkoutPlan]);

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!workoutPlan) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPlanText}>No workout plan available</Text>
        <TouchableOpacity style={styles.generateButton}>
          <Text style={styles.generateButtonText}>Generate AI Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>Showing cached plan. Will sync when back online.</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>{workoutPlan.name}</Text>
        <Text style={styles.duration}>{workoutPlan.duration} min</Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Exercises</Text>
      {(workoutPlan.exercises ?? []).map((item, index) => (
        <ExerciseRow key={item.id} item={item} index={index} />
      ))}
    </ScrollView>
  );
});
WorkoutPlanScreen.displayName = 'WorkoutPlanScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  duration: {
    fontSize: 16,
    color: '#8E8E93',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  exerciseNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 15,
    width: 30,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 5,
  },
  exerciseMuscles: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 10,
  },
  videoButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  videoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noPlanText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#3A3A3C',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default WorkoutPlanScreen;

