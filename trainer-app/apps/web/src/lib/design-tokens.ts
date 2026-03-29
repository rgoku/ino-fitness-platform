/**
 * INO Design System — Design Tokens
 *
 * A unified token system inspired by Stripe, Linear, and Apple Fitness+.
 * All spacing follows an 8px grid. Typography uses 3 clear levels.
 */

// ─── Color Palette ───────────────────────────────────────────────────────────

export const palette = {
  // Neutrals
  white: '#FFFFFF',
  black: '#09090B',

  gray: {
    25:  '#FAFAFA',
    50:  '#F8F8F8',
    100: '#F1F1F1',
    200: '#E4E4E7',
    300: '#D1D1D6',
    400: '#A0A0AB',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#0F0F12',
  },

  // Accent — Electric green (AI/performance feel)
  accent: {
    50:  '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',  // Primary accent
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Blue — Secondary accent / links
  blue: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Semantic
  success: {
    50:  '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  warning: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  error: {
    50:  '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
} as const;

// ─── Spacing (8px grid) ─────────────────────────────────────────────────────

export const spacing = {
  0:    '0px',
  0.5:  '2px',
  1:    '4px',
  1.5:  '6px',
  2:    '8px',
  2.5:  '10px',
  3:    '12px',
  4:    '16px',
  5:    '20px',
  6:    '24px',
  8:    '32px',
  10:   '40px',
  12:   '48px',
  16:   '64px',
  20:   '80px',
  24:   '96px',
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  },

  // 3 clear levels: Heading, Subheading, Body
  heading: {
    h1: { size: '30px', lineHeight: '36px', weight: '700', tracking: '-0.025em' },
    h2: { size: '24px', lineHeight: '32px', weight: '600', tracking: '-0.02em' },
    h3: { size: '20px', lineHeight: '28px', weight: '600', tracking: '-0.015em' },
  },
  subheading: {
    lg: { size: '16px', lineHeight: '24px', weight: '500', tracking: '-0.01em' },
    md: { size: '14px', lineHeight: '20px', weight: '500', tracking: '-0.006em' },
    sm: { size: '13px', lineHeight: '18px', weight: '500', tracking: '0' },
  },
  body: {
    lg: { size: '16px', lineHeight: '24px', weight: '400', tracking: '-0.01em' },
    md: { size: '14px', lineHeight: '20px', weight: '400', tracking: '-0.006em' },
    sm: { size: '13px', lineHeight: '18px', weight: '400', tracking: '0' },
    xs: { size: '12px', lineHeight: '16px', weight: '400', tracking: '0' },
  },
} as const;

// ─── Border Radius ──────────────────────────────────────────────────────────

export const radius = {
  sm:   '6px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const;

// ─── Shadows ────────────────────────────────────────────────────────────────

export const shadows = {
  xs:   '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm:   '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
  md:   '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
  lg:   '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
  xl:   '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
  glow: '0 0 20px rgba(16, 185, 129, 0.15)',
} as const;

// ─── Transitions ────────────────────────────────────────────────────────────

export const transitions = {
  fast:   '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow:   '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ─── Mobile Design Tokens (React Native compatible) ─────────────────────────

export const mobileColors = {
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F8F8',
    surfaceTertiary: '#F1F1F1',
    border: '#E4E4E7',
    borderLight: '#F1F1F1',
    textPrimary: '#09090B',
    textSecondary: '#71717A',
    textTertiary: '#A0A0AB',
    accent: '#10B981',
    accentSoft: '#ECFDF5',
  },
  dark: {
    background: '#09090B',
    surface: '#18181B',
    surfaceSecondary: '#1E1E22',
    surfaceTertiary: '#27272A',
    border: '#27272A',
    borderLight: '#1E1E22',
    textPrimary: '#FAFAFA',
    textSecondary: '#A0A0AB',
    textTertiary: '#52525B',
    accent: '#34D399',
    accentSoft: '#064E3B',
  },
} as const;

export const mobileSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

export const mobileFontSizes = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const;
