'use client';

import { useState, useRef } from 'react';
import { Camera, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoComparisonProps {
  beforeDate?: string;
  afterDate?: string;
  className?: string;
}

export function PhotoComparison({ beforeDate = 'Week 1', afterDate = 'Week 12', className }: PhotoComparisonProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pos)));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        ref={containerRef}
        className="relative h-80 rounded-xl overflow-hidden border border-[var(--color-border)] cursor-col-resize select-none"
        onMouseDown={() => { isDragging.current = true; }}
        onMouseUp={() => { isDragging.current = false; }}
        onMouseLeave={() => { isDragging.current = false; }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchStart={() => { isDragging.current = true; }}
        onTouchEnd={() => { isDragging.current = false; }}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* Before (full width, clipped) */}
        <div className="absolute inset-0 bg-[var(--color-surface-tertiary)] flex items-center justify-center">
          <div className="text-center">
            <Camera size={32} className="mx-auto text-[var(--color-text-tertiary)] mb-2" />
            <p className="text-body-sm text-[var(--color-text-tertiary)]">Before Photo</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)]">{beforeDate}</p>
          </div>
        </div>

        {/* After (clipped by slider) */}
        <div
          className="absolute inset-0 bg-[var(--color-surface-secondary)] flex items-center justify-center"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
        >
          <div className="text-center">
            <Camera size={32} className="mx-auto text-brand-500 mb-2" />
            <p className="text-body-sm text-[var(--color-text-primary)]">After Photo</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)]">{afterDate}</p>
          </div>
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-[var(--color-border)]">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 rounded-full bg-[var(--color-text-tertiary)]" />
              <div className="w-0.5 h-4 rounded-full bg-[var(--color-text-tertiary)]" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 z-20">
          <span className="rounded-md bg-black/60 px-2 py-1 text-body-xs font-medium text-white backdrop-blur-sm">Before</span>
        </div>
        <div className="absolute top-3 right-3 z-20">
          <span className="rounded-md bg-brand-500/80 px-2 py-1 text-body-xs font-medium text-white backdrop-blur-sm">After</span>
        </div>
      </div>

      {/* Date labels */}
      <div className="flex justify-between">
        <div className="flex items-center gap-1.5 text-body-xs text-[var(--color-text-tertiary)]">
          <Calendar size={12} /> {beforeDate}
        </div>
        <div className="flex items-center gap-1.5 text-body-xs text-brand-500 font-medium">
          <Calendar size={12} /> {afterDate}
        </div>
      </div>
    </div>
  );
}
