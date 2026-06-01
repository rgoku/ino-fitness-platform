export interface HeatScale {
  max: number;
  color: string;
}

export const MIDNIGHT_BLUE_SCALE: HeatScale[] = [
  { max: 5, color: '#1E3A5F' },
  { max: 10, color: '#1D4ED8' },
  { max: 18, color: '#2563EB' },
  { max: Infinity, color: '#3B82F6' },
];

export const RED_SCALE: HeatScale[] = [
  { max: 5, color: '#5a2d33' },
  { max: 10, color: '#9c3530' },
  { max: 18, color: '#e23b2e' },
  { max: Infinity, color: '#ff5a3c' },
];

export const GREEN_SCALE: HeatScale[] = [
  { max: 5, color: '#064E3B' },
  { max: 10, color: '#047857' },
  { max: 18, color: '#059669' },
  { max: Infinity, color: '#10B981' },
];

export interface ThemeColors {
  restFill: string;
  separator: string;
  bodyFill: string;
  outline: string;
  selectedStroke: string;
  scale: HeatScale[];
}

export const MIDNIGHT_ATHLETE: ThemeColors = {
  restFill: '#1A2540',
  separator: '#131B2E',
  bodyFill: '#0F172A',
  outline: '#1E293B',
  selectedStroke: '#FFFFFF',
  scale: MIDNIGHT_BLUE_SCALE,
};

export const MOBILE_DARK: ThemeColors = {
  restFill: '#384150',
  separator: '#1b212b',
  bodyFill: '#2b313c',
  outline: '#39414e',
  selectedStroke: '#FFFFFF',
  scale: RED_SCALE,
};

export function getColor(sets: number, theme: ThemeColors): string {
  if (sets <= 0) return theme.restFill;
  return (theme.scale.find((s) => sets <= s.max) ?? theme.scale[theme.scale.length - 1]).color;
}
