/**
 * Lucide-style SVG icon library for the mobile app.
 * All icons use a 24-unit viewBox and inherit color/size via props,
 * matching the trainer dashboard's icon design language.
 */
import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

export interface IconProps {
  color?: string;
  size?: number;
  fill?: string;
  strokeWidth?: number;
}

const base = (color: string = '#F1F5F9', size: number = 22, strokeWidth: number = 1.8) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// ─── NAVIGATION / CORE ──────────────────────────────────────────────────────

export const HomeIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H10v7H4a1 1 0 0 1-1-1V9.5Z" />
  </Svg>
);

export const UtensilsIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M3 2v7a3 3 0 0 0 3 3h0V2M6 12v10M10 2v6a2 2 0 0 1-2 2M17 2c-2 0-4 3-4 6s2 4 4 4v10" />
  </Svg>
);

/** Redesigned: proper barbell with two weight plates on each end. */
export const DumbbellIcon = ({ color = '#F1F5F9', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    {/* Center bar */}
    <Line x1="6.5" y1="12" x2="17.5" y2="12" />
    {/* Left plates */}
    <Rect x="2" y="8" width="2.5" height="8" rx="0.5" />
    <Rect x="5" y="6.5" width="2" height="11" rx="0.5" />
    {/* Right plates */}
    <Rect x="17" y="6.5" width="2" height="11" rx="0.5" />
    <Rect x="19.5" y="8" width="2.5" height="8" rx="0.5" />
  </Svg>
);

export const ChartIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M3 3v18h18M7 14l4-4 4 4 5-5" />
  </Svg>
);

export const UserIcon = ({ color = '#F1F5F9', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="8" r="4" />
    <Path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </Svg>
);

// ─── ACTIONS / TOOLS ────────────────────────────────────────────────────────

export const CameraIcon = ({ color = '#F1F5F9', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
    <Circle cx="12" cy="13" r="4" />
  </Svg>
);

export const VideoIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="m22 8-6 4 6 4V8Z" />
    <Rect x="2" y="6" width="14" height="12" rx="2" />
  </Svg>
);

export const SparklesIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="m12 3 1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3Z" />
    <Path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
    <Path d="M5 16l.6 1.7L7.4 18l-1.8.3L5 20l-.6-1.7L2.6 18l1.8-.3L5 16Z" />
  </Svg>
);

export const BotIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Rect x="3" y="7" width="18" height="13" rx="2" />
    <Circle cx="9" cy="13" r="1.2" fill={color || '#F1F5F9'} />
    <Circle cx="15" cy="13" r="1.2" fill={color || '#F1F5F9'} />
    <Path d="M12 3v4M8 17h8" />
  </Svg>
);

export const ShoppingCartIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="9" cy="20" r="1.5" />
    <Circle cx="18" cy="20" r="1.5" />
    <Path d="M2 3h2l2.5 12h12L21 7H7" />
  </Svg>
);

// ─── PROFILE / SETTINGS ─────────────────────────────────────────────────────

export const EditIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
  </Svg>
);

export const CreditCardIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Rect x="2" y="5" width="20" height="14" rx="2" />
    <Line x1="2" y1="10" x2="22" y2="10" />
  </Svg>
);

export const SettingsIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Svg>
);

export const HelpIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const FileTextIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
    <Polyline points="14 2 14 8 20 8" />
    <Line x1="9" y1="13" x2="15" y2="13" />
    <Line x1="9" y1="17" x2="15" y2="17" />
  </Svg>
);

// ─── HABITS / WELLNESS ──────────────────────────────────────────────────────

export const DropletIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M12 2.5s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z" />
  </Svg>
);

export const FootprintsIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M4 16a2 2 0 1 0 4 0c0-2-2-3-2-5a3 3 0 1 1 6 0c0 2-2 3-2 5a2 2 0 1 0 4 0" />
    <Path d="M16 16a2 2 0 1 0 4 0c0-2-2-3-2-5a3 3 0 1 1 6 0" transform="translate(-2 0)" />
  </Svg>
);

export const MoonIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </Svg>
);

export const BeefIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12.5" cy="8.5" r="2.5" />
    <Path d="M12.5 2a6.5 6.5 0 0 0-6.5 6.5c0 6 6.5 13.5 6.5 13.5s6.5-7.5 6.5-13.5A6.5 6.5 0 0 0 12.5 2Z" />
  </Svg>
);

export const PillIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <Line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
  </Svg>
);

export const LeafIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M11 20A7 7 0 0 1 4 13c0-3.87 3.13-7 7-7h8s-1 7-7 7c-3.87 0-7-3.13-7-7" />
    <Path d="M11 13c0-5 6-9 6-9" />
  </Svg>
);

// ─── REACTIONS / STATUS ─────────────────────────────────────────────────────

export const FlameIcon = ({ color = '#F97316', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c2.76 0 5-2 5-4.5 0-3-2-5.5-3-7-1 1.5-2 3-2 5 0 1-1 1.5-1.5 1.5C8 12 7 10.5 7 9c-1.5 1.5-3 3-3 5.5A6 6 0 0 0 10 21c1.5 0 3-.6 4-1.5" />
  </Svg>
);

export const TrophyIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Svg>
);

export const CrownIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7Z" />
    <Path d="M5 20h14" />
  </Svg>
);

export const StarIcon = ({ color, size, strokeWidth, fill }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill={fill || 'none'}
    />
  </Svg>
);

export const RocketIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09ZM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
    <Path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </Svg>
);

export const SunIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="12" r="4" />
    <Line x1="12" y1="2" x2="12" y2="4" />
    <Line x1="12" y1="20" x2="12" y2="22" />
    <Line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
    <Line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
    <Line x1="2" y1="12" x2="4" y2="12" />
    <Line x1="20" y1="12" x2="22" y2="12" />
    <Line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
    <Line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
  </Svg>
);

export const PartyIcon = ({ color = '#FBBF24', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M5.8 11.3 2 22l10.7-3.79" />
    <Path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01" />
    <Path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
    <Path d="m22 13-1.99.75c-.83.32-1.43 1.06-1.59 1.95l-.05.31C18.2 16.86 17.43 17.49 16.58 17.5L14 17.5" />
  </Svg>
);

// ─── VALIDATION ─────────────────────────────────────────────────────────────

export const CheckIcon = ({ color = '#10B981', size = 18, strokeWidth = 2.2 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Polyline points="20 6 9 17 4 12" />
  </Svg>
);

export const CheckCircleIcon = ({ color = '#10B981', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Polyline points="22 4 12 14.01 9 11.01" />
  </Svg>
);

export const XCircleIcon = ({ color = '#EF4444', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="15" y1="9" x2="9" y2="15" />
    <Line x1="9" y1="9" x2="15" y2="15" />
  </Svg>
);

export const AlertTriangleIcon = ({ color = '#F59E0B', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <Line x1="12" y1="9" x2="12" y2="13" />
    <Line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const PinIcon = ({ color = '#3B82F6', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Line x1="12" y1="17" x2="12" y2="22" />
    <Path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79L17 13V8h1a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1v5l-.89.45A2 2 0 0 0 5 15.24V17Z" />
  </Svg>
);

export const LightbulbIcon = ({ color = '#FBBF24', size = 22, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.42c.94.91 1.5 2.13 1.5 3.4V17h5v-1.18c0-1.27.57-2.49 1.5-3.4A6 6 0 0 0 12 2Z" />
  </Svg>
);

// ─── COACH / SOCIAL ─────────────────────────────────────────────────────────

export const CoachIcon = ({ color, size, strokeWidth }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

// ─── MOOD ICONS (for journal moods 😫😕😐😊🔥) ──────────────────────────────

export const MoodSadIcon = ({ color = '#EF4444', size = 28, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <Line x1="9" y1="9" x2="9.01" y2="9" />
    <Line x1="15" y1="9" x2="15.01" y2="9" />
  </Svg>
);

export const MoodMehIcon = ({ color = '#F59E0B', size = 28, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="8" y1="15" x2="16" y2="15" />
    <Line x1="9" y1="9" x2="9.01" y2="9" />
    <Line x1="15" y1="9" x2="15.01" y2="9" />
  </Svg>
);

export const MoodNeutralIcon = ({ color = '#94A3B8', size = 28, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="8" y1="14" x2="16" y2="14" />
    <Line x1="9" y1="9" x2="9.01" y2="9" />
    <Line x1="15" y1="9" x2="15.01" y2="9" />
  </Svg>
);

export const MoodHappyIcon = ({ color = '#10B981', size = 28, strokeWidth = 1.8 }: IconProps) => (
  <Svg {...base(color, size, strokeWidth)}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <Line x1="9" y1="9" x2="9.01" y2="9" />
    <Line x1="15" y1="9" x2="15.01" y2="9" />
  </Svg>
);

export const MoodFireIcon = FlameIcon;
