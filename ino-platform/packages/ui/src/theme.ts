export const T = {
  // Brand
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  primaryBg: 'rgba(99, 102, 241, 0.08)',

  // Semantic
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.08)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.08)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.08)',

  // Accent
  pink: '#ec4899',
  pinkBg: 'rgba(236, 72, 153, 0.08)',
  orange: '#f97316',
  cyan: '#06b6d4',
  cyanBg: 'rgba(6, 182, 212, 0.08)',
  purple: '#8b5cf6',

  // Surfaces — Light
  bg: '#fafbfe',
  bgAlt: '#f1f4f9',
  bgCard: '#ffffff',

  // Surfaces — Dark
  bgDark: '#0c1222',
  bgDarkAlt: '#161d30',
  bgDarkCard: '#1e2940',

  // Text
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textDim: '#94a3b8',

  // Borders
  border: '#e2e8f0',
  borderDark: 'rgba(255,255,255,0.08)',

  // Gradients
  gradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
  gradientAlt: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
  gradientWarm: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
  gradientDark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',

  // Shadows
  shadow: '0 1px 3px rgba(0,0,0,0.06)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 12px 32px rgba(0,0,0,0.1)',
  shadowXl: '0 32px 64px rgba(0,0,0,0.15)',

  // Radii
  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999 },

  // Spacing scale (4px base)
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 },

  // Font
  font: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

export type Theme = typeof T;
