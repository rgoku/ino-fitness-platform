import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, spacing, shadows } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'accent';
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = { sm: spacing.sm, md: spacing.md, lg: spacing.lg };

export default function Card({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'md',
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    if (onPress) scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const variantStyle = variantStyles[variant];

  const content = (
    <View style={[styles.base, variantStyle, { padding: paddingMap[padding] }, style]}>
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      {content}
    </AnimatedPressable>
  );
}

const variantStyles: Record<string, ViewStyle> = {
  default: {
    backgroundColor: colors.bgCard,
  },
  elevated: {
    backgroundColor: colors.bgElevated,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  accent: {
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
  },
});
