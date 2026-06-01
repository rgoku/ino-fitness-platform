/**
 * INÖ Fitness — Premium Design System
 *
 * Inspired by Apple Fitness+, WHOOP, Nike Training Club.
 * 8px grid · dark-first · gradient accents.
 */
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Colors ──────────────────────────────────────────────
export const colors = {
  // Backgrounds
  bg: '#0B0B0F',
  bgCard: '#121218',
  bgCardHover: '#1A1A22',
  bgElevated: '#1A1A22',
  bgInput: '#0F0F14',

  // Brand
  primary: '#6C5CE7',
  primaryLight: '#8B7CF6',
  primaryDark: '#5A4BD1',
  primaryMuted: 'rgba(108, 92, 231, 0.15)',

  // Accent
  accent: '#22C55E',
  accentDark: '#16A34A',
  accentMuted: 'rgba(34, 197, 94, 0.12)',

  // Semantic
  success: '#22C55E',
  successMuted: 'rgba(34, 197, 94, 0.12)',
  warning: '#FACC15',
  warningMuted: 'rgba(250, 204, 21, 0.12)',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.12)',
  info: '#54A0FF',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#6B7280',
  textInverse: '#0A0A0F',

  // Borders & Dividers
  border: '#1E1E28',
  borderLight: '#2A2A38',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Gradients (use with LinearGradient)
  gradientPrimary: ['#6C5CE7', '#8B5CF6'] as const,
  gradientAccent: ['#00F5A0', '#00D68F'] as const,
  gradientGold: ['#FFD700', '#FFA500'] as const,
  gradientDark: ['#141419', '#0A0A0F'] as const,

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.05)',
} as const;

// ─── Spacing (8px grid) ──────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ─── Border Radius ───────────────────────────────────────
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
} as const;

// ─── Typography ──────────────────────────────────────────
export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    color: colors.textPrimary,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    color: colors.textPrimary,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
    color: colors.textPrimary,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    color: colors.textPrimary,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
    color: colors.textSecondary,
  },
  callout: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    color: colors.textSecondary,
  },
  subhead: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    color: colors.textMuted,
  },
  footnote: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0,
    color: colors.textMuted,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  stat: {
    fontSize: 44,
    fontWeight: '700' as const,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
} as const;

// ─── Shadows ─────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  }),
} as const;

// ─── Layout ──────────────────────────────────────────────
export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  screenPadding: spacing.lg,
  cardPadding: spacing.md,
  maxContentWidth: 500,
} as const;

// ─── Animation Timing ────────────────────────────────────
export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: { damping: 15, stiffness: 150 },
} as const;

// ─── Re-export everything as default theme ───────────────
const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  layout,
  timing,
} as const;

export default theme;
