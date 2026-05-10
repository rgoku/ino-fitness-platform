'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, LayoutDashboard, Users, Dumbbell, Video, Leaf, ClipboardCheck,
  MessageSquare, BarChart3, DollarSign, Trophy, Library, Gift, Settings,
  Plus, Sparkles, UserPlus, Play, FileText, ArrowRight, ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Command = {
  id: string;
  label: string;
  hint?: string;
  shortcut?: string;
  icon: typeof Search;
  action: () => void;
  group: 'Navigation' | 'Actions' | 'Clients' | 'Recent';
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  const commands: Command[] = useMemo(() => {
    const go = (href: string) => () => { router.push(href); onClose(); };
    return [
      { id: 'nav-dash', label: 'Dashboard', icon: LayoutDashboard, action: go('/'), group: 'Navigation' },
      { id: 'nav-clients', label: 'Clients', icon: Users, action: go('/clients'), group: 'Navigation' },
      { id: 'nav-programs', label: 'Programs', icon: Dumbbell, action: go('/programs'), group: 'Navigation' },
      { id: 'nav-videos', label: 'Videos', icon: Video, action: go('/videos'), group: 'Navigation' },
      { id: 'nav-nutrition', label: 'Nutrition', icon: Leaf, action: go('/nutrition'), group: 'Navigation' },
      { id: 'nav-checkins', label: 'Check-ins', icon: ClipboardCheck, action: go('/check-ins'), group: 'Navigation' },
      { id: 'nav-questionnaires', label: 'Questionnaires', icon: ClipboardList, action: go('/questionnaires'), group: 'Navigation' },
      { id: 'nav-messages', label: 'Messages', icon: MessageSquare, action: go('/messages'), group: 'Navigation' },
      { id: 'nav-analytics', label: 'Analytics', icon: BarChart3, action: go('/analytics'), group: 'Navigation' },
      { id: 'nav-leaderboard', label: 'Leaderboard', icon: Trophy, action: go('/leaderboard'), group: 'Navigation' },
      { id: 'nav-templates', label: 'Templates', icon: Library, action: go('/templates'), group: 'Navigation' },
      { id: 'nav-revenue', label: 'Revenue', icon: DollarSign, action: go('/revenue'), group: 'Navigation' },
      { id: 'nav-referrals', label: 'Referrals', icon: Gift, action: go('/referrals'), group: 'Navigation' },
      { id: 'nav-settings', label: 'Settings', icon: Settings, action: go('/settings'), group: 'Navigation' },

      { id: 'act-new-client', label: 'Add new client', shortcut: 'C', icon: UserPlus, action: go('/clients/onboard'), group: 'Actions' },
      { id: 'act-new-program', label: 'Create program with AI', shortcut: 'P', icon: Sparkles, action: go('/programs/builder'), group: 'Actions' },
      { id: 'act-start-session', label: 'Start workout session', shortcut: 'S', icon: Play, action: go('/programs/session'), group: 'Actions' },
      { id: 'act-new-diet', label: 'Generate diet plan', icon: FileText, action: go('/nutrition'), group: 'Actions' },
      { id: 'act-new-quest', label: 'Build questionnaire', shortcut: 'Q', icon: ClipboardList, action: go('/questionnaires/new'), group: 'Actions' },

      { id: 'client-james', label: 'James W.', hint: 'Active · 94% compliance', icon: Users, action: go('/clients/c1'), group: 'Clients' },
      { id: 'client-maria', label: 'Maria S.', hint: 'Active · 88% compliance', icon: Users, action: go('/clients/c2'), group: 'Clients' },
      { id: 'client-alex', label: 'Alex Chen', hint: 'At Risk · 52% compliance', icon: Users, action: go('/clients/c3'), group: 'Clients' },
      { id: 'client-sophie', label: 'Sophie T.', hint: 'Active · 91% compliance', icon: Users, action: go('/clients/c4'), group: 'Clients' },
      { id: 'client-emma', label: 'Emma D.', hint: 'Active · 97% compliance', icon: Users, action: go('/clients/c5'), group: 'Clients' },
    ];
  }, [router, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Command[]>();
    filtered.forEach((c) => {
      const list = groups.get(c.group) || [];
      list.push(c);
      groups.set(c.group, list);
    });
    return Array.from(groups.entries());
  }, [filtered]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        filtered[activeIdx]?.action();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, activeIdx, onClose]);

  if (!open) return null;

  let idx = -1;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-2xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-overlay animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3.5">
          <Search size={16} className="text-[var(--color-text-tertiary)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, programs, actions..."
            className="flex-1 bg-transparent text-body-md text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
          />
          <kbd className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-body-xs text-[var(--color-text-tertiary)]">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-body-sm text-[var(--color-text-tertiary)]">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-2">
                <p className="px-3 py-1.5 text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  {group}
                </p>
                {items.map((cmd) => {
                  idx++;
                  const isActive = idx === activeIdx;
                  const currentIdx = idx;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setActiveIdx(currentIdx)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        isActive ? 'bg-[var(--color-surface-hover)]' : ''
                      )}
                    >
                      <cmd.icon size={16} className={isActive ? 'text-brand-500' : 'text-[var(--color-text-tertiary)]'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-[var(--color-text-primary)]">{cmd.label}</p>
                        {cmd.hint && (
                          <p className="text-body-xs text-[var(--color-text-tertiary)]">{cmd.hint}</p>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 text-body-xs text-[var(--color-text-tertiary)]">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isActive && <ArrowRight size={14} className="text-brand-500" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-4 py-2 text-body-xs text-[var(--color-text-tertiary)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1 py-0.5">↵</kbd> select
            </span>
          </div>
          <span className="text-brand-500">INÖ Command Palette</span>
        </div>
      </div>
    </div>
  );
}
