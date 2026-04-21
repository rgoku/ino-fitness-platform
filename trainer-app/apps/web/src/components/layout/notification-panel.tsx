'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, ClipboardCheck, MessageSquare, Trophy, AlertTriangle, Check, Archive, Settings } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const typeConfig = {
  'check-in': { icon: ClipboardCheck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  message:    { icon: MessageSquare, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
  milestone:  { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  alert:      { icon: AlertTriangle, color: 'text-error-500', bg: 'bg-error-50 dark:bg-red-900/20' },
} as const;

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <Bell size={16} strokeWidth={1.6} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[9px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-overlay animate-scale-in z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-4 py-3">
            <div>
              <p className="text-sub-md text-[var(--color-text-primary)]">Notifications</p>
              {unreadCount > 0 && (
                <p className="text-body-xs text-[var(--color-text-tertiary)]">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="rounded-md p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                  title="Mark all read"
                >
                  <Check size={14} />
                </button>
              )}
              <button className="rounded-md p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors" title="Settings">
                <Settings size={14} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 border-b border-[var(--color-border-light)] px-3 py-2">
            {([['all', 'All'], ['unread', 'Unread']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'rounded-md px-3 py-1 text-body-xs font-medium transition-colors',
                  filter === key
                    ? 'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
                )}
              >
                {label}
                {key === 'unread' && unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand-500/10 px-1.5 py-0.5 text-brand-500 tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-tertiary)] mb-3">
                  <Archive size={18} className="text-[var(--color-text-tertiary)]" />
                </div>
                <p className="text-sub-sm text-[var(--color-text-primary)]">All caught up</p>
                <p className="text-body-xs text-[var(--color-text-tertiary)] mt-1">No {filter === 'unread' ? 'unread' : ''} notifications</p>
              </div>
            ) : (
              filtered.map((notif) => {
                const cfg = typeConfig[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-hover)] border-l-2',
                      notif.read ? 'border-transparent' : 'border-brand-500 bg-brand-50/20 dark:bg-brand-900/10'
                    )}
                  >
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
                      <cfg.icon size={14} className={cfg.color} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-body-sm',
                        notif.read ? 'text-[var(--color-text-secondary)]' : 'font-medium text-[var(--color-text-primary)]'
                      )}>
                        {notif.title}
                      </p>
                      <p className="text-body-xs text-[var(--color-text-tertiary)] line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="mt-1 text-body-xs text-[var(--color-text-tertiary)]">
                        {formatRelativeTime(notif.timestamp)}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="border-t border-[var(--color-border-light)] px-4 py-2">
              <button className="w-full rounded-md py-1 text-body-xs font-medium text-brand-500 hover:bg-[var(--color-surface-hover)] transition-colors">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
