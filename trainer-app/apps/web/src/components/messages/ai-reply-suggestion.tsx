'use client';

import { useState } from 'react';
import { Sparkles, Check, X, RefreshCw, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIReplyProps {
  clientMessage: string;
  clientName: string;
  context?: { compliance?: number; streak?: number; goals?: string[] };
  onUse: (reply: string) => void;
  onDismiss: () => void;
}

const REPLY_STYLES = [
  { id: 'supportive', label: 'Supportive', emoji: '💪' },
  { id: 'direct', label: 'Direct', emoji: '📋' },
  { id: 'motivational', label: 'Motivational', emoji: '🔥' },
] as const;

function generateReply(message: string, clientName: string, style: string, context?: AIReplyProps['context']): string {
  const firstName = clientName.split(' ')[0];
  const msg = message.toLowerCase();

  const templates = {
    supportive: {
      skip: `Hey ${firstName}, I hear you — some days are just harder. Let's scale today's session to 20 minutes instead of skipping. Even one quality set counts. You've got ${context?.streak || 0} days of momentum — let's protect that.`,
      progress: `${firstName}, you're doing the work — ${context?.compliance || 0}% compliance speaks for itself. Results compound. Trust the process, the scale will catch up. I'll review your numbers tonight and send adjustments.`,
      question: `Great question, ${firstName}. Let me explain based on where you are in the program: given your goals (${context?.goals?.join(', ') || 'your targets'}) and current output, here's my take — [ADD SPECIFIC ADVICE]. Let me know if that clicks.`,
      default: `Got it ${firstName} — thanks for the update. I'll adjust your programming for this week and send you the new plan tonight. Keep me posted.`,
    },
    direct: {
      skip: `${firstName}: don't skip, reduce. Do 3 sets of compound lifts only today — 15 minutes. Full session tomorrow. That's the plan.`,
      progress: `Numbers show ${context?.compliance || 0}% adherence and a ${context?.streak || 0}-day streak. That's elite consistency. Progress will follow. Stay the course 4 more weeks then we reassess.`,
      question: `Short answer: focus on the prescribed plan first. If still unclear after this week, we'll adjust. Long answer tonight.`,
      default: `Received. Plan adjustment coming tonight.`,
    },
    motivational: {
      skip: `${firstName}, champions show up on the days they don't feel like it. Do 10 minutes. That's all I'm asking. You'll feel different after. Let's go.`,
      progress: `${firstName} — ${context?.compliance || 0}% compliance, ${context?.streak || 0}-day streak, goals on the horizon (${context?.goals?.[0] || 'big things'}). You're not just training, you're becoming. Don't stop.`,
      question: `Love the question — means you're thinking like an athlete. Here's my take: trust the process, stay coachable, crush today's session. The rest follows.`,
      default: `${firstName}, I see you. Tonight I'll send the next wave. Stay hungry.`,
    },
  };

  const pool = templates[style as keyof typeof templates];
  if (msg.includes('skip') || msg.includes('tired') || msg.includes('cant') || msg.includes("can't")) return pool.skip;
  if (msg.includes('progress') || msg.includes('stuck') || msg.includes('plateau') || msg.includes('result')) return pool.progress;
  if (msg.includes('?') || msg.includes('how') || msg.includes('why') || msg.includes('what')) return pool.question;
  return pool.default;
}

export function AIReplySuggestion({ clientMessage, clientName, context, onUse, onDismiss }: AIReplyProps) {
  const [style, setStyle] = useState<typeof REPLY_STYLES[number]['id']>('supportive');
  const [regenerating, setRegenerating] = useState(false);
  const [reply, setReply] = useState(() => generateReply(clientMessage, clientName, 'supportive', context));
  const [editing, setEditing] = useState(false);

  const handleRegenerate = async () => {
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    setReply(generateReply(clientMessage, clientName, style, context));
    setRegenerating(false);
  };

  const handleStyleChange = (newStyle: typeof style) => {
    setStyle(newStyle);
    setReply(generateReply(clientMessage, clientName, newStyle, context));
  };

  return (
    <div className="rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-50/30 to-cyan-50/30 dark:from-brand-900/10 dark:to-cyan-900/10 p-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-body-xs font-semibold text-brand-600 dark:text-brand-400">AI Suggested Reply</span>
        </div>
        <button
          onClick={onDismiss}
          className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Style selector */}
      <div className="flex gap-1.5 mb-3">
        {REPLY_STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => handleStyleChange(s.id)}
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-body-xs transition-colors',
              style === s.id
                ? 'bg-brand-500 text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Reply preview / edit */}
      {editing ? (
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-body-sm text-[var(--color-text-primary)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
        />
      ) : (
        <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-light)] p-3 mb-3">
          <p className="text-body-sm text-[var(--color-text-primary)] leading-relaxed">{reply}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-body-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={regenerating ? 'animate-spin' : ''} />
            Regenerate
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="rounded-md px-2 py-1 text-body-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            {editing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(reply)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-body-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <Copy size={11} />
            Copy
          </button>
        </div>
        <Button size="sm" onClick={() => onUse(reply)} icon={<Check size={12} />}>
          Use Reply
        </Button>
      </div>
    </div>
  );
}
