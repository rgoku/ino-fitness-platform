import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '../../theme';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 16, borderRadius = radius.sm, style }: Props) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.bgElevated,
        },
        animStyle,
        style,
      ]}
    />
  );
}

export default function LoadingSkeleton() {
  return (
    <View style={s.container}>
      <SkeletonBox width="60%" height={28} style={{ marginBottom: spacing.sm }} />
      <SkeletonBox width="40%" height={16} style={{ marginBottom: spacing.lg }} />
      <SkeletonBox height={120} borderRadius={radius.lg} style={{ marginBottom: spacing.md }} />
      <View style={s.row}>
        <SkeletonBox width="48%" height={80} borderRadius={radius.lg} />
        <SkeletonBox width="48%" height={80} borderRadius={radius.lg} />
      </View>
      <SkeletonBox height={72} borderRadius={radius.lg} style={{ marginTop: spacing.md }} />
      <SkeletonBox height={72} borderRadius={radius.lg} style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
