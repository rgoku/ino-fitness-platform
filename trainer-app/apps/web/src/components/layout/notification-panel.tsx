'use client';

import { Bell, ClipboardCheck, MessageSquare, Trophy, AlertTriangle } from 'lucide-react';
import { Dropdown } from '@/components/ui/dropdown';
import { useNotificationStore } from '@/stores/notification-store';
import { formatRelativeTime, cn } from '@/lib/utils';

const typeIcons = {
  'check-in': ClipboardCheck,
  message: MessageSquare,
  milestone: Trophy,
  alert: AlertTriangle,
};

const typeColors = {
  'check-in': 'text-blue-500',
  message: 'text-[var(--color-accent)]',
  milestone: 'text-amber-500',
  alert: 'text-red-500',
};

export function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  return (
    <Dropdown
      align="right"
      className="w-80"
      trigger={
        <button className="relative rounded-[5px] p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors duration-75">
          <Bell size={16} strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="px-3 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
            className="text-xs text-[var(--color-accent)] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
            No notifications
          </p>
        ) : (
          notifications.map((notif) => {
            const Icon = typeIcons[notif.type];
            return (
              <button
                key={notif.id}
                onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                className={cn(
                  'flex w-full items-start gap-3 px-3 py-2 text-left transition-colors duration-75 hover:bg-[var(--color-surface-hover)]',
                  !notif.read && 'bg-[var(--color-accent-soft)]'
                )}
              >
                <Icon size={15} strokeWidth={1.8} className={cn('mt-0.5 shrink-0', typeColors[notif.type])} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm truncate',
                    notif.read ? 'text-[var(--color-text-secondary)]' : 'font-medium text-[var(--color-text-primary)]'
                  )}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)] truncate">{notif.message}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                    {formatRelativeTime(notif.timestamp)}
                  </p>
                </div>
                {!notif.read && (
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                )}
              </button>
            );
          })
        )}
      </div>
    </Dropdown>
  );
}
