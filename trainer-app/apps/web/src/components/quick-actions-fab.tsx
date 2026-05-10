'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, X, UserPlus, Dumbbell, MessageSquare, FileText,
  Sparkles, Play, Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  { id: 'client', label: 'Add Client', href: '/clients/onboard', icon: UserPlus, shortcut: 'C', color: 'bg-brand-500 hover:bg-brand-600' },
  { id: 'program', label: 'AI Program', href: '/programs/builder', icon: Sparkles, shortcut: 'P', color: 'bg-purple-500 hover:bg-purple-600' },
  { id: 'session', label: 'Start Session', href: '/programs/session', icon: Play, shortcut: 'S', color: 'bg-orange-500 hover:bg-orange-600' },
  { id: 'message', label: 'Message Client', href: '/messages', icon: MessageSquare, shortcut: 'M', color: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'diet', label: 'Diet Plan', href: '/nutrition', icon: FileText, shortcut: 'D', color: 'bg-emerald-500 hover:bg-emerald-600' },
];

interface QuickActionsFABProps {
  onOpenCommandPalette?: () => void;
}

export function QuickActionsFAB({ onOpenCommandPalette }: QuickActionsFABProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Action items (stacked above FAB) */}
        {open && (
          <>
            {/* Command palette launcher */}
            <button
              onClick={() => {
                setOpen(false);
                onOpenCommandPalette?.();
              }}
              className="flex items-center gap-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] pl-5 pr-4 py-3 shadow-lg hover-limitless animate-slide-up"
              style={{ animationDelay: '50ms' }}
            >
              <span className="text-body-sm font-medium text-[var(--color-text-primary)]">Command Palette</span>
              <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-body-xs text-[var(--color-text-tertiary)]">⌘K</kbd>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-md">
                <Command size={18} />
              </div>
            </button>

            {ACTIONS.map((action, i) => (
              <Link
                key={action.id}
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] pl-5 pr-4 py-3 shadow-lg hover-limitless animate-slide-up"
                style={{ animationDelay: `${(i + 2) * 50}ms` }}
              >
                <span className="text-body-sm font-medium text-[var(--color-text-primary)]">{action.label}</span>
                <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-body-xs text-[var(--color-text-tertiary)]">{action.shortcut}</kbd>
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md transition-colors',
                  action.color
                )}>
                  <action.icon size={18} />
                </div>
              </Link>
            ))}
          </>
        )}

        {/* Main FAB button */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-200',
            open
              ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rotate-45'
              : 'bg-gradient-to-br from-brand-500 to-cyan-500 text-white hover:scale-105 glow-green'
          )}
        >
          {open ? <X size={20} /> : <Plus size={22} strokeWidth={2.2} />}
        </button>
      </div>
    </>
  );
}
