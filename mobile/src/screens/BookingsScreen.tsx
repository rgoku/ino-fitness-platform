import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoIcon, DumbbellIcon } from '../components/icons';

// ─── Design Tokens ──────────────────────────────────────────────────────────

const colors = {
  bg: '#0A0F1E',
  surface: '#0C1220',
  border: '#1E293B',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  brand: '#2563EB',
  green: '#10B981',
  amber: '#F59E0B',
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface Booking {
  id: string;
  sessionType: string;
  coachName: string;
  date: string;
  time: string;
  duration: string;
  mode: 'video' | 'in-person';
  status: 'confirmed' | 'pending';
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockBookings: Booking[] = [
  {
    id: '1',
    sessionType: 'Check-in',
    coachName: 'Coach Sarah',
    date: 'Tomorrow',
    time: '10:00 AM',
    duration: '30 min',
    mode: 'video',
    status: 'confirmed',
  },
  {
    id: '2',
    sessionType: 'Form Review',
    coachName: 'Coach Sarah',
    date: 'Wed, Jun 11',
    time: '2:00 PM',
    duration: '45 min',
    mode: 'video',
    status: 'confirmed',
  },
  {
    id: '3',
    sessionType: 'Program Update',
    coachName: 'Coach Mike',
    date: 'Fri, Jun 13',
    time: '9:00 AM',
    duration: '30 min',
    mode: 'in-person',
    status: 'pending',
  },
  {
    id: '4',
    sessionType: 'Nutrition Consult',
    coachName: 'Coach Sarah',
    date: 'Mon, Jun 16',
    time: '11:00 AM',
    duration: '60 min',
    mode: 'video',
    status: 'confirmed',
  },
];

// ─── Components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'confirmed' | 'pending' }) {
  const isConfirmed = status === 'confirmed';
  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: isConfirmed ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)' },
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          { color: isConfirmed ? colors.green : colors.amber },
        ]}
      >
        {isConfirmed ? 'Confirmed' : 'Pending'}
      </Text>
    </View>
  );
}

function ModeBadge({ mode }: { mode: 'video' | 'in-person' }) {
  const isVideo = mode === 'video';
  return (
    <View style={styles.modeBadge}>
      {isVideo ? (
        <VideoIcon color="#94A3B8" size={13} strokeWidth={2} />
      ) : (
        <DumbbellIcon color="#94A3B8" size={13} strokeWidth={2} />
      )}
      <Text style={styles.modeBadgeText}>{isVideo ? 'Video Call' : 'In-Person'}</Text>
    </View>
  );
}

function NextSessionCard({ booking }: { booking: Booking }) {
  return (
    <View style={styles.nextSessionCard}>
      <Text style={styles.nextSessionLabel}>NEXT SESSION</Text>
      <Text style={styles.nextSessionTitle}>
        Next: {booking.sessionType} with {booking.coachName}
      </Text>
      <View style={styles.nextSessionDetails}>
        <Text style={styles.nextSessionDetailText}>
          {booking.date}, {booking.time}
        </Text>
        <Text style={styles.nextSessionDetailText}>
          {booking.duration}
        </Text>
      </View>
      <ModeBadge mode={booking.mode} />
      <Text style={styles.startsInText}>Starts in 14h</Text>
      <TouchableOpacity style={styles.joinButton} activeOpacity={0.8}>
        <Text style={styles.joinButtonText}>Join Call</Text>
      </TouchableOpacity>
    </View>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingCardHeader}>
        <Text style={styles.bookingSessionType}>{booking.sessionType}</Text>
        <StatusBadge status={booking.status} />
      </View>
      <Text style={styles.bookingCoachName}>{booking.coachName}</Text>
      <View style={styles.bookingMeta}>
        <Text style={styles.bookingMetaText}>
          {booking.date} · {booking.time}
        </Text>
        <Text style={styles.bookingMetaText}>{booking.duration}</Text>
      </View>
      <ModeBadge mode={booking.mode} />
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function BookingsScreen() {
  const [bookings] = useState<Booking[]>(mockBookings);

  const nextSession = bookings[0];
  const upcomingSessions = bookings.slice(1);

  if (bookings.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bookings</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No upcoming sessions. Tap to request one!
          </Text>
          <TouchableOpacity style={styles.requestButton} activeOpacity={0.8}>
            <Text style={styles.requestButtonText}>Request Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <NextSessionCard booking={nextSession} />

        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {upcomingSessions.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.requestButton} activeOpacity={0.8}>
          <Text style={styles.requestButtonText}>Request Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Next Session Card
  nextSessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand,
    padding: 20,
    marginBottom: 24,
  },
  nextSessionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.brand,
    letterSpacing: 1,
    marginBottom: 8,
  },
  nextSessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  nextSessionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  nextSessionDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  startsInText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  // Booking Card
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingSessionType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bookingCoachName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  bookingMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  bookingMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Badges
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modeBadge: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modeBadgeText: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  // Bottom
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
    backgroundColor: colors.bg,
  },
  requestButton: {
    borderWidth: 1.5,
    borderColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brand,
  },
});
