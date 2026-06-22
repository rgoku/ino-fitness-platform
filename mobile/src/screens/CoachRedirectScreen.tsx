/**
 * Shown when a coach signs into the mobile app.
 * The mobile client app is for clients only — coaches use the trainer
 * dashboard on the web. Per spec: "Coaches Have Access To" tools that
 * "Clients DO NOT Have Access To" — we keep those two worlds separate.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SparklesIcon, UserIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

const TRAINER_URL = 'https://trainer.ino.fit';

export default function CoachRedirectScreen() {
  const { user, logout } = useAuth();

  const openTrainerDashboard = () => {
    Linking.openURL(TRAINER_URL).catch(() => {
      // best-effort; if no browser, just sit on this screen.
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <SparklesIcon color="#10B981" size={48} strokeWidth={1.8} />
      </View>

      <Text style={styles.title}>Welcome, Coach</Text>
      <Text style={styles.subtitle}>
        Hi {user?.name?.split(' ')[0] ?? 'Coach'}. The INÖ mobile app is for
        clients. Your tools live on the trainer dashboard.
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={openTrainerDashboard}>
        <Text style={styles.primaryButtonText}>Open Trainer Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.featureList}>
        <FeatureRow text="AI Workout Generator" />
        <FeatureRow text="AI Diet Generator" />
        <FeatureRow text="Client Analytics" />
        <FeatureRow text="Program Builder" />
      </View>

      <TouchableOpacity onPress={logout} style={styles.logoutLink}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 18,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    width: '85%',
    marginVertical: 6,
  },
  featureList: {
    width: '100%',
    gap: 10,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  featureText: {
    color: '#CBD5E1',
    fontSize: 13.5,
    fontWeight: '500',
  },
  logoutLink: {
    marginTop: 8,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
});
