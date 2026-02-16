import { createTheme } from '@shopify/restyle';

export const colors = {
  background: '#FAF9F7',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F0EE',
  primary: '#3B82F6',
  primarySoft: '#EEF2FF',
  gold: '#E8B923',
  goldSoft: '#FEFCE8',
  success: '#10B981',
  successSoft: '#F0FDF4',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
};

const theme = createTheme({
  colors,
  spacing: { s: 8, m: 16, l: 24, xl: 40 },
  borderRadii: { s: 12, m: 24, l: 32, xl: 40 },
  textVariants: {
    hero: {
      fontFamily: 'CabinetGrotesk-Bold',
      fontSize: 48,
      lineHeight: 54,
      letterSpacing: -1.2,
    },
    h1: {
      fontFamily: 'CabinetGrotesk-Bold',
      fontSize: 32,
      lineHeight: 40,
    },
    h2: {
      fontFamily: 'CabinetGrotesk-Bold',
      fontSize: 28,
      lineHeight: 36,
    },
    h3: {
      fontFamily: 'CabinetGrotesk-Medium',
      fontSize: 24,
      lineHeight: 32,
    },
    title: {
      fontFamily: 'CabinetGrotesk-Medium',
      fontSize: 20,
      lineHeight: 28,
    },
    body: {
      fontFamily: 'Satoshi-Medium',
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontFamily: 'Satoshi-Regular',
      fontSize: 14,
      lineHeight: 20,
    },
  },
});

export type Theme = typeof theme;
export { theme };
