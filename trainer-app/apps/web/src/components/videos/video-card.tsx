'use client';

import { Play, Youtube, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface VideoItem {
  id: string;
  exercise_name: string;
  category: string;
  video_url: string;
  video_type: 'youtube' | 'upload';
  video_thumbnail?: string;
  notes?: string;
  added_at: string;
}

interface VideoCardProps {
  video: VideoItem;
}

export function VideoCard({ video }: VideoCardProps) {
  const categoryColors: Record<string, 'brand' | 'info' | 'warning' | 'success' | 'danger'> = {
    'Upper Body': 'brand',
    'Lower Body': 'info',
    'Core': 'warning',
    'Mobility': 'success',
    'Full Body': 'danger',
    'Cardio': 'info',
  };

  const formattedDate = new Date(video.added_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs transition-all duration-200 hover:shadow-card-hover hover:border-[var(--color-text-tertiary)]/30">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[var(--color-surface-secondary)]">
        {video.video_thumbnail ? (
          <img
            src={video.video_thumbnail}
            alt={video.exercise_name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Upload size={32} className="text-[var(--color-text-tertiary)]" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 scale-90">
            <Play size={18} className="ml-0.5 text-[var(--color-text-primary)]" fill="currentColor" />
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium leading-none backdrop-blur-sm ${
            video.video_type === 'youtube'
              ? 'bg-red-500/90 text-white'
              : 'bg-[var(--color-surface)]/90 text-[var(--color-text-primary)] border border-[var(--color-border)]'
          }`}>
            {video.video_type === 'youtube' ? <Youtube size={10} /> : <Upload size={10} />}
            {video.video_type === 'youtube' ? 'YouTube' : 'Upload'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-body-sm font-semibold text-[var(--color-text-primary)] truncate">
          {video.exercise_name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <Badge variant={categoryColors[video.category] || 'default'}>
            {video.category}
          </Badge>
          <span className="text-body-xs text-[var(--color-text-tertiary)]">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
