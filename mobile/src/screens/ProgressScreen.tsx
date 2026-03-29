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

const { width: screenWidth } = Dimensions.get('window');

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
  orange: '#F97316',
  orangeLight: '#FFF7ED',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  purple: '#8B5CF6',
  white: '#FFFFFF',
};

const CHART_CONFIG = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(82, 82, 91, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: colors.accent,
  },
  propsForBackgroundLines: {
    stroke: colors.borderLight,
    strokeDasharray: '',
  },
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
    if (fromCacheOnly) { setLoading(false); return; }
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
        progress: progressData, streak: streakData, trophies: trophiesData,
      });
      setIsOffline(false);
    } catch (error: any) {
      if (error?.message === 'Offline' && cached) setIsOffline(true);
      else console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadProgressData(); }, [loadProgressData]);
  useEffect(() => {
    const unsub = offlineCache.onReconnect(() => loadProgressData());
    return unsub;
  }, [loadProgressData]);

  const chartData = useMemo(() => {
    const withWeight = progress.filter((p) => null != p.weight);
    return {
      labels: withWeight.slice(-7).map((p) =>
        new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [{ data: withWeight.slice(-7).map((p) => p.weight as number) }],
    };
  }, [progress]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const weightData = chartData.datasets[0].data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>YOUR JOURNEY</Text>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>Showing cached data. Will sync when online.</Text>
        </View>
      )}

      {/* Streak Card */}
      {streak && (
        <View style={styles.streakCard}>
          <View style={styles.streakIconContainer}>
            <Text style={{ fontSize: 24 }}>🔥</Text>
          </View>
          <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakLongest}>Longest: {streak.longestStreak} days</Text>
        </View>
      )}

      {/* Weight Chart */}
      {weightData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WEIGHT TREND</Text>
          <View style={styles.card}>
            <LineChart
              data={chartData}
              width={screenWidth - 80}
              height={180}
              chartConfig={CHART_CONFIG}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
            <View style={styles.chartFooter}>
              <View>
                <Text style={styles.chartFooterLabel}>Current</Text>
                <Text style={styles.chartFooterValue}>{weightData[weightData.length - 1]} kg</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.chartFooterLabel}>Change</Text>
                <Text style={[styles.chartFooterValue, { color: colors.accent }]}>
                  {(weightData[weightData.length - 1] - weightData[0]).toFixed(1)} kg
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* This Week Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <View style={styles.statsRow}>
          <StatTile label="Workouts" value="4/5" color={colors.accent} />
          <StatTile label="Duration" value="180m" color={colors.blue} />
          <StatTile label="Calories" value="2,840" color={colors.orange} />
        </View>
      </View>

      {/* Trophies */}
      {trophies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TROPHIES ({trophies.length})</Text>
          <View style={styles.trophiesGrid}>
            {trophies.map((trophy) => (
              <View key={trophy.id} style={styles.trophyCard}>
                <Text style={{ fontSize: 28 }}>{trophy.icon}</Text>
                <Text style={styles.trophyName}>{trophy.name}</Text>
                <Text style={styles.trophyDate}>
                  {new Date(trophy.achievedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
});

ProgressScreen.displayName = 'ProgressScreen';

// ─── Stat Tile ──────────────────────────────────────────────────────────────

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },
  loadingContainer: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  headerLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 4 },
  headerTitle: { fontSize: 30, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },

  // Section
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, color: colors.textTertiary, marginBottom: 12 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  // Streak
  streakCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  streakNumber: { fontSize: 40, fontWeight: '700', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  streakLabel: { fontSize: 16, fontWeight: '500', color: colors.textPrimary, marginTop: 4 },
  streakLongest: { fontSize: 13, color: colors.textTertiary, marginTop: 4 },

  // Chart
  chart: { marginVertical: 8, borderRadius: 12 },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  chartFooterLabel: { fontSize: 12, color: colors.textTertiary },
  chartFooterValue: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, fontVariant: ['tabular-nums'], marginTop: 2 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12 },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '600', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12, color: colors.textTertiary, marginTop: 4 },

  // Trophies
  trophiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  trophyCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  trophyName: { fontSize: 13, fontWeight: '500', color: colors.textPrimary, textAlign: 'center', marginTop: 8 },
  trophyDate: { fontSize: 11, color: colors.textTertiary, marginTop: 4 },

  // Offline
  offlineBanner: {
    backgroundColor: colors.surfaceTertiary,
    padding: 10,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 8,
  },
  offlineBannerText: { color: colors.textTertiary, fontSize: 12, textAlign: 'center' },
});

export default ProgressScreen;
