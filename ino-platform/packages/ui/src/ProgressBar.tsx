// ProgressBar.tsx
import React from 'react';
import { T } from './theme';

interface ProgressBarProps { value: number; color?: string; h?: number; }

export const ProgressBar = ({ value, color = T.success, h = 6 }: ProgressBarProps) => (
  <div style={{ height: h, background: T.bgAlt, borderRadius: h, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: h, transition: 'width 0.6s ease' }} />
  </div>
);
