/**
 * INO Design System — Shared Theme Tokens
 *
 * Premium, minimal design system. Electric green accent.
 * Consistent across landing, coach web, and mobile.
 */
export const T = {
  // Brand — Electric Green
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  primaryBg: 'rgba(16, 185, 129, 0.08)',
  primaryBorder: 'rgba(16, 185, 129, 0.15)',

  // Secondary — Blue
  secondary: '#3B82F6',
  secondaryBg: 'rgba(59, 130, 246, 0.08)',

  // Semantic
  success: '#22C55E',
  successBg: 'rgba(34, 197, 94, 0.08)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.08)',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.08)',

  // Accent
  orange: '#F97316',
  purple: '#8B5CF6',
  blue: '#3B82F6',

  // Surfaces — Light
  bg: '#FAFAFA',
  bgAlt: '#F4F4F5',
  bgCard: '#FFFFFF',

  // Surfaces — Dark
  bgDark: '#09090B',
  bgDarkAlt: '#18181B',
  bgDarkCard: '#1E1E22',

  // Text
  text: '#09090B',
  textSecondary: '#52525B',
  textMuted: '#71717A',
  textDim: '#A0A0AB',

  // Borders
  border: '#E4E4E7',
  borderLight: '#F0F0F2',
  borderDark: 'rgba(255,255,255,0.08)',

  // Gradients
  gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  gradientAlt: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
  gradientWarm: 'linear-gradient(135deg, #F97316 0%, #10B981 100%)',
  gradientDark: 'linear-gradient(135deg, #18181B 0%, #09090B 100%)',
  gradientHero: 'linear-gradient(135deg, #10B981 0%, #3B82F6 50%, #8B5CF6 100%)',

  // Shadows
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.03)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.03)',
  shadowXl: '0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.03)',
  shadowGlow: '0 0 20px rgba(16, 185, 129, 0.15)',
  shadowGlowLg: '0 0 40px rgba(16, 185, 129, 0.2)',

  // Radii
  radius: { sm: 6, md: 8, lg: 12, xl: 16, xxl: 20, xxxl: 24, full: 9999 },

  // Spacing scale (8px grid)
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 },

  // Font
  font: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

export type Theme = typeof T;
