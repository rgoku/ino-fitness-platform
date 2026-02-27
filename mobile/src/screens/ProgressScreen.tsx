import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ProgressEntry, Streak, Trophy } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import * as offlineCache from '../services/offlineCache';
import type { ProgressStatsCache } from '../services/offlineCache';

const screenWidth = Dimensions.get('window').width;

const CHART_CONFIG = {
  backgroundColor: '#000000',
  backgroundGradientFrom: '#1C1C1E',
  backgroundGradientTo: '#1C1C1E',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: { borderRadius: 16 },
};

const ProgressScreen = React.memo(() => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const loadProgressData = useCallback(async (fromCacheOnly = false) => {
    if (!user?.id) return;
    const cached = await offlineCache.getCached<ProgressStatsCache>(offlineCache.CACHE_KEYS.PROGRESS_STATS);
    if (cached) {
      setProgress(cached.progress);
      setStreak(cached.streak);
      setTrophies(cached.trophies);
      setIsOffline(false);
    }
    if (fromCacheOnly) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [progressData, streakData, trophiesData] = await Promise.all([
        apiService.get<ProgressEntry[]>(`/progress/${user.id}`),
        apiService.get<Streak>(`/streaks/${user.id}`),
        apiService.get<Trophy[]>(`/trophies/${user.id}`),
      ]);
      setProgress(progressData);
      setStreak(streakData);
      setTrophies(trophiesData);
      await offlineCache.setCached(offlineCache.CACHE_KEYS.PROGRESS_STATS, {
        progress: progressData,
        streak: streakData,
        trophies: trophiesData,
      });
      setIsOffline(false);
    } catch (error: any) {
      if (error?.message === 'Offline' && cached) {
        setIsOffline(true);
      } else {
        console.error('Error loading progress data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  useEffect(() => {
    const unsub = offlineCache.onReconnect(() => loadProgressData());
    return unsub;
  }, [loadProgressData]);

  const chartData = useMemo(() => {
    const withWeight = progress.filter((p) => null != p.weight);
    return {
      labels: withWeight
        .slice(-7)
        .map((p) => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{ data: withWeight.slice(-7).map((p) => p.weight as number) }],
    };
  }, [progress]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const weightData = chartData.datasets[0].data;
  const weightLabels = chartData.labels;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>Showing cached stats. Will sync when back online.</Text>
        </View>
      )}
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
            data={chartData}
            width={screenWidth - 60}
            height={220}
            chartConfig={CHART_CONFIG}
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
});

ProgressScreen.displayName = 'ProgressScreen';

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

export default ProgressScreen;

