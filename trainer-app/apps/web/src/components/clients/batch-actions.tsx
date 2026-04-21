'use client';

import { useState } from 'react';
import { MessageSquare, UserPlus, Tag, Trash2, Send, Check, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BatchActionsProps {
  selectedIds: string[];
  onClear: () => void;
  onAction?: (action: string, data?: unknown) => void;
}

export function BatchActions({ selectedIds, onClear, onAction }: BatchActionsProps) {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const count = selectedIds.length;

  if (count === 0) return null;

  const handleSend = () => {
    onAction?.('message', { message, clientIds: selectedIds });
    setMessage('');
    setShowMessage(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <Card className="glow-green border-brand-500/30 shadow-xl">
        <div className="flex items-center gap-2 p-3">
          <div className="flex items-center gap-2 pr-3 border-r border-[var(--color-border)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white">
              <Check size={14} />
            </div>
            <span className="text-sub-sm text-[var(--color-text-primary)]">
              <span className="tabular-nums">{count}</span> selected
            </span>
          </div>

          {!showMessage ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<MessageSquare size={14} />}
                onClick={() => setShowMessage(true)}
              >
                Message
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<UserPlus size={14} />}
                onClick={() => onAction?.('assign_program')}
              >
                Assign Program
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Tag size={14} />}
                onClick={() => onAction?.('tag')}
              >
                Tag
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Download size={14} />}
                onClick={() => onAction?.('export')}
              >
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => onAction?.('delete')}
                className="text-error-500 hover:text-error-600"
              >
                Remove
              </Button>
              <button
                onClick={onClear}
                className="ml-2 flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)]"
                title="Clear selection"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); if (e.key === 'Escape') setShowMessage(false); }}
                placeholder={`Message ${count} client${count > 1 ? 's' : ''}...`}
                className="w-80 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <Button size="sm" icon={<Send size={14} />} onClick={handleSend} disabled={!message.trim()}>
                Send
              </Button>
              <button
                onClick={() => setShowMessage(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)]"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
