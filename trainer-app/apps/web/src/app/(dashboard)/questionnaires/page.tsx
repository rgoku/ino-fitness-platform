'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, FileText, Clock, Users, Sparkles, Copy, Send, Star,
  HeartPulse, Utensils, Target, Moon, ClipboardList, ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TEMPLATE_QUESTIONNAIRES, countQuestions, type Questionnaire } from '@/lib/questionnaires';
import { cn } from '@/lib/utils';

// Mock coach-created questionnaires (normally from DB)
const COACH_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'custom-1',
    name: 'My Running Intake',
    description: 'Custom form for runners I coach — adds weekly mileage, race history.',
    type: 'custom',
    template: false,
    estimatedMinutes: 7,
    sections: [{ id: 's1', title: 'Running', questions: Array(14).fill(null).map((_, i) => ({ id: `q${i}`, type: 'short_text', label: '', required: false })) }],
    createdBy: 'Sarah Mitchell',
    createdAt: '2026-04-10T00:00:00Z',
    timesUsed: 8,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'intake', label: 'Intake', icon: ClipboardList },
  { id: 'check_in', label: 'Check-ins', icon: Clock },
  { id: 'injury', label: 'Injury', icon: HeartPulse },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'goal', label: 'Goals', icon: Target },
] as const;

const TYPE_ICONS: Record<string, typeof FileText> = {
  intake: ClipboardList, check_in: Clock, injury: HeartPulse,
  nutrition: Utensils, goal: Target, custom: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  intake:    'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400',
  check_in:  'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  injury:    'bg-error-50 text-error-600 dark:bg-red-900/20 dark:text-red-400',
  nutrition: 'bg-success-50 text-success-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  goal:      'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  custom:    'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]',
};

export default function QuestionnairesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const all = [...TEMPLATE_QUESTIONNAIRES, ...COACH_QUESTIONNAIRES];
  const filtered = all.filter((q) => {
    if (category !== 'all' && q.type !== category) return false;
    if (search && !q.name.toLowerCase().includes(search.toLowerCase()) && !q.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const templates = filtered.filter((q) => q.template);
  const custom = filtered.filter((q) => !q.template);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">Questionnaires</h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Send intake forms, check-ins, and custom surveys to your clients.
          </p>
        </div>
        <Link href="/questionnaires/new">
          <Button variant="primary" icon={<Plus size={14} />}>Build Custom</Button>
        </Link>
      </div>

      {/* Search */}
      <Input
        placeholder="Search questionnaires..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search size={14} />}
      />

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-body-xs font-medium transition-colors',
              category === cat.id
                ? 'bg-brand-500 text-white'
                : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            )}
          >
            {'icon' in cat && cat.icon && <cat.icon size={12} />}
            {cat.label}
          </button>
        ))}
      </div>

      {/* INO Templates */}
      {templates.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-brand-500" />
            <h2 className="text-heading-3 text-[var(--color-text-primary)]">INÖ Templates</h2>
            <Badge variant="brand">{templates.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((q) => <QuestionnaireCard key={q.id} questionnaire={q} />)}
          </div>
        </section>
      )}

      {/* Coach-Created */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-[var(--color-text-tertiary)]" />
          <h2 className="text-heading-3 text-[var(--color-text-primary)]">Your Custom Questionnaires</h2>
          <Badge variant="default">{custom.length}</Badge>
        </div>
        {custom.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-tertiary)] mb-3">
                <FileText size={20} className="text-[var(--color-text-tertiary)]" />
              </div>
              <p className="text-sub-md text-[var(--color-text-primary)]">No custom questionnaires yet</p>
              <p className="text-body-sm text-[var(--color-text-secondary)] mt-1 max-w-sm">
                Build your own intake forms, assessments, or surveys — or duplicate one of our templates to get started.
              </p>
              <Link href="/questionnaires/new" className="mt-4">
                <Button variant="primary" size="md" icon={<Plus size={14} />}>Build from scratch</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {custom.map((q) => <QuestionnaireCard key={q.id} questionnaire={q} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function QuestionnaireCard({ questionnaire: q }: { questionnaire: Questionnaire }) {
  const Icon = TYPE_ICONS[q.type];
  const colorClass = TYPE_COLORS[q.type];
  const qCount = countQuestions(q);

  return (
    <Link href={`/questionnaires/${q.id}`}>
      <Card className="hover-limitless cursor-pointer h-full">
        <CardContent className="p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colorClass)}>
              <Icon size={18} />
            </div>
            {q.template && (
              <Badge variant="brand">
                <Star size={10} className="mr-0.5 fill-brand-500" /> Template
              </Badge>
            )}
            {!q.template && (
              <Badge variant="default">Custom</Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sub-md text-[var(--color-text-primary)] mb-1">{q.name}</h3>
          <p className="text-body-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">{q.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-auto pt-4 text-body-xs text-[var(--color-text-tertiary)]">
            <span className="flex items-center gap-1">
              <FileText size={11} /> {qCount} questions
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> ~{q.estimatedMinutes} min
            </span>
            {q.timesUsed !== undefined && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users size={11} /> {q.timesUsed.toLocaleString()}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border-light)]">
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-body-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Copy size={11} /> Duplicate
            </button>
            <button
              onClick={(e) => { e.preventDefault(); }}
              className="flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-body-xs text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            >
              <Send size={11} /> Send to Client
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
