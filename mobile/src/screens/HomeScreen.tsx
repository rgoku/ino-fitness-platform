import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DailyMacros, Streak, Trophy } from '../types';
import { apiService } from '../services/apiService';
import { workoutService } from '../services/workoutService';
import { dietService } from '../services/dietService';
import { aiCoachService } from '../services/aiCoachService';
import { progressService } from '../services/progressService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [macros, setMacros] = useState<DailyMacros | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivation, setMotivation] = useState<string>('');
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [todayMeals, setTodayMeals] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      if (!user?.id) return;

      const [macrosData, streakData, trophiesData] = await Promise.all([
        apiService.get<DailyMacros>('/macros/today'),
        apiService.get<Streak>(`/streaks/${user?.id}`),
        apiService.get<Trophy[]>(`/trophies/${user?.id}`),
        aiCoachService.getMotivation(user.id),
      ]);

      setMacros(macrosData);
      setStreak(streakData);
      setTrophies(trophiesData);

      // Load today's data
      const plans = await workoutService.getWorkoutPlans(user.id);
      if (plans.length > 0) {
        setTodayWorkout(plans[0]);
      }

      const diets = await dietService.getDietPlans(user.id);
      if (diets.length > 0) {
        setTodayMeals(diets[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {macros && (
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
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('FoodPhoto')}
        >
          <Text style={styles.actionButtonText}>📸 Scan Food</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WorkoutSession')}
        >
          <Text style={styles.actionButtonText}>💪 Start Workout</Text>
        </TouchableOpacity>
      </View>

      {trophies.length > 0 && (
        <View style={styles.trophiesCard}>
          <Text style={styles.cardTitle}>Recent Trophies</Text>
          {trophies.slice(0, 3).map((trophy) => (
            <View key={trophy.id} style={styles.trophyItem}>
              <Text style={styles.trophyIcon}>{trophy.icon}</Text>
              <View style={styles.trophyInfo}>
                <Text style={styles.trophyName}>{trophy.name}</Text>
                <Text style={styles.trophyDate}>
                  {new Date(trophy.achievedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => navigation.navigate('Workout')}
      >
        <Text style={styles.workoutCardTitle}>Workout of the Day</Text>
        <Text style={styles.workoutCardSubtitle}>Tap to view plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

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

export default HomeScreen;

