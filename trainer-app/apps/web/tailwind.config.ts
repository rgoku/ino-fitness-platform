import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)',
          hover: 'var(--color-surface-hover)',
          active: 'var(--color-surface-active)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
        },
        success: {
          50:  '#F0FDF4',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          50:  '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50:  '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'heading-1': ['30px', { lineHeight: '36px', fontWeight: '700', letterSpacing: '-0.025em' }],
        'heading-2': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.02em' }],
        'heading-3': ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.015em' }],
        'sub-lg':    ['16px', { lineHeight: '24px', fontWeight: '500', letterSpacing: '-0.01em' }],
        'sub-md':    ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '-0.006em' }],
        'sub-sm':    ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'body-lg':   ['16px', { lineHeight: '24px', fontWeight: '400', letterSpacing: '-0.01em' }],
        'body-md':   ['14px', { lineHeight: '20px', fontWeight: '400', letterSpacing: '-0.006em' }],
        'body-sm':   ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'body-xs':   ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      spacing: {
        '4.5': '18px',
        '18': '72px',
        '88': '352px',
      },
      boxShadow: {
        'xs':   '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'overlay': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-lg': '0 0 40px rgba(16, 185, 129, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-in': 'slideIn 0.15s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
