import React, { useState, useEffect, useCallback, useMemo } from '../lib/react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DailyMacros, Streak, Trophy } from '../types';
import { apiService } from '../services/apiService';
import { workoutService } from '../services/workoutService';
import { dietService } from '../services/dietService';
import { aiCoachService } from '../services/aiCoachService';

const MacrosCard = React.memo(({ macros }: { macros: DailyMacros }) => (
  <View style={styles.macrosCard}>
    <Text style={styles.cardTitle}>Today's Macros</Text>
    <View style={styles.macrosRow}>
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{Math.round(macros.consumed.calories)}</Text>
        <Text style={styles.macroLabel}>Calories</Text>
        <Text style={styles.macroTarget}>/ {Math.round(macros.calories)}</Text>
      </View>
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{Math.round(macros.consumed.protein)}g</Text>
        <Text style={styles.macroLabel}>Protein</Text>
        <Text style={styles.macroTarget}>/ {Math.round(macros.protein)}g</Text>
      </View>
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{Math.round(macros.consumed.carbs)}g</Text>
        <Text style={styles.macroLabel}>Carbs</Text>
        <Text style={styles.macroTarget}>/ {Math.round(macros.carbs)}g</Text>
      </View>
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{Math.round(macros.consumed.fat)}g</Text>
        <Text style={styles.macroLabel}>Fat</Text>
        <Text style={styles.macroTarget}>/ {Math.round(macros.fat)}g</Text>
      </View>
    </View>
  </View>
));

const TrophyItem = React.memo(({ trophy }: { trophy: Trophy }) => (
  <View style={styles.trophyItem}>
    <Text style={styles.trophyIcon}>{trophy.icon}</Text>
    <View style={styles.trophyInfo}>
      <Text style={styles.trophyName}>{trophy.name}</Text>
      <Text style={styles.trophyDate}>
        {new Date(trophy.achievedAt).toLocaleDateString()}
      </Text>
    </View>
  </View>
));

const TrophiesCard = React.memo(({ trophies }: { trophies: Trophy[] }) => {
  const slice = useMemo(() => trophies.slice(0, 3), [trophies]);
  if (slice.length === 0) return null;
  return (
    <View style={styles.trophiesCard}>
      <Text style={styles.cardTitle}>Recent Trophies</Text>
      {slice.map((trophy: Trophy) => (
        <React.Fragment key={trophy.id}>
          <TrophyItem trophy={trophy} />
        </React.Fragment>
      ))}
    </View>
  );
});

const QuickActions = React.memo(({ onFoodPhoto, onWorkout }: { onFoodPhoto: () => void; onWorkout: () => void }) => (
  <View style={styles.quickActions}>
    <TouchableOpacity style={styles.actionButton} onPress={onFoodPhoto}>
      <Text style={styles.actionButtonText}>📸 Scan Food</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onWorkout}>
      <Text style={styles.actionButtonText}>💪 Start Workout</Text>
    </TouchableOpacity>
  </View>
));

const WorkoutCard = React.memo(({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.workoutCard} onPress={onPress}>
    <Text style={styles.workoutCardTitle}>Workout of the Day</Text>
    <Text style={styles.workoutCardSubtitle}>Tap to view plan</Text>
  </TouchableOpacity>
));

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {user?.name}</Text>
        {streak && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak 🔥</Text>
          </View>
        )}
      </View>

      {macros && <MacrosCard macros={macros} />}

      <QuickActions onFoodPhoto={onFoodPhoto} onWorkout={onWorkout} />

      <TrophiesCard trophies={trophies} />

      <WorkoutCard onPress={onWorkoutCard} />
    </ScrollView>
  );
});

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  streakLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  macrosCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  macroLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 5,
  },
  macroTarget: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  trophiesCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  trophyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  trophyIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  trophyInfo: {
    flex: 1,
  },
  trophyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trophyDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  workoutCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  workoutCardSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});
