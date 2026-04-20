'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Clock, FileText, Users, Send, Copy, Edit3, Star,
  ClipboardList, HeartPulse, Utensils, Target,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TEMPLATE_QUESTIONNAIRES, countQuestions, type Question } from '@/lib/questionnaires';

const TYPE_ICONS = {
  intake: ClipboardList, check_in: Clock, injury: HeartPulse,
  nutrition: Utensils, goal: Target, custom: FileText,
};

const TYPE_COLORS = {
  intake: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
  check_in: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  injury: 'bg-error-50 text-error-600 dark:bg-red-900/20 dark:text-red-400',
  nutrition: 'bg-success-50 text-success-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  goal: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  custom: 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]',
};

export default function QuestionnaireDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const q = TEMPLATE_QUESTIONNAIRES.find((t) => t.id === id) || TEMPLATE_QUESTIONNAIRES[0];
  const Icon = TYPE_ICONS[q.type as keyof typeof TYPE_ICONS] || FileText;
  const colorClass = TYPE_COLORS[q.type as keyof typeof TYPE_COLORS];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-slide-up">
      <Link href="/questionnaires" className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
        <ChevronLeft size={16} /> Questionnaires
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colorClass}`}>
            <Icon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {q.template && <Badge variant="brand"><Star size={10} className="mr-0.5 fill-brand-500" /> Template</Badge>}
              <Badge variant="default">{q.type.replace('_', ' ')}</Badge>
            </div>
            <h1 className="text-heading-1 text-[var(--color-text-primary)]">{q.name}</h1>
            <p className="mt-1 text-body-md text-[var(--color-text-secondary)] max-w-xl">{q.description}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="md" icon={<Copy size={14} />}>Duplicate</Button>
          {q.template ? (
            <Button variant="secondary" size="md" icon={<Edit3 size={14} />}>Edit Copy</Button>
          ) : (
            <Button variant="secondary" size="md" icon={<Edit3 size={14} />}>Edit</Button>
          )}
          <Button variant="primary" size="md" icon={<Send size={14} />}>Send to Client</Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-[var(--color-text-tertiary)]" />
          <span className="text-body-sm tabular-nums text-[var(--color-text-primary)]">{countQuestions(q)}</span>
          <span className="text-body-sm text-[var(--color-text-tertiary)]">questions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-[var(--color-text-tertiary)]" />
          <span className="text-body-sm tabular-nums text-[var(--color-text-primary)]">~{q.estimatedMinutes}</span>
          <span className="text-body-sm text-[var(--color-text-tertiary)]">min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ClipboardList size={14} className="text-[var(--color-text-tertiary)]" />
          <span className="text-body-sm tabular-nums text-[var(--color-text-primary)]">{q.sections.length}</span>
          <span className="text-body-sm text-[var(--color-text-tertiary)]">sections</span>
        </div>
        {q.timesUsed !== undefined && (
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-[var(--color-text-tertiary)]" />
            <span className="text-body-sm tabular-nums text-[var(--color-text-primary)]">{q.timesUsed.toLocaleString()}</span>
            <span className="text-body-sm text-[var(--color-text-tertiary)]">uses</span>
          </div>
        )}
      </div>

      {/* Sections preview */}
      <div className="space-y-4">
        <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">Preview</p>
        {q.sections.map((section, sIdx) => (
          <Card key={section.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-light)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sub-sm font-semibold tabular-nums">
                  {sIdx + 1}
                </div>
                <div>
                  <p className="text-sub-md text-[var(--color-text-primary)]">{section.title}</p>
                  {section.description && (
                    <p className="text-body-xs text-[var(--color-text-tertiary)]">{section.description}</p>
                  )}
                </div>
                <Badge variant="default" className="ml-auto">{section.questions.length} questions</Badge>
              </div>

              <div className="space-y-2">
                {section.questions.map((question, qIdx) => (
                  <QuestionPreview key={question.id} question={question} index={qIdx} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuestionPreview({ question, index }: { question: Question; index: number }) {
  return (
    <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
      <div className="flex items-start gap-2">
        <span className="text-body-xs tabular-nums text-[var(--color-text-tertiary)] mt-0.5 w-6">{index + 1}.</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-body-sm text-[var(--color-text-primary)]">{question.label}</p>
            {question.required && <span className="text-error-500 text-body-xs">*</span>}
            <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
          </div>
          {question.help && (
            <p className="text-body-xs text-[var(--color-text-tertiary)] italic mb-2">{question.help}</p>
          )}
          {/* Rendered preview */}
          {question.type === 'short_text' && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-xs text-[var(--color-text-tertiary)]">
              {question.placeholder || 'Short text answer'}
            </div>
          )}
          {question.type === 'long_text' && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-body-xs text-[var(--color-text-tertiary)] min-h-[60px]">
              {question.placeholder || 'Long text answer'}
            </div>
          )}
          {question.type === 'number' && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-xs text-[var(--color-text-tertiary)] w-32">
              Number
            </div>
          )}
          {question.type === 'single_choice' && (
            <div className="space-y-1">
              {question.options?.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 text-body-xs text-[var(--color-text-secondary)]">
                  <div className="h-3 w-3 rounded-full border border-[var(--color-border)]" />
                  {opt}
                </div>
              ))}
            </div>
          )}
          {question.type === 'multi_choice' && (
            <div className="space-y-1">
              {question.options?.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 text-body-xs text-[var(--color-text-secondary)]">
                  <div className="h-3 w-3 rounded border border-[var(--color-border)]" />
                  {opt}
                </div>
              ))}
            </div>
          )}
          {question.type === 'scale' && (
            <div className="flex items-center gap-1">
              {Array.from({ length: (question.maxValue || 10) - (question.minValue || 1) + 1 }).map((_, i) => (
                <div key={i} className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--color-border)] text-body-xs text-[var(--color-text-tertiary)]">
                  {(question.minValue || 1) + i}
                </div>
              ))}
              {question.scaleLabels && (
                <span className="ml-2 text-body-xs text-[var(--color-text-tertiary)]">
                  {question.scaleLabels.min} → {question.scaleLabels.max}
                </span>
              )}
            </div>
          )}
          {(question.type === 'photo' || question.type === 'file') && (
            <div className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-body-xs text-[var(--color-text-tertiary)] text-center">
              Upload {question.type === 'photo' ? 'image' : 'file'}
            </div>
          )}
          {question.type === 'date' && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-xs text-[var(--color-text-tertiary)] w-40">
              MM/DD/YYYY
            </div>
          )}
          {question.type === 'signature' && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-body-xs text-[var(--color-text-tertiary)] min-h-[50px] italic text-center">
              Signature pad
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
