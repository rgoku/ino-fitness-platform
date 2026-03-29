'use client';

import { useState } from 'react';
import { Link, Upload, Play, Youtube } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { VideoItem } from './video-card';

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

const categories = ['Upper Body', 'Lower Body', 'Core', 'Mobility', 'Full Body', 'Cardio'];

interface AddVideoDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (video: VideoItem) => void;
}

export function AddVideoDialog({ open, onClose, onAdd }: AddVideoDialogProps) {
  const [exerciseName, setExerciseName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [mode, setMode] = useState<'youtube' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [notes, setNotes] = useState('');

  const youtubeId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;
  const thumbnail = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : null;

  const canSubmit = exerciseName.trim() && (mode === 'upload' || (mode === 'youtube' && youtubeId));

  const handleSubmit = () => {
    if (!canSubmit) return;

    const video: VideoItem = {
      id: `v-${Date.now()}`,
      exercise_name: exerciseName.trim(),
      category,
      video_url: mode === 'youtube' ? youtubeUrl : `uploaded-${Date.now()}.mp4`,
      video_type: mode,
      video_thumbnail: thumbnail || undefined,
      notes: notes.trim() || undefined,
      added_at: new Date().toISOString(),
    };

    onAdd(video);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setExerciseName('');
    setCategory(categories[0]);
    setMode('youtube');
    setYoutubeUrl('');
    setNotes('');
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Exercise Video" className="max-w-md">
      <div className="space-y-4">
        {/* Exercise Name */}
        <Input
          label="Exercise Name"
          placeholder="e.g. Barbell Back Squat"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
        />

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-body-sm font-medium text-[var(--color-text-primary)]">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Toggle */}
        <div className="space-y-1.5">
          <label className="block text-body-sm font-medium text-[var(--color-text-primary)]">
            Video Source
          </label>
          <div className="flex rounded-lg border border-[var(--color-border)] p-0.5">
            <button
              onClick={() => setMode('youtube')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-body-xs font-medium transition-colors ${
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
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-body-xs font-medium transition-colors ${
                mode === 'upload'
                  ? 'bg-brand-500 text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Upload size={12} />
              Upload Video
            </button>
          </div>
        </div>

        {/* YouTube URL or Upload Zone */}
        {mode === 'youtube' ? (
          <div className="space-y-3">
            <Input
              label="YouTube URL"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            {thumbnail && (
              <div className="relative overflow-hidden rounded-lg border border-[var(--color-border)]">
                <img src={thumbnail} alt="Video preview" className="w-full" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm">
                    <Play size={16} className="ml-0.5 text-[var(--color-text-primary)]" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-500/90 px-2 py-0.5 text-[10px] font-medium leading-none text-white backdrop-blur-sm">
                    <Youtube size={10} />
                    YouTube
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] p-8 text-center">
            <Upload size={24} className="mb-2 text-[var(--color-text-tertiary)]" />
            <p className="text-body-sm font-medium text-[var(--color-text-secondary)]">
              Drop video file here
            </p>
            <p className="mt-0.5 text-body-xs text-[var(--color-text-tertiary)]">
              MP4, MOV up to 100MB
            </p>
            <button className="mt-3 rounded-lg bg-[var(--color-surface-secondary)] px-4 py-2 text-body-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors">
              Browse Files
            </button>
          </div>
        )}

        {/* Notes */}
        <Textarea
          label="Notes"
          placeholder="Coaching cues, form tips, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={handleSubmit}>
            Add Video
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
