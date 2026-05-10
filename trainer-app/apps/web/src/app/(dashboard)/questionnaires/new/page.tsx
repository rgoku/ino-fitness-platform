'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, Plus, Trash2, GripVertical, Copy, Save, Eye, Send,
  Type, AlignLeft, Hash, CircleDot, ListChecks, Gauge, Calendar, Camera, FileUp, PenLine,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  createBlankQuestionnaire, createBlankQuestion,
  type Questionnaire, type Question, type QuestionType,
} from '@/lib/questionnaires';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<QuestionType, typeof Type> = {
  short_text: Type, long_text: AlignLeft, number: Hash,
  single_choice: CircleDot, multi_choice: ListChecks,
  scale: Gauge, date: Calendar, photo: Camera, file: FileUp, signature: PenLine,
};

const TYPE_OPTIONS: { type: QuestionType; label: string }[] = [
  { type: 'short_text', label: 'Short text' },
  { type: 'long_text', label: 'Long text' },
  { type: 'number', label: 'Number' },
  { type: 'single_choice', label: 'Single choice' },
  { type: 'multi_choice', label: 'Multi choice' },
  { type: 'scale', label: 'Scale (1-10)' },
  { type: 'date', label: 'Date' },
  { type: 'photo', label: 'Photo upload' },
  { type: 'file', label: 'File upload' },
  { type: 'signature', label: 'Signature' },
];

export default function QuestionnaireBuilder() {
  const [q, setQ] = useState<Questionnaire>(createBlankQuestionnaire());
  const [saved, setSaved] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState<string | null>(null);

  const update = (patch: Partial<Questionnaire>) => setQ((prev) => ({ ...prev, ...patch }));

  const updateSection = (sectionId: string, patch: Partial<typeof q.sections[0]>) => {
    setQ((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    }));
  };

  const addSection = () => {
    setQ((prev) => ({
      ...prev,
      sections: [...prev.sections, { id: `s-${Date.now()}`, title: `Section ${prev.sections.length + 1}`, questions: [] }],
    }));
  };

  const removeSection = (sectionId: string) => {
    if (q.sections.length === 1) return;
    setQ((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== sectionId) }));
  };

  const addQuestion = (sectionId: string, type: QuestionType) => {
    const newQ = createBlankQuestion(type);
    updateSection(sectionId, {
      questions: [...(q.sections.find((s) => s.id === sectionId)?.questions || []), newQ],
    });
    setShowTypePicker(null);
  };

  const updateQuestion = (sectionId: string, questionId: string, patch: Partial<Question>) => {
    const section = q.sections.find((s) => s.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      questions: section.questions.map((qq) => (qq.id === questionId ? { ...qq, ...patch } : qq)),
    });
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    const section = q.sections.find((s) => s.id === sectionId);
    if (!section) return;
    updateSection(sectionId, { questions: section.questions.filter((qq) => qq.id !== questionId) });
  };

  const duplicateQuestion = (sectionId: string, questionId: string) => {
    const section = q.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const question = section.questions.find((qq) => qq.id === questionId);
    if (!question) return;
    const copy: Question = { ...question, id: `q-${Date.now()}`, label: question.label + ' (copy)' };
    updateSection(sectionId, {
      questions: [...section.questions.slice(0, section.questions.findIndex((qq) => qq.id === questionId) + 1), copy, ...section.questions.slice(section.questions.findIndex((qq) => qq.id === questionId) + 1)],
    });
  };

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const totalQuestions = q.sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
      {/* Back */}
      <Link href="/questionnaires" className="inline-flex items-center gap-1 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
        <ChevronLeft size={16} /> Questionnaires
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <input
            value={q.name}
            onChange={(e) => update({ name: e.target.value })}
            className="w-full text-heading-1 text-[var(--color-text-primary)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
            placeholder="Untitled Questionnaire"
          />
          <input
            value={q.description}
            onChange={(e) => update({ description: e.target.value })}
            className="w-full mt-1 text-body-md text-[var(--color-text-secondary)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-tertiary)]"
            placeholder="Brief description for your clients..."
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="md" icon={<Eye size={14} />}>Preview</Button>
          <Button
            variant="primary"
            size="md"
            icon={saved ? <Check size={14} /> : <Save size={14} />}
            onClick={handleSave}
            disabled={saved}
          >
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-3">
        <Badge variant="brand">{q.sections.length} section{q.sections.length !== 1 && 's'}</Badge>
        <Badge variant="default">{totalQuestions} question{totalQuestions !== 1 && 's'}</Badge>
        <span className="text-body-xs text-[var(--color-text-tertiary)]">
          ~{Math.max(1, Math.round(totalQuestions * 0.4))} min to complete
        </span>
      </div>

      {/* Sections */}
      {q.sections.map((section, sIdx) => (
        <Card key={section.id}>
          <CardContent className="p-5 space-y-4">
            {/* Section header */}
            <div className="flex items-start gap-3 pb-3 border-b border-[var(--color-border-light)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sub-sm font-semibold tabular-nums">
                {sIdx + 1}
              </div>
              <div className="flex-1">
                <input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  className="w-full text-sub-md text-[var(--color-text-primary)] bg-transparent border-none focus:outline-none"
                />
                <input
                  value={section.description || ''}
                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                  placeholder="Section description (optional)..."
                  className="w-full mt-0.5 text-body-xs text-[var(--color-text-tertiary)] bg-transparent border-none focus:outline-none"
                />
              </div>
              {q.sections.length > 1 && (
                <button onClick={() => removeSection(section.id)} className="text-[var(--color-text-tertiary)] hover:text-error-500 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Questions */}
            {section.questions.map((question, qIdx) => (
              <QuestionEditor
                key={question.id}
                question={question}
                index={qIdx}
                onUpdate={(patch) => updateQuestion(section.id, question.id, patch)}
                onRemove={() => removeQuestion(section.id, question.id)}
                onDuplicate={() => duplicateQuestion(section.id, question.id)}
              />
            ))}

            {/* Add question */}
            <div className="relative">
              {showTypePicker === section.id ? (
                <div className="rounded-xl border border-brand-500/30 bg-[var(--color-surface)] p-3 shadow-lg">
                  <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Choose question type</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {TYPE_OPTIONS.map((opt) => {
                      const Icon = TYPE_ICONS[opt.type];
                      return (
                        <button
                          key={opt.type}
                          onClick={() => addQuestion(section.id, opt.type)}
                          className="flex flex-col items-center gap-1.5 rounded-lg border border-[var(--color-border)] p-3 hover:border-brand-500/50 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                        >
                          <Icon size={16} className="text-[var(--color-text-secondary)]" />
                          <span className="text-body-xs text-[var(--color-text-primary)] text-center">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowTypePicker(null)}
                    className="mt-2 text-body-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTypePicker(section.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] py-3 text-body-sm text-[var(--color-text-tertiary)] hover:border-brand-500/50 hover:text-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                >
                  <Plus size={14} /> Add question
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add section */}
      <button
        onClick={addSection}
        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-border)] py-5 text-sub-sm text-[var(--color-text-tertiary)] hover:border-brand-500/50 hover:text-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
      >
        <Plus size={16} /> Add section
      </button>

      {/* Bottom actions */}
      <div className="flex justify-between pt-4">
        <Link href="/questionnaires">
          <Button variant="ghost" size="md">Cancel</Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" icon={<Send size={14} />}>Send to Client</Button>
          <Button variant="primary" size="md" icon={<Save size={14} />} onClick={handleSave}>
            Save Questionnaire
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Editor ───────────────────────────────────────────────

function QuestionEditor({
  question, index, onUpdate, onRemove, onDuplicate,
}: {
  question: Question; index: number;
  onUpdate: (patch: Partial<Question>) => void;
  onRemove: () => void; onDuplicate: () => void;
}) {
  const Icon = TYPE_ICONS[question.type];

  const updateOption = (idx: number, value: string) => {
    const options = [...(question.options || [])];
    options[idx] = value;
    onUpdate({ options });
  };

  const addOption = () => {
    onUpdate({ options: [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`] });
  };

  const removeOption = (idx: number) => {
    onUpdate({ options: question.options?.filter((_, i) => i !== idx) });
  };

  return (
    <div className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-3 hover:border-brand-500/30 transition-colors">
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="mt-2 text-[var(--color-text-tertiary)] cursor-grab shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          {/* Label row */}
          <div className="flex items-center gap-2">
            <span className="text-body-xs tabular-nums text-[var(--color-text-tertiary)] w-6">{index + 1}.</span>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]">
              <Icon size={12} className="text-[var(--color-text-secondary)]" />
            </div>
            <input
              value={question.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="flex-1 bg-transparent text-body-sm text-[var(--color-text-primary)] border-none focus:outline-none"
              placeholder="Question text..."
            />
            <label className="flex items-center gap-1 text-body-xs text-[var(--color-text-tertiary)] cursor-pointer">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded border-[var(--color-border)]"
              />
              Required
            </label>
          </div>

          {/* Options for single/multi choice */}
          {(question.type === 'single_choice' || question.type === 'multi_choice') && (
            <div className="ml-8 space-y-1">
              {question.options?.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-body-xs text-[var(--color-text-tertiary)]">
                    {question.type === 'single_choice' ? '○' : '☐'}
                  </span>
                  <input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className="flex-1 bg-transparent text-body-xs text-[var(--color-text-primary)] border-none focus:outline-none border-b border-transparent focus:border-brand-500/50 py-0.5"
                  />
                  <button onClick={() => removeOption(i)} className="text-[var(--color-text-tertiary)] hover:text-error-500">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              <button onClick={addOption} className="text-body-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
                <Plus size={11} /> Add option
              </button>
            </div>
          )}

          {/* Scale config */}
          {question.type === 'scale' && (
            <div className="ml-8 flex items-center gap-3 text-body-xs text-[var(--color-text-tertiary)]">
              <span>Min:</span>
              <input
                type="number"
                value={question.minValue || 1}
                onChange={(e) => onUpdate({ minValue: +e.target.value })}
                className="w-14 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[var(--color-text-primary)]"
              />
              <span>Max:</span>
              <input
                type="number"
                value={question.maxValue || 10}
                onChange={(e) => onUpdate({ maxValue: +e.target.value })}
                className="w-14 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[var(--color-text-primary)]"
              />
            </div>
          )}

          {/* Help text */}
          <input
            value={question.help || ''}
            onChange={(e) => onUpdate({ help: e.target.value })}
            placeholder="Help text (optional)..."
            className="ml-8 w-full bg-transparent text-body-xs text-[var(--color-text-tertiary)] border-none focus:outline-none italic"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onDuplicate} className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]" title="Duplicate">
            <Copy size={12} />
          </button>
          <button onClick={onRemove} className="p-1 text-[var(--color-text-tertiary)] hover:text-error-500" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
