import { createTheme } from '@shopify/restyle';

/**
 * INO Design System — Mobile Theme
 *
 * Premium, minimal design inspired by Apple Fitness+ and Linear.
 * Clean typography, 8px spacing grid, electric green accent.
 */

export const colors = {
  // Backgrounds
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F8F8',
  surfaceTertiary: '#F1F1F1',
  surfaceHover: '#ECECEC',

  // Dark variants
  backgroundDark: '#09090B',
  surfaceDark: '#18181B',
  surfaceSecondaryDark: '#1E1E22',
  surfaceTertiaryDark: '#27272A',

  // Accent — Electric Green
  primary: '#10B981',
  primaryLight: '#ECFDF5',
  primarySoft: 'rgba(16, 185, 129, 0.08)',
  primaryDark: '#059669',

  // Text
  textPrimary: '#09090B',
  textSecondary: '#52525B',
  textTertiary: '#A0A0AB',
  white: '#FFFFFF',

  // Semantic
  success: '#22C55E',
  successLight: '#F0FDF4',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  blue: '#3B82F6',
  blueLight: '#EFF6FF',
  orange: '#F97316',
  orangeLight: '#FFF7ED',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',

  // Border
  border: '#E4E4E7',
  borderLight: '#F0F0F2',

  // Legacy compat
  gold: '#F59E0B',
  goldSoft: '#FFFBEB',

  transparent: 'transparent',
};

const theme = createTheme({
  colors,
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
  },
  borderRadii: {
    xs: 6,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },
  textVariants: {
    defaults: {
      fontFamily: 'Inter',
      color: 'textPrimary',
    },
    // Headings
    h1: {
      fontFamily: 'Inter',
      fontWeight: '700',
      fontSize: 30,
      lineHeight: 36,
      letterSpacing: -0.5,
      color: 'textPrimary',
    },
    h2: {
      fontFamily: 'Inter',
      fontWeight: '600',
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: -0.3,
      color: 'textPrimary',
    },
    h3: {
      fontFamily: 'Inter',
      fontWeight: '600',
      fontSize: 20,
      lineHeight: 28,
      color: 'textPrimary',
    },
    // Subheadings
    subLg: {
      fontFamily: 'Inter',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 24,
      color: 'textPrimary',
    },
    subMd: {
      fontFamily: 'Inter',
      fontWeight: '500',
      fontSize: 14,
      lineHeight: 20,
      color: 'textPrimary',
    },
    subSm: {
      fontFamily: 'Inter',
      fontWeight: '500',
      fontSize: 13,
      lineHeight: 18,
      color: 'textPrimary',
    },
    // Body
    body: {
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
      color: 'textPrimary',
    },
    bodyMd: {
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: 14,
      lineHeight: 20,
      color: 'textSecondary',
    },
    bodySm: {
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: 13,
      lineHeight: 18,
      color: 'textSecondary',
    },
    caption: {
      fontFamily: 'Inter',
      fontWeight: '400',
      fontSize: 12,
      lineHeight: 16,
      color: 'textTertiary',
    },
    // Labels
    label: {
      fontFamily: 'Inter',
      fontWeight: '500',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
      color: 'textTertiary',
    },
    // Numbers
    metric: {
      fontFamily: 'Inter',
      fontWeight: '700',
      fontSize: 32,
      lineHeight: 38,
      color: 'textPrimary',
    },
    metricSm: {
      fontFamily: 'Inter',
      fontWeight: '600',
      fontSize: 20,
      lineHeight: 28,
      color: 'textPrimary',
    },
  },
});

export type Theme = typeof theme;
export { theme };
