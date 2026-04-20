'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, Trash2, Video, Play, Upload, Link, X } from 'lucide-react';
import type { MockTemplateExercise } from '@/lib/mock-data';

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

interface VideoPopoverProps {
  exercise: MockTemplateExercise;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onClose: () => void;
}

function VideoPopover({ exercise, onUpdate, onClose }: VideoPopoverProps) {
  const [mode, setMode] = useState<'youtube' | 'upload'>(exercise.video_type || 'youtube');
  const [url, setUrl] = useState(exercise.video_url || '');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const thumbnail = mode === 'youtube' && url ? (() => {
    const id = extractYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  })() : null;

  const handleSave = () => {
    if (mode === 'youtube' && url) {
      onUpdate(exercise.id, 'video_url', url);
      onUpdate(exercise.id, 'video_type', 'youtube' as unknown as number);
      const id = extractYouTubeId(url);
      if (id) {
        onUpdate(exercise.id, 'video_thumbnail', `https://img.youtube.com/vi/${id}/mqdefault.jpg` as unknown as number);
      }
    }
    onClose();
  };

  const handleRemove = () => {
    onUpdate(exercise.id, 'video_url', '');
    onUpdate(exercise.id, 'video_type', '' as unknown as number);
    onUpdate(exercise.id, 'video_thumbnail', '' as unknown as number);
    setUrl('');
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-overlay animate-fade-in"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-body-sm font-medium text-[var(--color-text-primary)]">Exercise Video</span>
        <button onClick={onClose} className="rounded-md p-0.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
          <X size={14} />
        </button>
      </div>

      {/* Toggle */}
      <div className="mb-3 flex rounded-lg border border-[var(--color-border)] p-0.5">
        <button
          onClick={() => setMode('youtube')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-body-xs font-medium transition-colors ${
            mode === 'youtube'
              ? 'bg-brand-500 text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Link size={12} />
          YouTube Link
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-body-xs font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-brand-500 text-white'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Upload size={12} />
          Upload Video
        </button>
      </div>

      {mode === 'youtube' ? (
        <div className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {thumbnail && (
            <div className="relative overflow-hidden rounded-lg border border-[var(--color-border)]">
              <img src={thumbnail} alt="Video thumbnail" className="w-full" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm">
                  <Play size={14} className="ml-0.5 text-[var(--color-text-primary)]" />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] p-6 text-center">
          <Upload size={20} className="mb-2 text-[var(--color-text-tertiary)]" />
          <p className="text-body-xs font-medium text-[var(--color-text-secondary)]">
            Drop video file here
          </p>
          <p className="mt-0.5 text-body-xs text-[var(--color-text-tertiary)]">
            MP4, MOV up to 100MB
          </p>
          <button className="mt-2 rounded-lg bg-[var(--color-surface-secondary)] px-3 py-1.5 text-body-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors">
            Browse Files
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex-1 rounded-lg bg-brand-500 px-3 py-1.5 text-body-xs font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Save
        </button>
        {exercise.video_url && (
          <button
            onClick={handleRemove}
            className="rounded-lg px-3 py-1.5 text-body-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

interface ExerciseRowProps {
  exercise: MockTemplateExercise;
  index: number;
  onUpdate: (id: string, field: string, value: string | number) => void;
  onDelete: (id: string) => void;
}

export function ExerciseRow({ exercise, index, onUpdate, onDelete }: ExerciseRowProps) {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2 rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-surface-secondary">
      <GripVertical size={14} className="shrink-0 text-[var(--color-text-tertiary)] cursor-grab" />
      <span className="w-6 shrink-0 text-xs text-[var(--color-text-tertiary)]">{index + 1}</span>

      <input
        type="text"
        value={exercise.exercise_name}
        onChange={(e) => onUpdate(exercise.id, 'exercise_name', e.target.value)}
        className="flex-1 min-w-0 rounded border-0 bg-transparent px-2 py-1 text-sm font-medium text-[var(--color-text-primary)] focus:bg-surface-secondary focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Exercise name"
      />

      <input
        type="number"
        value={exercise.sets}
        onChange={(e) => onUpdate(exercise.id, 'sets', parseInt(e.target.value) || 0)}
        className="w-14 rounded border border-border bg-surface px-2 py-1 text-center text-sm text-[var(--color-text-primary)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Sets"
        title="Sets"
      />

      <input
        type="text"
        value={exercise.reps}
        onChange={(e) => onUpdate(exercise.id, 'reps', e.target.value)}
        className="w-20 rounded border border-border bg-surface px-2 py-1 text-center text-sm text-[var(--color-text-primary)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Reps"
        title="Reps"
      />

      <input
        type="number"
        value={exercise.rest_seconds}
        onChange={(e) => onUpdate(exercise.id, 'rest_seconds', parseInt(e.target.value) || 0)}
        className="w-16 rounded border border-border bg-surface px-2 py-1 text-center text-sm text-[var(--color-text-primary)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        placeholder="Rest (s)"
        title="Rest (seconds)"
      />

      <div className="relative">
        <button
          onClick={() => setVideoOpen(!videoOpen)}
          className={`shrink-0 rounded-md p-1 transition-colors ${
            exercise.video_url
              ? 'text-brand-500 hover:text-brand-600 bg-brand-50 dark:bg-brand-900/20'
              : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
          }`}
          title={exercise.video_url ? 'Video attached' : 'Add video'}
        >
          <Video size={14} />
        </button>
        {videoOpen && (
          <VideoPopover
            exercise={exercise}
            onUpdate={onUpdate}
            onClose={() => setVideoOpen(false)}
          />
        )}
      </div>

      <button
        onClick={() => onDelete(exercise.id)}
        className="shrink-0 rounded-md p-1 text-[var(--color-text-tertiary)] hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
