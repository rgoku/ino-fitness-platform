'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { VideoCard, type VideoItem } from '@/components/videos/video-card';
import { AddVideoDialog } from '@/components/videos/add-video-dialog';

const categories = ['All', 'Upper Body', 'Lower Body', 'Core', 'Mobility', 'Full Body', 'Cardio'];

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [addOpen, setAddOpen] = useState(false);

  const filteredVideos = useMemo(() => {
    let result = videos;
    if (activeCategory !== 'All') {
      result = result.filter((v) => v.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.exercise_name.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [videos, search, activeCategory]);

  const handleAdd = (video: VideoItem) => {
    setVideos((prev) => [video, ...prev]);
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Video Library
          </h1>
          <p className="mt-0.5 text-body-sm text-[var(--color-text-secondary)]">
            Exercise demos for your training programs
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus size={14} />
          Add Video
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-tertiary)]">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
            className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-3 text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-body-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {videos.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No videos yet"
          description="Add exercise demo videos to share with your clients and reference in programs."
          action={{ label: 'Add your first video', onClick: () => setAddOpen(true) }}
        />
      ) : filteredVideos.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-body-sm text-[var(--color-text-secondary)]">
            No videos match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <AddVideoDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
