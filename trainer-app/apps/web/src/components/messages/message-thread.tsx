'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { MockMessage } from '@/lib/mock-data';

interface MessageThreadProps {
  messages: MockMessage[];
}

export function MessageThread({ messages }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            'flex',
            msg.sender === 'coach' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              'max-w-[75%] rounded-2xl px-4 py-2.5',
              msg.sender === 'coach'
                ? 'bg-brand-600 text-white rounded-br-md'
                : 'bg-surface-secondary text-[var(--color-text-primary)] rounded-bl-md'
            )}
          >
            <p className="text-sm">{msg.content}</p>
            <p
              className={cn(
                'mt-1 text-[10px]',
                msg.sender === 'coach' ? 'text-white/60' : 'text-[var(--color-text-tertiary)]'
              )}
            >
              {format(new Date(msg.timestamp), 'h:mm a')}
            </p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
