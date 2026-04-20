'use client';

import { useState } from 'react';
import { Search, Filter, Download, Star, User, Dumbbell, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const TEMPLATES = [
  { id: 't1', name: 'Hypertrophy 8-Week Push/Pull/Legs', category: 'Hypertrophy', weeks: 8, days: 6, level: 'Intermediate', author: 'Sarah M.', rating: 4.9, downloads: 1240, price: 0, featured: true, preview: ['Bench Press 4×8', 'OHP 3×10', 'Squat 4×6', 'Deadlift 3×5'] },
  { id: 't2', name: 'Powerbuilding — 12 Week', category: 'Strength', weeks: 12, days: 4, level: 'Advanced', author: 'Mike C.', rating: 4.8, downloads: 890, price: 29, featured: true, preview: ['Squat 5×5', 'Bench 5×5', 'Deadlift 3×3', 'Row 5×8'] },
  { id: 't3', name: 'Beginner Full Body Foundation', category: 'Full Body', weeks: 6, days: 3, level: 'Beginner', author: 'Emma D.', rating: 4.9, downloads: 2100, price: 0, preview: ['Goblet Squat 3×8', 'DB Press 3×10', 'Row 3×10'] },
  { id: 't4', name: 'Glute-Focused Lower Body', category: 'Lower Body', weeks: 10, days: 3, level: 'Intermediate', author: 'Hannah L.', rating: 4.7, downloads: 650, price: 19, preview: ['Hip Thrust 4×10', 'RDL 4×8', 'Bulgarian Split Squat 3×10'] },
  { id: 't5', name: 'Athlete Conditioning', category: 'Athletic', weeks: 8, days: 5, level: 'Advanced', author: 'Tom B.', rating: 4.8, downloads: 420, price: 39, preview: ['Power Clean 5×3', 'Box Jump 4×5', 'Sled Push 4×20m'] },
  { id: 't6', name: 'Home Workout Bodyweight', category: 'Bodyweight', weeks: 6, days: 4, level: 'Beginner', author: 'Nina P.', rating: 4.6, downloads: 1800, price: 0, preview: ['Push-up 4×AMRAP', 'Pistol Squat 3×5', 'Pull-up 5×AMRAP'] },
];

const CATEGORIES = ['All', 'Hypertrophy', 'Strength', 'Full Body', 'Lower Body', 'Athletic', 'Bodyweight'];

export default function TemplateMarketplace() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = TEMPLATES.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const featured = filtered.filter((t) => t.featured);
  const regular = filtered.filter((t) => !t.featured);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Template Marketplace</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Browse proven programs from top coaches. Download free or paid templates.
          </p>
        </div>
        <Button variant="primary" icon={<Sparkles size={14} />}>
          Sell Your Template
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <Input
          placeholder="Search templates or coaches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
          className="flex-1"
        />
        <Button variant="secondary" icon={<Filter size={14} />}>Filters</Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-full px-4 py-1.5 text-body-xs font-medium transition-colors',
              category === cat
                ? 'bg-brand-500 text-white'
                : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <h2 className="text-heading-3 text-[var(--color-text-primary)] mb-3">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((t) => <TemplateCard key={t.id} template={t} featured />)}
          </div>
        </div>
      )}

      {/* Rest */}
      <div>
        <h2 className="text-heading-3 text-[var(--color-text-primary)] mb-3">All Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regular.map((t) => <TemplateCard key={t.id} template={t} />)}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template: t, featured = false }: { template: typeof TEMPLATES[0]; featured?: boolean }) {
  return (
    <Card className={cn('hover-limitless overflow-hidden', featured && 'border-brand-500/30')}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="brand">{t.category}</Badge>
              {featured && <Badge variant="warning"><TrendingUp size={10} className="mr-0.5" /> Trending</Badge>}
            </div>
            <h3 className="text-sub-md text-[var(--color-text-primary)]">{t.name}</h3>
          </div>
          <div className="text-right">
            {t.price === 0 ? (
              <Badge variant="success">Free</Badge>
            ) : (
              <p className="text-sub-md tabular-nums text-brand-500">${t.price}</p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-body-xs text-[var(--color-text-tertiary)]">
          <span className="flex items-center gap-1"><Clock size={11} />{t.weeks}w</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Dumbbell size={11} />{t.days}x/wk</span>
          <span>•</span>
          <span>{t.level}</span>
        </div>

        {/* Preview */}
        <div className="rounded-lg bg-[var(--color-surface-secondary)] p-2.5 space-y-1">
          {t.preview.slice(0, 3).map((ex, i) => (
            <p key={i} className="text-body-xs font-mono text-[var(--color-text-secondary)]">{ex}</p>
          ))}
          {t.preview.length > 3 && (
            <p className="text-body-xs text-[var(--color-text-tertiary)]">+{t.preview.length - 3} more exercises</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={t.author} size="sm" />
            <div>
              <p className="text-body-xs text-[var(--color-text-primary)]">{t.author}</p>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-amber-500 fill-amber-500" />
                <span className="text-body-xs tabular-nums text-[var(--color-text-tertiary)]">{t.rating}</span>
                <span className="text-body-xs text-[var(--color-text-tertiary)]">• {t.downloads.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Button size="sm" icon={<Download size={12} />}>
            {t.price === 0 ? 'Get' : 'Buy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
