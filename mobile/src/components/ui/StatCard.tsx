import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../../theme';

interface Props {
  value: string | number;
  label: string;
  valueColor?: string;
  style?: ViewStyle;
}

export default function StatCard({ value, label, valueColor = colors.textPrimary, style }: Props) {
  return (
    <View style={[s.card, style]}>
      <Text style={[s.value, { color: valueColor }]}>{value}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: {
    ...typography.caption,
    marginTop: 4,
  },
});
