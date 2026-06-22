import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CrownIcon } from '../components/icons';

// ─── Design Tokens ──────────────────────────────────────────────────────────

const colors = {
  bg: '#0A0F1E',
  surface: '#0C1220',
  border: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  brand: '#2563EB',
  success: '#10B981',
  gold: '#F59E0B',
  silver: '#94A3B8',
  bronze: '#D97706',
};

// ─── Types ──────────────────────────────────────────────────────────────────

type TabKey = 'compliance' | 'streaks' | 'volume';

type TrendDirection = 'up' | 'down' | 'same';

interface LeaderboardEntry {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  compliance: number;
  streak: number;
  volume: number;
  trend: TrendDirection;
  isCurrentUser: boolean;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const leaderboardData: LeaderboardEntry[] = [
  { id: '1', name: 'Alex Rivera', initials: 'AR', avatarColor: '#6366F1', compliance: 98, streak: 45, volume: 12500, trend: 'up', isCurrentUser: false },
  { id: '2', name: 'Sarah Chen', initials: 'SC', avatarColor: '#EC4899', compliance: 95, streak: 38, volume: 9800, trend: 'up', isCurrentUser: false },
  { id: '3', name: 'Marcus Johnson', initials: 'MJ', avatarColor: '#F97316', compliance: 92, streak: 32, volume: 11200, trend: 'same', isCurrentUser: false },
  { id: '4', name: 'You', initials: 'RG', avatarColor: '#2563EB', compliance: 89, streak: 28, volume: 10500, trend: 'up', isCurrentUser: true },
  { id: '5', name: 'Emily Torres', initials: 'ET', avatarColor: '#10B981', compliance: 87, streak: 25, volume: 8900, trend: 'down', isCurrentUser: false },
  { id: '6', name: 'Jake Wilson', initials: 'JW', avatarColor: '#8B5CF6', compliance: 84, streak: 21, volume: 9200, trend: 'up', isCurrentUser: false },
  { id: '7', name: 'Mia Patel', initials: 'MP', avatarColor: '#EF4444', compliance: 81, streak: 18, volume: 7600, trend: 'down', isCurrentUser: false },
  { id: '8', name: 'David Kim', initials: 'DK', avatarColor: '#14B8A6', compliance: 78, streak: 15, volume: 8100, trend: 'same', isCurrentUser: false },
  { id: '9', name: 'Olivia Brown', initials: 'OB', avatarColor: '#F59E0B', compliance: 75, streak: 12, volume: 6900, trend: 'down', isCurrentUser: false },
  { id: '10', name: 'Ryan Lee', initials: 'RL', avatarColor: '#06B6D4', compliance: 72, streak: 9, volume: 7200, trend: 'up', isCurrentUser: false },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getRankColor(rank: number): string {
  if (rank === 1) return colors.gold;
  if (rank === 2) return colors.silver;
  if (rank === 3) return colors.bronze;
  return colors.textTertiary;
}

function getTrendArrow(trend: TrendDirection): { symbol: string; color: string } {
  switch (trend) {
    case 'up':
      return { symbol: '↑', color: colors.success };
    case 'down':
      return { symbol: '↓', color: '#EF4444' };
    case 'same':
      return { symbol: '→', color: colors.textTertiary };
  }
}

function getScoreDisplay(entry: LeaderboardEntry, tab: TabKey): string {
  switch (tab) {
    case 'compliance':
      return `${entry.compliance}%`;
    case 'streaks':
      return `${entry.streak} days`;
    case 'volume':
      return `${(entry.volume / 1000).toFixed(1)}k kg`;
  }
}

function sortByTab(data: LeaderboardEntry[], tab: TabKey): LeaderboardEntry[] {
  return [...data].sort((a, b) => {
    switch (tab) {
      case 'compliance':
        return b.compliance - a.compliance;
      case 'streaks':
        return b.streak - a.streak;
      case 'volume':
        return b.volume - a.volume;
    }
  });
}

// ─── Components ─────────────────────────────────────────────────────────────

function TabSelector({
  activeTab,
  onTabChange,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'compliance', label: 'Compliance' },
    { key: 'streaks', label: 'Streaks' },
    { key: 'volume', label: 'Volume' },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PodiumSection({
  sorted,
  activeTab,
}: {
  sorted: LeaderboardEntry[];
  activeTab: TabKey;
}) {
  if (sorted.length < 3) return null;

  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <View style={styles.podiumContainer}>
      {/* 2nd place */}
      <View style={[styles.podiumCard, styles.podiumSecond]}>
        <View style={[styles.podiumAvatar, { backgroundColor: second.avatarColor }]}>
          <Text style={styles.podiumInitials}>{second.initials}</Text>
        </View>
        <Text style={styles.podiumRank}>2</Text>
        <Text style={styles.podiumName} numberOfLines={1}>{second.name}</Text>
        <Text style={[styles.podiumScore, { color: colors.silver }]}>
          {getScoreDisplay(second, activeTab)}
        </Text>
      </View>

      {/* 1st place */}
      <View style={[styles.podiumCard, styles.podiumFirst]}>
        <View style={styles.crownEmoji}>
          <CrownIcon color="#FBBF24" size={28} strokeWidth={2} />
        </View>
        <View style={[styles.podiumAvatarLarge, { backgroundColor: first.avatarColor }]}>
          <Text style={styles.podiumInitialsLarge}>{first.initials}</Text>
        </View>
        <Text style={[styles.podiumRank, { color: colors.gold }]}>1</Text>
        <Text style={styles.podiumName} numberOfLines={1}>{first.name}</Text>
        <Text style={[styles.podiumScore, { color: colors.gold }]}>
          {getScoreDisplay(first, activeTab)}
        </Text>
      </View>

      {/* 3rd place */}
      <View style={[styles.podiumCard, styles.podiumThird]}>
        <View style={[styles.podiumAvatar, { backgroundColor: third.avatarColor }]}>
          <Text style={styles.podiumInitials}>{third.initials}</Text>
        </View>
        <Text style={styles.podiumRank}>3</Text>
        <Text style={styles.podiumName} numberOfLines={1}>{third.name}</Text>
        <Text style={[styles.podiumScore, { color: colors.bronze }]}>
          {getScoreDisplay(third, activeTab)}
        </Text>
      </View>
    </View>
  );
}

function LeaderboardRow({
  entry,
  rank,
  activeTab,
}: {
  entry: LeaderboardEntry;
  rank: number;
  activeTab: TabKey;
}) {
  const trendInfo = getTrendArrow(entry.trend);
  const rankColor = getRankColor(rank);

  return (
    <View
      style={[
        styles.rowCard,
        entry.isCurrentUser && styles.rowCardCurrentUser,
      ]}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rankNumber, { color: rankColor }]}>
          {rank}
        </Text>
        <View style={[styles.rowAvatar, { backgroundColor: entry.avatarColor }]}>
          <Text style={styles.rowInitials}>{entry.initials}</Text>
        </View>
        <Text style={styles.rowName}>{entry.name}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowScore}>{getScoreDisplay(entry, activeTab)}</Text>
        <Text style={[styles.trendArrow, { color: trendInfo.color }]}>
          {trendInfo.symbol}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('compliance');

  const sorted = useMemo(() => sortByTab(leaderboardData, activeTab), [activeTab]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
        </View>

        {/* Tab Selector */}
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Podium */}
        <PodiumSection sorted={sorted} activeTab={activeTab} />

        {/* Full Rankings */}
        <View style={styles.rankingsSection}>
          {sorted.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              rank={index + 1}
              activeTab={activeTab}
            />
          ))}
        </View>

        {/* Footer note */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Updated daily</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.brand,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    gap: 8,
  },
  podiumCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    flex: 1,
  },
  podiumFirst: {
    paddingVertical: 20,
    borderColor: colors.gold,
  },
  podiumSecond: {
    paddingVertical: 16,
  },
  podiumThird: {
    paddingVertical: 16,
  },
  podiumAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  podiumAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  podiumInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  podiumInitialsLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  crownEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  podiumRank: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  podiumName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Rankings
  rankingsSection: {
    gap: 8,
  },
  rowCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCardCurrentUser: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
  rowAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 12,
  },
  rowInitials: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rowName: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  trendArrow: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Footer
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
