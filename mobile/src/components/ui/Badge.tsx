import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'gold' | 'primary';

interface Props {
  text: string;
  variant?: Variant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const variantColors: Record<Variant, { bg: string; text: string }> = {
  default: { bg: colors.bgElevated, text: colors.textSecondary },
  success: { bg: colors.accentMuted, text: colors.accent },
  warning: { bg: colors.warningMuted, text: colors.warning },
  error: { bg: colors.errorMuted, text: colors.error },
  gold: { bg: 'rgba(255, 215, 0, 0.15)', text: '#FFD700' },
  primary: { bg: colors.primaryMuted, text: colors.primary },
};

export default function Badge({ text, variant = 'default', size = 'sm', style }: Props) {
  const v = variantColors[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? 3 : 5,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: v.text, fontSize: isSmall ? 11 : 13 },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
