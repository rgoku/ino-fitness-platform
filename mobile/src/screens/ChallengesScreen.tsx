import React, { useState, useEffect, useCallback } from 'react';
import { socialService, ChallengeDTO } from '../services/socialService';
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

const EMPTY_ACTIVE = {
  id: '',
  name: 'No active challenge',
  daysRemaining: 0,
  totalDays: 1,
  rank: 0,
  totalParticipants: 0,
  prizePool: '\u2014',
};

type ActiveChallenge = typeof EMPTY_ACTIVE;
interface UpcomingChallenge { id: string; name: string; startDate: string; entryFee: string; participants: number; }
interface PastChallenge { id: string; name: string; finalRank: number; totalParticipants: number; dateRange: string; badge: string; }

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ChallengesScreen() {
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge>(EMPTY_ACTIVE);
  const [upcomingChallenges, setUpcoming] = useState<UpcomingChallenge[]>([]);
  const [pastChallenges, setPast] = useState<PastChallenge[]>([]);

  const load = useCallback(async () => {
    try {
      const all = await socialService.getChallenges();
      const active = all.find((c) => c.status === 'active' && c.joined) || all.find((c) => c.status === 'active');
      if (active) {
        let totalDays = active.days_left ?? 1;
        if (active.starts_at && active.ends_at) {
          const ms = new Date(active.ends_at).getTime() - new Date(active.starts_at).getTime();
          totalDays = Math.max(1, Math.round(ms / 86400000));
        }
        setActiveChallenge({
          id: active.id,
          name: active.name,
          daysRemaining: active.days_left ?? 0,
          totalDays,
          rank: active.my_rank ?? 0,
          totalParticipants: active.participant_count,
          prizePool: active.prize_pool || '\u2014',
        });
      } else {
        setActiveChallenge(EMPTY_ACTIVE);
      }
      setUpcoming(
        all.filter((c) => c.status === 'upcoming').map((c) => ({
          id: c.id,
          name: c.name,
          startDate: fmtDate(c.starts_at),
          entryFee: c.entry_fee || 'Free',
          participants: c.participant_count,
        })),
      );
      setPast(
        all.filter((c) => c.status === 'past').map((c) => ({
          id: c.id,
          name: c.name,
          finalRank: c.my_rank ?? 0,
          totalParticipants: c.participant_count,
          dateRange: `${fmtDate(c.starts_at)} \u2013 ${fmtDate(c.ends_at)}`,
          badge: c.my_rank === 1 ? '\u{1F947} Winner' : c.my_rank ? `#${c.my_rank}` : '',
        })),
      );
    } catch (e) {
      setActiveChallenge(EMPTY_ACTIVE);
      setUpcoming([]);
      setPast([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
