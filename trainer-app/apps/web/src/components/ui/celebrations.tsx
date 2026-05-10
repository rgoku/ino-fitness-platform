'use client';

import { useEffect, useState } from 'react';
import { Trophy, Flame, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Confetti burst for PRs and achievements */
export function ConfettiBurst({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const colors = ['#2563EB', '#06B6D4', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 80,
      y: 50 + (Math.random() - 0.5) * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => { setParticles([]); onComplete?.(); }, 2000);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            animation: `confettiFall 1.5s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateY(200px) rotate(720deg) scale(0); }
        }
      `}</style>
    </div>
  );
}

/** Workout complete ring fill animation */
export function WorkoutCompleteRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const isComplete = progress >= 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-[var(--color-surface-tertiary)]" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          className={cn('transition-all duration-1000 ease-out', isComplete ? 'stroke-success-500' : 'stroke-brand-500')}
          strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isComplete ? (
          <div className="animate-scale-in">
            <Trophy size={28} className="text-success-500" />
          </div>
        ) : (
          <>
            <span className="text-heading-3 tabular-nums text-[var(--color-text-primary)]">{Math.round(progress)}%</span>
            <span className="text-body-xs text-[var(--color-text-tertiary)]">complete</span>
          </>
        )}
      </div>
    </div>
  );
}

/** Streak fire animation */
export function StreakFire({ streak, className }: { streak: number; className?: string }) {
  if (streak <= 0) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-xl',
        streak >= 7 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-[var(--color-surface-tertiary)]'
      )}>
        <Flame
          size={20}
          className={cn(
            'transition-colors',
            streak >= 30 ? 'text-red-500' :
            streak >= 14 ? 'text-orange-500' :
            streak >= 7 ? 'text-amber-500' :
            'text-[var(--color-text-tertiary)]'
          )}
        />
        {streak >= 7 && (
          <div className="absolute -top-1 -right-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-bold text-white">
              {streak >= 30 ? <Star size={8} /> : null}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sub-sm tabular-nums text-[var(--color-text-primary)]">{streak} day streak</p>
        <p className="text-body-xs text-[var(--color-text-tertiary)]">
          {streak >= 30 ? 'Legendary!' : streak >= 14 ? 'On fire!' : streak >= 7 ? 'Keep it up!' : 'Building momentum'}
        </p>
      </div>
    </div>
  );
}

/** Achievement unlock badge */
export function AchievementUnlock({ title, description, icon = 'trophy' }: { title: string; description: string; icon?: string }) {
  const Icon = icon === 'star' ? Star : icon === 'flame' ? Flame : icon === 'sparkles' ? Sparkles : Trophy;

  return (
    <div className="animate-slide-up rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-body-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Achievement Unlocked</p>
          <p className="text-sub-md text-[var(--color-text-primary)]">{title}</p>
          <p className="text-body-xs text-[var(--color-text-secondary)]">{description}</p>
        </div>
      </div>
    </div>
  );
}
