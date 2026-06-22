/**
 * Premium bottom tab bar — replaces React Navigation's default emoji bar
 * with Lucide-style SVG icons, an animated active pill, and a glassmorphic
 * dark surface that matches the trainer dashboard.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  HomeIcon,
  UtensilsIcon,
  DumbbellIcon,
  ChartIcon,
  UserIcon,
  type IconProps,
} from './icons';

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
