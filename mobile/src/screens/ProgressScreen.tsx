import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { ProgressEntry, Streak, Trophy } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

const ProgressScreen = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const [progressData, streakData, trophiesData] = await Promise.all([
        apiService.get<ProgressEntry[]>(`/progress/${user?.id}`),
        apiService.get<Streak>(`/streaks/${user?.id}`),
        apiService.get<Trophy[]>(`/trophies/${user?.id}`),
      ]);
      setProgress(progressData);
      setStreak(streakData);
      setTrophies(trophiesData);
    } catch (error) {
      console.error('Error loading progress data:', error);
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

  const weightData = progress
    .filter(p => p.weight)
    .map(p => p.weight!)
    .slice(-7);

  const weightLabels = progress
    .filter(p => p.weight)
    .map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    .slice(-7);

  const chartConfig = {
    backgroundColor: '#000000',
    backgroundGradientFrom: '#1C1C1E',
    backgroundGradientTo: '#1C1C1E',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {streak && (
        <View style={styles.streakCard}>
          <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak 🔥</Text>
          <Text style={styles.streakLongest}>Longest: {streak.longestStreak} days</Text>
        </View>
      )}

      {weightData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weight Progress (kg)</Text>
          <LineChart
            data={{
              labels: weightLabels,
              datasets: [
                {
                  data: weightData,
                },
              ],
            }}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.trophiesCard}>
        <Text style={styles.sectionTitle}>Trophies ({trophies.length})</Text>
        <View style={styles.trophiesGrid}>
          {trophies.map((trophy) => (
            <View key={trophy.id} style={styles.trophyCard}>
              <Text style={styles.trophyIcon}>{trophy.icon}</Text>
              <Text style={styles.trophyName}>{trophy.name}</Text>
              <Text style={styles.trophyDate}>
                {new Date(trophy.achievedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
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
  streakCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 10,
  },
  streakLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  streakLongest: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chartCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  trophiesCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  trophiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  trophyCard: {
    width: (screenWidth - 70) / 2,
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  trophyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  trophyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  trophyDate: {
    fontSize: 10,
    color: '#8E8E93',
  },
});

export default ProgressScreen;

