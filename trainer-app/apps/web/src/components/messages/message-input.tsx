'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;
    onSend(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border p-3">
      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled}
          className={cn(
            'flex-1 resize-none rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm',
            'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
            'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
            'disabled:opacity-50'
          )}
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled}
          className="rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
