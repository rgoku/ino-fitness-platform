import React from '../lib/react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// ─── Design Tokens ──────────────────────────────────────────────────────────

const colors = {
  bg: '#0A0F1E',
  surface: '#0C1220',
  border: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  brand: '#2563EB',
  success: '#10B981',
};

// ─── Mock Data ──────────────────────────────────────────────────────────────

const activeChallenge = {
  id: '1',
  name: '30-Day Transformation Challenge',
  daysRemaining: 18,
  totalDays: 30,
  rank: 5,
  totalParticipants: 24,
  prizePool: '$500',
};

const upcomingChallenges = [
  {
    id: '2',
    name: 'Summer Shred Challenge',
    startDate: 'Jul 1, 2026',
    entryFee: '$25',
    participants: 42,
  },
  {
    id: '3',
    name: '10K Steps Daily',
    startDate: 'Jul 15, 2026',
    entryFee: 'Free',
    participants: 67,
  },
];

const pastChallenges = [
  {
    id: '4',
    name: 'New Year Power Challenge',
    finalRank: 1,
    totalParticipants: 32,
    dateRange: 'Jan 1 – Jan 31, 2026',
    badge: '\u{1F947} Winner',
  },
  {
    id: '5',
    name: 'Spring Cardio Blitz',
    finalRank: 3,
    totalParticipants: 28,
    dateRange: 'Mar 1 – Mar 21, 2026',
    badge: '\u{1F949} 3rd Place',
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChallengesScreen() {
  const progress = (activeChallenge.totalDays - activeChallenge.daysRemaining) / activeChallenge.totalDays;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.header}>Challenges</Text>

      {/* Active Challenge Card */}
      <View style={styles.featuredCard}>
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredBadgeText}>ACTIVE</Text>
        </View>
        <Text style={styles.featuredName}>{activeChallenge.name}</Text>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>{activeChallenge.daysRemaining} days left</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>#{activeChallenge.rank} of {activeChallenge.totalParticipants}</Text>
            <Text style={styles.statLabel}>Your Rank</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeChallenge.prizePool}</Text>
            <Text style={styles.statLabel}>Prize pool</Text>
          </View>
        </View>

        {/* Leaderboard Button */}
        <TouchableOpacity style={styles.leaderboardBtn}>
          <Text style={styles.leaderboardBtnText}>View Leaderboard</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Challenges */}
      <Text style={styles.sectionTitle}>Upcoming</Text>
      {upcomingChallenges.map((challenge) => (
        <View key={challenge.id} style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{challenge.name}</Text>
            <Text style={styles.cardDetail}>Starts {challenge.startDate}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardDetail}>Entry: {challenge.entryFee}</Text>
              <Text style={styles.cardDetail}>{challenge.participants} participants</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Past Challenges */}
      <Text style={styles.sectionTitle}>Past Challenges</Text>
      {pastChallenges.map((challenge) => (
        <View key={challenge.id} style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{challenge.name}</Text>
            <Text style={styles.cardDetail}>
              Rank #{challenge.finalRank} of {challenge.totalParticipants}
            </Text>
            <Text style={styles.cardDetail}>{challenge.dateRange}</Text>
          </View>
          {challenge.badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{challenge.badge}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
  },

  // Featured Active Challenge
  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand,
    padding: 20,
    marginBottom: 24,
  },
  featuredBadge: {
    backgroundColor: colors.brand,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  leaderboardBtn: {
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  leaderboardBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  // Join Button
  joinBtn: {
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinBtnText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },

  // Badge
  badgeContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
