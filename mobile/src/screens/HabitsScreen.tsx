import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  DropletIcon,
  FootprintsIcon,
  MoonIcon,
  BeefIcon,
  PillIcon,
  LeafIcon,
  FlameIcon,
  CheckIcon,
  type IconProps,
} from '../components/icons';

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
};

// ─── Types ──────────────────────────────────────────────────────────────────

type HabitIconKey = 'water' | 'steps' | 'sleep' | 'protein' | 'supplements' | 'stretch';

interface Habit {
  id: string;
  name: string;
  iconKey: HabitIconKey;
  iconColor: string;
  completed: boolean;
  streak: number;
}

const HABIT_ICONS: Record<HabitIconKey, React.ComponentType<IconProps>> = {
  water: DropletIcon,
  steps: FootprintsIcon,
  sleep: MoonIcon,
  protein: BeefIcon,
  supplements: PillIcon,
  stretch: LeafIcon,
};

interface DayStatus {
  day: string;
  status: 'full' | 'partial' | 'missed';
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const initialHabits: Habit[] = [
  { id: '1', name: 'Drink 3L water', iconKey: 'water', iconColor: '#3B82F6', completed: true, streak: 12 },
  { id: '2', name: '10,000 steps', iconKey: 'steps', iconColor: '#10B981', completed: true, streak: 5 },
  { id: '3', name: '8h sleep', iconKey: 'sleep', iconColor: '#8B5CF6', completed: false, streak: 3 },
  { id: '4', name: 'Hit protein goal', iconKey: 'protein', iconColor: '#EF4444', completed: true, streak: 8 },
  { id: '5', name: 'Take supplements', iconKey: 'supplements', iconColor: '#F97316', completed: true, streak: 21 },
  { id: '6', name: 'Stretch 10min', iconKey: 'stretch', iconColor: '#22C55E', completed: false, streak: 0 },
];

const weeklyOverview: DayStatus[] = [
  { day: 'Mon', status: 'full' },
  { day: 'Tue', status: 'full' },
  { day: 'Wed', status: 'partial' },
  { day: 'Thu', status: 'full' },
  { day: 'Fri', status: 'partial' },
  { day: 'Sat', status: 'missed' },
  { day: 'Sun', status: 'partial' },
];

// ─── Helper ─────────────────────────────────────────────────────────────────

function getMotivationalText(completed: number, total: number): string {
  const pct = completed / total;
  if (pct === 1) return 'Perfect day. You crushed every habit.';
  if (pct >= 0.75) return 'Almost there. Just a few more to go.';
  if (pct >= 0.5) return 'Solid progress. Keep pushing.';
  if (pct > 0) return 'Good start. Every habit counts.';
  return "New day, new opportunity. Let's go.";
}

function getTodayFormatted(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('en-US', options);
}

// ─── Components ─────────────────────────────────────────────────────────────

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          {completed}/{total} habits completed today
        </Text>
        <Text style={styles.progressPct}>{Math.round(pct)}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function WeeklyOverviewRow({ days }: { days: DayStatus[] }) {
  return (
    <View style={styles.weeklyContainer}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.weeklyRow}>
        {days.map((d) => (
          <View key={d.day} style={styles.weeklyDayContainer}>
            <View
              style={[
                styles.weeklyCircle,
                d.status === 'full' && styles.weeklyCircleFull,
                d.status === 'partial' && styles.weeklyCirclePartial,
                d.status === 'missed' && styles.weeklyCircleMissed,
              ]}
            >
              {d.status === 'partial' && (
                <View style={styles.weeklyCircleHalf} />
              )}
            </View>
            <Text style={styles.weeklyDayLabel}>{d.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function HabitCard({
  habit,
  onToggle,
}: {
  habit: Habit;
  onToggle: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.habitCard}
      onPress={() => onToggle(habit.id)}
      activeOpacity={0.7}
    >
      <View style={styles.habitLeft}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            habit.completed && styles.checkboxChecked,
          ]}
          onPress={() => onToggle(habit.id)}
        >
          {habit.completed && <CheckIcon color="#FFFFFF" size={14} strokeWidth={3} />}
        </TouchableOpacity>
        <View style={[styles.habitIcon, { backgroundColor: `${habit.iconColor}1A` }]}>
          {React.createElement(HABIT_ICONS[habit.iconKey], {
            color: habit.iconColor,
            size: 18,
            strokeWidth: 2,
          })}
        </View>
        <View style={styles.habitInfo}>
          <Text
            style={[
              styles.habitName,
              habit.completed && styles.habitNameCompleted,
            ]}
          >
            {habit.name}
          </Text>
        </View>
      </View>
      <View style={styles.habitRight}>
        {habit.streak > 0 && (
          <View style={styles.streakBadge}>
            <FlameIcon color="#F97316" size={12} />
            <Text style={styles.streakText}>{habit.streak} day streak</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const completedCount = useMemo(
    () => habits.filter((h) => h.completed).length,
    [habits]
  );

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, completed: !h.completed } : h
      )
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Habits</Text>
          <Text style={styles.dateText}>{getTodayFormatted()}</Text>
        </View>

        {/* Progress Bar */}
        <ProgressBar completed={completedCount} total={habits.length} />

        {/* Weekly Overview */}
        <WeeklyOverviewRow days={weeklyOverview} />

        {/* Habits List */}
        <View style={styles.habitsSection}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
          ))}
        </View>

        {/* Motivational Text */}
        <View style={styles.motivationalContainer}>
          <Text style={styles.motivationalText}>
            {getMotivationalText(completedCount, habits.length)}
          </Text>
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
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Progress
  progressContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 4,
  },

  // Weekly Overview
  weeklyContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  weeklyDayContainer: {
    alignItems: 'center',
  },
  weeklyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  weeklyCircleFull: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  weeklyCirclePartial: {
    borderColor: colors.gold,
  },
  weeklyCircleHalf: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: colors.gold,
  },
  weeklyCircleMissed: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  weeklyDayLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },

  // Habits
  habitsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  habitCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  checkmark: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  habitIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  habitNameCompleted: {
    opacity: 0.6,
  },
  habitRight: {
    marginLeft: 8,
  },
  streakBadge: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '500',
  },

  // Motivational
  motivationalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  motivationalText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
