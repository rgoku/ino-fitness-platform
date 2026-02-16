'use client';

import { Avatar } from '@/components/ui/avatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Conversation } from '@/hooks/use-messages';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (clientId: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  return (
    <div className="space-y-0.5">
      {conversations.map((conv) => (
        <button
          key={conv.clientId}
          onClick={() => onSelect(conv.clientId)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
            selectedId === conv.clientId
              ? 'bg-brand-500/10'
              : 'hover:bg-surface-secondary'
          )}
        >
          <div className="relative">
            <Avatar name={conv.clientName} size="md" />
            {conv.unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                {conv.unreadCount}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={cn(
                'text-sm truncate',
                conv.unreadCount > 0
                  ? 'font-semibold text-[var(--color-text-primary)]'
                  : 'font-medium text-[var(--color-text-primary)]'
              )}>
                {conv.clientName}
              </p>
              <span className="shrink-0 text-xs text-[var(--color-text-tertiary)]">
                {formatRelativeTime(conv.lastMessageTime)}
              </span>
            </div>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">
              {conv.lastMessage}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
