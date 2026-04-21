'use client';

import { useState } from 'react';
import { Download, Share2, Instagram, Trophy, TrendingUp, Flame, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CARD_STYLES = [
  { id: 'dark', label: 'Dark', bg: 'bg-gradient-to-br from-[#0A0F1E] to-[#131B2E]', text: 'text-white' },
  { id: 'brand', label: 'Brand', bg: 'bg-gradient-to-br from-brand-500 to-cyan-500', text: 'text-white' },
  { id: 'minimal', label: 'Minimal', bg: 'bg-white', text: 'text-gray-900' },
];

const CARD_TYPES = [
  { id: 'transformation', label: 'Transformation', icon: TrendingUp },
  { id: 'pr', label: 'New PR', icon: Trophy },
  { id: 'streak', label: 'Streak', icon: Flame },
];

export default function ShareCardsPage() {
  const [style, setStyle] = useState('dark');
  const [type, setType] = useState('transformation');
  const [copied, setCopied] = useState(false);

  const currentStyle = CARD_STYLES.find((s) => s.id === style) || CARD_STYLES[0];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-heading-1 text-[var(--color-text-primary)]">Share Cards</h1>
        <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
          Auto-generate Instagram-ready progress cards for your clients. Free marketing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <div>
          <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Preview</p>
          <div className={cn('rounded-2xl p-8 aspect-square flex flex-col justify-between', currentStyle.bg, currentStyle.text)}>
            <div>
              <p className={cn('text-body-xs uppercase tracking-widest', style === 'minimal' ? 'text-gray-500' : 'opacity-70')}>
                {type === 'transformation' ? '12 WEEK TRANSFORMATION' : type === 'pr' ? 'NEW PERSONAL RECORD' : 'STREAK ACHIEVEMENT'}
              </p>
              <h2 className="text-3xl font-bold mt-2">James Wilson</h2>
            </div>

            {type === 'transformation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Weight', before: '85kg', after: '81kg', change: '-4kg' },
                    { label: 'Body Fat', before: '18.5%', after: '14.2%', change: '-4.3%' },
                    { label: 'Strength', before: '—', after: '+120kg', change: 'total' },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className={cn('text-body-xs', style === 'minimal' ? 'text-gray-500' : 'opacity-60')}>{m.label}</p>
                      <p className="text-2xl font-bold tabular-nums">{m.change}</p>
                    </div>
                  ))}
                </div>
                <div className={cn('h-px', style === 'minimal' ? 'bg-gray-200' : 'bg-white/20')} />
                <div className="flex justify-between items-center">
                  <p className={cn('text-body-xs', style === 'minimal' ? 'text-gray-500' : 'opacity-60')}>94% compliance · 45 workouts</p>
                  <p className="text-body-sm font-semibold">INÖ Fitness</p>
                </div>
              </div>
            )}

            {type === 'pr' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Trophy size={40} className={cn('mx-auto mb-3', style === 'brand' ? 'text-white' : 'text-amber-500')} />
                  <p className="text-5xl font-bold tabular-nums">102.5 kg</p>
                  <p className={cn('text-lg mt-1', style === 'minimal' ? 'text-gray-500' : 'opacity-70')}>Bench Press</p>
                  <p className={cn('text-body-sm mt-2', style === 'minimal' ? 'text-gray-400' : 'opacity-50')}>+32.5kg since starting</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className={cn('text-body-xs', style === 'minimal' ? 'text-gray-500' : 'opacity-60')}>12-week program</p>
                  <p className="text-body-sm font-semibold">INÖ Fitness</p>
                </div>
              </div>
            )}

            {type === 'streak' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Flame size={48} className={cn('mx-auto mb-3', style === 'brand' ? 'text-white' : 'text-orange-500')} />
                  <p className="text-6xl font-bold tabular-nums">22</p>
                  <p className={cn('text-xl mt-1', style === 'minimal' ? 'text-gray-500' : 'opacity-70')}>Day Streak</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className={cn('text-body-xs', style === 'minimal' ? 'text-gray-500' : 'opacity-60')}>Consistency champion</p>
                  <p className="text-body-sm font-semibold">INÖ Fitness</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div>
            <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Card Type</p>
            <div className="flex gap-2">
              {CARD_TYPES.map((t) => (
                <button key={t.id} onClick={() => setType(t.id)} className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-body-sm transition-colors',
                  type === t.id ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                )}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Style</p>
            <div className="flex gap-2">
              {CARD_STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)} className={cn(
                  'flex-1 rounded-lg border p-3 text-body-sm font-medium text-center transition-colors capitalize',
                  style === s.id ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button variant="primary" size="lg" className="w-full" icon={<Download size={16} />}>
              Download Card (1080×1080)
            </Button>
            <Button variant="secondary" size="lg" className="w-full" icon={<Instagram size={16} />}>
              Share to Instagram Story
            </Button>
            <Button
              variant="ghost" size="md" className="w-full"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            >
              {copied ? 'Link Copied' : 'Copy Share Link'}
            </Button>
          </div>

          <Card className="card-domain">
            <CardContent className="p-4">
              <p className="text-body-xs text-[var(--color-text-secondary)]">
                <span className="text-brand-400 font-medium">Pro tip:</span> Clients who share progress cards generate 3x more referrals. Enable auto-generate after every weekly check-in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
