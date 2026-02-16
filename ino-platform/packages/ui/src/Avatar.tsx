// Avatar.tsx
import React from 'react';
import { T } from './theme';

interface AvatarProps {
  initials: string;
  size?: number;
  color?: string;
  src?: string | null;
}

export const Avatar = ({ initials, size = 40, color = T.primary, src }: AvatarProps) => {
  if (src) {
    return (
      <img src={src} alt={initials} style={{
        width: size, height: size, borderRadius: size * 0.3, objectFit: 'cover', flexShrink: 0,
      }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontWeight: 700, fontSize: size * 0.35, flexShrink: 0, fontFamily: T.font,
    }}>{initials}</div>
  );
};
