import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProgressScreen() {
  const [stats] = useState([
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 75 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 70 },
    { day: 'Sun', value: 95 },
  ]);

  const maxValue = Math.max(...stats.map(s => s.value));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Your Progress 📊</Text>
          <Text style={styles.subtext}>Keep up the great work!</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Activity (minutes)</Text>
          <View style={styles.chart}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.chartBarContainer}>
                  <View style={[styles.chartBarFill, { height: `${(stat.value / maxValue) * 100}%` }]} />
                </View>
                <Text style={styles.chartLabel}>{stat.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Recent Achievements 🏆</Text>
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>7 Day Streak</Text>
              <Text style={styles.achievementDesc}>Completed workouts 7 days in a row</Text>
            </View>
          </View>
          <View style={styles.achievement}>
            <Text style={styles.achievementIcon}>💪</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Strong Start</Text>
              <Text style={styles.achievementDesc}>Completed 50 workouts</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    width: 30,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    width: '100%',
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  achievementsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
});
