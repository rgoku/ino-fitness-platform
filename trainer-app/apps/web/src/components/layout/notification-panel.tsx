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
  message: 'text-brand-500',
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
        <button className="relative rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-surface-secondary hover:text-[var(--color-text-primary)] transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
            className="text-xs text-brand-500 hover:text-brand-600"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-[var(--color-text-tertiary)]">
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
                  'flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-surface-secondary transition-colors',
                  !notif.read && 'bg-brand-500/5'
                )}
              >
                <Icon size={16} className={cn('mt-0.5 shrink-0', typeColors[notif.type])} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm truncate',
                    notif.read ? 'text-[var(--color-text-secondary)]' : 'font-medium text-[var(--color-text-primary)]'
                  )}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)] truncate">{notif.message}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
                    {formatRelativeTime(notif.timestamp)}
                  </p>
                </div>
                {!notif.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                )}
              </button>
            );
          })
        )}
      </div>
    </Dropdown>
  );
}
