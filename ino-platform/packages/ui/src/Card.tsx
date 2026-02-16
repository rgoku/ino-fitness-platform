import React from 'react';
import { T } from './theme';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  border?: boolean;
  shadow?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card = ({ children, padding = 20, radius = 16, border = true, shadow = false, style, onClick }: CardProps) => (
  <div onClick={onClick} style={{
    background: T.bgCard, borderRadius: radius, padding,
    border: border ? `1px solid ${T.border}` : 'none',
    boxShadow: shadow ? T.shadowMd : T.shadow,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.15s ease',
    ...style,
  }}>{children}</div>
);
