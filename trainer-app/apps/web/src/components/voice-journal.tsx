'use client';

import { useState } from 'react';
import { Mic, Square, Play, Pause, Sparkles, Clock, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function VoiceJournal({ clientName = 'James W.' }: { clientName?: string }) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [seconds, setSeconds] = useState(0);

  const start = () => { setState('recording'); setSeconds(0); const t = setInterval(() => setSeconds((s) => s + 1), 1000); setTimeout(() => { clearInterval(t); setState('processing'); setTimeout(() => setState('done'), 2000); }, 8000); };
  const stop = () => { setState('processing'); setTimeout(() => setState('done'), 2000); };

  const summary = `${clientName} reported feeling strong this week. Hit all 4 training sessions and noted improved sleep quality (7.5hrs avg). Protein intake slightly below target on 2 days. Mentioned mild shoulder tightness during overhead pressing — recommend warm-up modification next week.`;

  return (
    <Card className={cn('overflow-hidden', state === 'recording' && 'border-error-500/50')}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Mic size={14} className="text-brand-500" />
          <p className="text-sub-md text-[var(--color-text-primary)]">Voice Journal</p>
          <span className="text-body-xs text-[var(--color-text-tertiary)]">Client talks 60s → AI summary for coach</span>
        </div>

        {state === 'idle' && (
          <button onClick={start} className="w-full flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-border)] p-8 hover:border-brand-500/50 hover:bg-brand-50/20 dark:hover:bg-brand-900/10 transition-colors">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white">
              <Mic size={24} />
            </div>
            <p className="text-body-sm text-[var(--color-text-secondary)]">Tap to start recording (up to 60 seconds)</p>
          </button>
        )}

        {state === 'recording' && (
          <div className="text-center py-4">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-error-500 text-white animate-pulse-soft">
              <Square size={20} />
            </div>
            <p className="text-heading-2 tabular-nums text-error-500 mt-3">0:{seconds.toString().padStart(2, '0')}</p>
            <p className="text-body-xs text-[var(--color-text-tertiary)] mt-1">Recording... tap to stop</p>
            <Button variant="danger" size="sm" className="mt-3" onClick={stop} icon={<Square size={12} />}>Stop</Button>
          </div>
        )}

        {state === 'processing' && (
          <div className="text-center py-8">
            <Sparkles size={24} className="mx-auto text-brand-500 animate-pulse-soft" />
            <p className="text-sub-md text-[var(--color-text-primary)] mt-3">AI is generating summary...</p>
          </div>
        )}

        {state === 'done' && (
          <div className="space-y-3">
            <div className="rounded-lg bg-brand-50/30 dark:bg-brand-900/10 border border-brand-500/20 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={12} className="text-brand-500" />
                <span className="text-body-xs font-medium text-brand-600 dark:text-brand-400">AI Summary</span>
              </div>
              <p className="text-body-sm text-[var(--color-text-primary)] leading-relaxed">{summary}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" icon={<Check size={12} />}>Save to Check-in</Button>
              <Button size="sm" variant="ghost" onClick={() => setState('idle')}>Record Again</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
