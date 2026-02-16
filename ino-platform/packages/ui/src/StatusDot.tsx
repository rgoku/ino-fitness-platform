// StatusDot.tsx
import React from 'react';
import { T } from './theme';

const statusColors = { active: T.success, at_risk: T.danger, paused: T.warning, churned: T.textDim };
type Status = keyof typeof statusColors;

interface StatusDotProps { status: Status; label?: boolean; }

export const StatusDot = ({ status, label }: StatusDotProps) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status] }} />
    {label && <span style={{ fontSize: 12, fontWeight: 600, color: statusColors[status], textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>}
  </span>
);
