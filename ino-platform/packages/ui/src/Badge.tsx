// Badge.tsx
import React from 'react';
import { T } from './theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary';

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: T.bgAlt, color: T.textMuted },
  success: { bg: T.successBg, color: T.success },
  warning: { bg: T.warningBg, color: T.warning },
  danger:  { bg: T.dangerBg, color: T.danger },
  primary: { bg: T.primaryBg, color: T.primary },
};

interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; }

export const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const s = variantStyles[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 6, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color,
      fontFamily: T.font,
    }}>{children}</span>
  );
};
