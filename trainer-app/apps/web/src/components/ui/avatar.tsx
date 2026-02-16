'use client';

import { cn, getInitials } from '@/lib/utils';
import { useState } from 'react';

const sizeMap = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
  xl: 'h-14 w-14 text-lg',
};

interface AvatarProps {
  src?: string;
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={cn(
          'shrink-0 rounded-full object-cover',
          sizeMap[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-brand-500/15 font-semibold text-brand-600 dark:text-brand-400',
        sizeMap[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
