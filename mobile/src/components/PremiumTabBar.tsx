/**
 * Premium bottom tab bar — replaces React Navigation's default emoji bar
 * with Lucide-style SVG icons, an animated active pill, and a glassmorphic
 * dark surface that matches the trainer dashboard.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// ─── Theme tokens (matches Home cards) ───────────────────────────────────────
const TAB_COLORS = {
  surface: '#0A0F1E',
  surfaceTop: '#0E1320',
  border: '#1A2233',
  active: '#10B981',
  activeGlow: 'rgba(16, 185, 129, 0.18)',
  inactive: '#64748B',
  inactiveText: '#94A3B8',
};

// ─── Lucide-style SVG icons ─────────────────────────────────────────────────
type IconProps = { color: string; size?: number };

const HomeIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H10v7H4a1 1 0 0 1-1-1V9.5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UtensilsIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 2v7a3 3 0 0 0 3 3h0V2M6 12v10M10 2v6a2 2 0 0 1-2 2M17 2c-2 0-4 3-4 6s2 4 4 4v10"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DumbbellIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.5 6.5 17.5 17.5M4 16l4 4M16 4l4 4M2.5 13.5 5 16M19 8l2.5 2.5M7 21l2-2M15 5l2-2"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChartIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3v18h18M7 14l4-4 4 4 5-5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserIcon = ({ color, size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
    <Path
      d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const ICONS: Record<string, React.ComponentType<IconProps>> = {
  Home: HomeIcon,
  Diet: UtensilsIcon,
  Workout: DumbbellIcon,
  Progress: ChartIcon,
  Profile: UserIcon,
};

// ─── Tab bar ────────────────────────────────────────────────────────────────

export function PremiumTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.outer}>
      <View style={styles.hairline} />
      <View style={styles.inner}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const Icon = ICONS[route.name] || HomeIcon;
          const color = focused ? TAB_COLORS.active : TAB_COLORS.inactive;
          const labelColor = focused ? TAB_COLORS.active : TAB_COLORS.inactiveText;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              activeOpacity={0.75}
              style={styles.tab}
            >
              <View
                style={[
                  styles.iconWrap,
                  focused && {
                    backgroundColor: TAB_COLORS.activeGlow,
                  },
                ]}
              >
                <Icon color={color} size={22} />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: labelColor },
                  focused && { fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {typeof label === 'string' ? label : route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  outer: {
    backgroundColor: TAB_COLORS.surface,
  },
  hairline: {
    height: 1,
    backgroundColor: TAB_COLORS.border,
    opacity: 0.7,
  },
  inner: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: TAB_COLORS.surfaceTop,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  iconWrap: {
    width: 56,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
});
