'use client';

import { useState } from 'react';
import {
  ClipboardCheck,
  Camera,
  Scale,
  TrendingUp,
  MessageSquare,
  Calendar,
  Plus,
  GripVertical,
  Trash2,
  AlertTriangle,
  Send,
  Check,
  Type,
  Hash,
  Image,
  ToggleLeft,
  List,
  Gauge,
  ChevronDown,
  ChevronUp,
  StickyNote,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Dialog } from '@/components/ui/dialog';

// --- Mock Data ---

interface CheckIn {
  id: string;
  clientName: string;
  clientId: string;
  date: string;
  status: 'pending' | 'completed' | 'reviewed';
  weight: number;
  prevWeight: number;
  bodyFat: number;
  measurements: Record<string, number>;
  photos: string[];
  mood: string;
  sleepAvg: number;
  adherence: number;
  notes: string;
  answers: { question: string; answer: string }[];
  coachNotes?: string;
  flaggedNotes?: { text: string; suggestions: string[] };
}

interface Template {
  id: string;
  name: string;
  questions: { id: string; type: string; label: string; required: boolean }[];
  usedBy: number;
}

const mockCheckIns: CheckIn[] = [
  {
    id: 'ci-1',
    clientName: 'James Wilson',
    clientId: 'c1',
    date: '2026-06-07',
    status: 'pending',
    weight: 80.2,
    prevWeight: 80.8,
    bodyFat: 14.2,
    measurements: { chest: 102, waist: 82, hips: 96, arms: 38, thighs: 58 },
    photos: ['front', 'side', 'back'],
    mood: 'Great',
    sleepAvg: 7.5,
    adherence: 92,
    notes: 'Feeling strong this week. Hit a bench PR of 100kg!',
    answers: [
      { question: 'How many workouts did you complete?', answer: '5 out of 5' },
      { question: 'Any pain or discomfort?', answer: 'None, feeling great' },
      { question: 'Energy levels 1-10?', answer: '8' },
    ],
  },
  {
    id: 'ci-2',
    clientName: 'Maria Santos',
    clientId: 'c2',
    date: '2026-06-07',
    status: 'pending',
    weight: 61.5,
    prevWeight: 62.0,
    bodyFat: 21.8,
    measurements: { chest: 88, waist: 68, hips: 94, arms: 28, thighs: 54 },
    photos: ['front', 'side'],
    mood: 'Good',
    sleepAvg: 7.0,
    adherence: 88,
    notes: 'Cardio was tough this week but nutrition on point. Felt bloated on Wednesday.',
    answers: [
      { question: 'How many workouts did you complete?', answer: '4 out of 5' },
      { question: 'Any pain or discomfort?', answer: 'Slight tightness in left hip flexor' },
      { question: 'Energy levels 1-10?', answer: '7' },
    ],
  },
  {
    id: 'ci-3',
    clientName: 'Alex Chen',
    clientId: 'c3',
    date: '2026-06-05',
    status: 'completed',
    weight: 92.0,
    prevWeight: 93.2,
    bodyFat: 18.5,
    measurements: { chest: 110, waist: 90, hips: 102, arms: 42, thighs: 62 },
    photos: ['front', 'side', 'back'],
    mood: 'Okay',
    sleepAvg: 6.5,
    adherence: 75,
    notes: 'Missed two workouts due to travel. Tried to eat well but restaurant food made it hard.',
    answers: [
      { question: 'How many workouts did you complete?', answer: '3 out of 5' },
      { question: 'Any pain or discomfort?', answer: 'Lower back tight from sitting on flights' },
      { question: 'Energy levels 1-10?', answer: '5' },
    ],
    flaggedNotes: {
      text: 'Missed two workouts due to travel',
      suggestions: [
        'Did you get any movement in while traveling?',
        'How was nutrition while on the road?',
        'Would a travel-friendly workout plan help for next time?',
      ],
    },
  },
  {
    id: 'ci-4',
    clientName: 'Sophie Laurent',
    clientId: 'c4',
    date: '2026-06-04',
    status: 'completed',
    weight: 57.3,
    prevWeight: 57.5,
    bodyFat: 19.2,
    measurements: { chest: 84, waist: 64, hips: 90, arms: 26, thighs: 52 },
    photos: ['front', 'back'],
    mood: 'Amazing',
    sleepAvg: 8.0,
    adherence: 100,
    notes: 'Best week yet! All workouts completed, hit new deadlift PR.',
    answers: [
      { question: 'How many workouts did you complete?', answer: '5 out of 5' },
      { question: 'Any pain or discomfort?', answer: 'None' },
      { question: 'Energy levels 1-10?', answer: '9' },
    ],
  },
  {
    id: 'ci-5',
    clientName: 'David Park',
    clientId: 'c5',
    date: '2026-06-06',
    status: 'completed',
    weight: 77.8,
    prevWeight: 78.0,
    bodyFat: 16.1,
    measurements: { chest: 98, waist: 78, hips: 92, arms: 36, thighs: 56 },
    photos: ['front', 'side', 'back'],
    mood: 'Good',
    sleepAvg: 6.8,
    adherence: 80,
    notes: 'Solid week overall. Struggled with evening snacking on Thursday and Friday.',
    answers: [
      { question: 'How many workouts did you complete?', answer: '4 out of 5' },
      { question: 'Any pain or discomfort?', answer: 'Mild shoulder soreness from overhead press' },
      { question: 'Energy levels 1-10?', answer: '6' },
    ],
    flaggedNotes: {
      text: 'Struggled with evening snacking',
      suggestions: [
        'What do you think triggered the snacking?',
        'Would increasing protein at dinner help?',
        'Let\'s look at your meal timing for those days.',
      ],
    },
  },
];

// Clients who haven't submitted check-ins yet
const pendingSubmissions = [
  { id: 'c6', name: 'Emma Richards', lastCheckIn: '2026-05-31', daysOverdue: 7 },
  { id: 'c7', name: 'Ryan Foster', lastCheckIn: '2026-06-01', daysOverdue: 6 },
  { id: 'c8', name: 'Olivia Kim', lastCheckIn: '2026-06-03', daysOverdue: 4 },
];

const mockTemplates: Template[] = [
  {
    id: 't1',
    name: 'Standard Weekly Check-in',
    questions: [
      { id: 'q1', type: 'number', label: 'Current weight (kg)', required: true },
      { id: 'q2', type: 'photo', label: 'Progress photos (front, side, back)', required: true },
      { id: 'q3', type: 'scale', label: 'Energy levels this week', required: true },
      { id: 'q4', type: 'text', label: 'How did your workouts feel?', required: true },
      { id: 'q5', type: 'yesno', label: 'Any pain or discomfort?', required: true },
      { id: 'q6', type: 'scale', label: 'Sleep quality', required: false },
      { id: 'q7', type: 'text', label: 'Anything else to share?', required: false },
    ],
    usedBy: 24,
  },
  {
    id: 't2',
    name: 'Nutrition Focus Check-in',
    questions: [
      { id: 'q1', type: 'number', label: 'Average daily calories', required: true },
      { id: 'q2', type: 'number', label: 'Average daily protein (g)', required: true },
      { id: 'q3', type: 'scale', label: 'Hunger levels 1-10', required: true },
      { id: 'q4', type: 'multiple', label: 'Meals that felt hardest to stick to', required: false },
      { id: 'q5', type: 'text', label: 'Any cravings or challenges?', required: true },
    ],
    usedBy: 12,
  },
  {
    id: 't3',
    name: 'Recovery & Mobility',
    questions: [
      { id: 'q1', type: 'scale', label: 'Overall soreness 1-10', required: true },
      { id: 'q2', type: 'yesno', label: 'Did you complete all mobility work?', required: true },
      { id: 'q3', type: 'number', label: 'Hours of sleep per night (average)', required: true },
      { id: 'q4', type: 'text', label: 'Any new pain or discomfort?', required: true },
    ],
    usedBy: 8,
  },
];

const questionTypeIcons: Record<string, typeof Type> = {
  text: Type,
  number: Hash,
  photo: Image,
  scale: Gauge,
  yesno: ToggleLeft,
  multiple: List,
};

const questionTypeLabels: Record<string, string> = {
  text: 'Text',
  number: 'Number',
  photo: 'Photo Upload',
  scale: 'Scale 1-10',
  yesno: 'Yes/No',
  multiple: 'Multiple Choice',
};

const tabs = [
  { id: 'pending', label: 'Pending', count: pendingSubmissions.length },
  { id: 'completed', label: 'Completed', count: mockCheckIns.filter((ci) => ci.status === 'completed').length },
  { id: 'templates', label: 'Templates' },
];

export default function CheckInsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [coachNotes, setCoachNotes] = useState<Record<string, string>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateQuestions, setTemplateQuestions] = useState<{ id: string; type: string; label: string; required: boolean }[]>([
    { id: 'new-1', type: 'text', label: '', required: true },
  ]);
  const [templateName, setTemplateName] = useState('');
  const [sentReplies, setSentReplies] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReply = (checkInId: string) => {
    const text = replyTexts[checkInId];
    if (!text?.trim()) return;
    setSentReplies((prev) => ({ ...prev, [checkInId]: text }));
    setReplyTexts((prev) => ({ ...prev, [checkInId]: '' }));
  };

  const handleSuggestedReply = (checkInId: string, suggestion: string) => {
    setReplyTexts((prev) => ({ ...prev, [checkInId]: suggestion }));
  };

  const addQuestion = () => {
    setTemplateQuestions((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, type: 'text', label: '', required: false },
    ]);
  };

  const removeQuestion = (id: string) => {
    setTemplateQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: string | boolean) => {
    setTemplateQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const renderPendingTab = () => (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-warning-500" />
          <p className="text-body-sm font-medium text-[var(--color-text-primary)]">
            Clients who haven&apos;t submitted their check-in
          </p>
        </div>
        <div className="space-y-3">
          {pendingSubmissions.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border-light)] p-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={client.name} size="md" />
                <div>
                  <p className="text-body-sm font-medium text-[var(--color-text-primary)]">
                    {client.name}
                  </p>
                  <p className="text-body-xs text-[var(--color-text-tertiary)]">
                    Last check-in: {new Date(client.lastCheckIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={client.daysOverdue >= 7 ? 'danger' : 'warning'} dot>
                  {client.daysOverdue}d overdue
                </Badge>
                <Button variant="ghost" size="sm" icon={<Send size={13} />}>
                  Remind
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Also show check-ins awaiting review */}
      {mockCheckIns.filter((ci) => ci.status === 'pending').length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-6 mb-3">
            <ClipboardCheck size={16} className="text-blue-600" />
            <p className="text-body-sm font-medium text-[var(--color-text-primary)]">
              Submitted &mdash; awaiting your review
            </p>
          </div>
          {mockCheckIns
            .filter((ci) => ci.status === 'pending')
            .map((ci) => renderCheckInCard(ci))}
        </>
      )}
    </div>
  );

  const renderCompletedTab = () => (
    <div className="space-y-4">
      {mockCheckIns
        .filter((ci) => ci.status === 'completed')
        .map((ci) => renderCheckInCard(ci))}

      {mockCheckIns.filter((ci) => ci.status === 'completed').length === 0 && (
        <EmptyState
          icon={ClipboardCheck}
          title="No completed check-ins"
          description="Completed check-ins will appear here after you review them."
        />
      )}
    </div>
  );

  const renderCheckInCard = (ci: CheckIn) => {
    const isExpanded = expandedCards.has(ci.id);

    return (
      <Card key={ci.id} className="overflow-hidden">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar name={ci.clientName} size="lg" />
              <div>
                <p className="text-sub-md text-[var(--color-text-primary)]">{ci.clientName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar size={12} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-body-xs text-[var(--color-text-tertiary)]">
                    {new Date(ci.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={ci.status === 'pending' ? 'warning' : 'success'} dot>
                {ci.status === 'pending' ? 'Needs Review' : 'Reviewed'}
              </Badge>
              <button
                onClick={() => toggleExpand(ci.id)}
                className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp size={16} className="text-[var(--color-text-tertiary)]" />
                ) : (
                  <ChevronDown size={16} className="text-[var(--color-text-tertiary)]" />
                )}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Scale size={12} className="text-[var(--color-text-tertiary)]" />
                <span className="text-body-xs text-[var(--color-text-tertiary)]">Weight</span>
              </div>
              <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ci.weight} kg</p>
              <p className={`text-body-xs tabular-nums ${ci.weight < ci.prevWeight ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {ci.weight < ci.prevWeight ? '' : '+'}{(ci.weight - ci.prevWeight).toFixed(1)} kg
              </p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={12} className="text-[var(--color-text-tertiary)]" />
                <span className="text-body-xs text-[var(--color-text-tertiary)]">Body Fat</span>
              </div>
              <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ci.bodyFat}%</p>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-body-xs text-[var(--color-text-tertiary)]">Adherence</span>
              </div>
              <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ci.adherence}%</p>
              <ProgressBar value={ci.adherence} size="sm" variant={ci.adherence >= 80 ? 'brand' : 'warning'} className="mt-1" />
            </div>
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-body-xs text-[var(--color-text-tertiary)]">Sleep</span>
              </div>
              <p className="text-sub-md tabular-nums text-[var(--color-text-primary)]">{ci.sleepAvg}h</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)]">avg/night</p>
            </div>
          </div>

          {/* Progress Photos */}
          <div className="mb-4">
            <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
              Progress Photos
            </p>
            <div className="flex gap-2">
              {ci.photos.map((view) => (
                <div
                  key={view}
                  className="flex-1 h-28 rounded-lg bg-[var(--color-surface-tertiary)] flex flex-col items-center justify-center gap-1 border border-[var(--color-border-light)]"
                >
                  <Camera size={18} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-body-xs text-[var(--color-text-tertiary)] capitalize">{view}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Section */}
          {isExpanded && (
            <>
              {/* Measurements */}
              <div className="mb-4">
                <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                  Measurements (cm)
                </p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(ci.measurements).map(([key, val]) => (
                    <div key={key} className="rounded-md bg-[var(--color-surface-secondary)] px-2.5 py-1.5">
                      <span className="text-body-xs text-[var(--color-text-tertiary)] capitalize">{key} </span>
                      <span className="text-body-xs font-medium tabular-nums text-[var(--color-text-primary)]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questionnaire Answers */}
              <div className="mb-4">
                <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                  Questionnaire Answers
                </p>
                <div className="space-y-2">
                  {ci.answers.map((qa, idx) => (
                    <div key={idx} className="rounded-lg bg-[var(--color-surface-secondary)] p-3">
                      <p className="text-body-xs text-[var(--color-text-tertiary)]">{qa.question}</p>
                      <p className="text-body-sm text-[var(--color-text-primary)] mt-0.5">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Client Notes */}
          {ci.notes && (
            <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 mb-4">
              <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] mb-1">Client notes</p>
              <p className="text-body-sm text-[var(--color-text-primary)]">{ci.notes}</p>
            </div>
          )}

          {/* Flagged Notes with Contextual Suggestions */}
          {ci.flaggedNotes && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-body-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                    Highlighted note
                  </p>
                  <p className="text-body-sm text-amber-800 dark:text-amber-200 mb-2">
                    &ldquo;{ci.flaggedNotes.text}&rdquo;
                  </p>
                  <p className="text-body-xs text-[var(--color-text-tertiary)] mb-2">Quick replies:</p>
                  <div className="flex flex-col gap-1.5">
                    {ci.flaggedNotes.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedReply(ci.id, suggestion)}
                        className="text-left rounded-md border border-amber-200 dark:border-amber-700 bg-white dark:bg-amber-900/20 px-3 py-1.5 text-body-xs text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Persistent Coach Notes */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <StickyNote size={12} className="text-[var(--color-text-tertiary)]" />
              <p className="text-body-xs font-medium text-[var(--color-text-tertiary)]">
                Coach notes (persists between check-ins)
              </p>
            </div>
            <textarea
              value={coachNotes[ci.id] || ci.coachNotes || ''}
              onChange={(e) => setCoachNotes((prev) => ({ ...prev, [ci.id]: e.target.value }))}
              placeholder="Add private notes about this client's progress..."
              rows={2}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>

          {/* Inline Reply */}
          {sentReplies[ci.id] ? (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                <p className="text-body-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Reply sent
                </p>
              </div>
              <p className="text-body-sm text-emerald-800 dark:text-emerald-200">
                {sentReplies[ci.id]}
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <textarea
                value={replyTexts[ci.id] || ''}
                onChange={(e) => setReplyTexts((prev) => ({ ...prev, [ci.id]: e.target.value }))}
                placeholder="Type your feedback to the client..."
                rows={2}
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
              <div className="flex flex-col gap-1">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Send size={13} />}
                  onClick={() => handleReply(ci.id)}
                  disabled={!replyTexts[ci.id]?.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Reply
                </Button>
                <Button variant="secondary" size="sm">
                  Mark Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderTemplatesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          icon={<Plus size={16} />}
          onClick={() => setShowTemplateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Template
        </Button>
      </div>

      {mockTemplates.map((template) => (
        <Card key={template.id} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sub-md text-[var(--color-text-primary)]">{template.name}</p>
              <p className="text-body-xs text-[var(--color-text-tertiary)] mt-0.5">
                {template.questions.length} questions &middot; Used by {template.usedBy} clients
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">{template.questions.length} Q</Badge>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </div>

          <div className="space-y-2">
            {template.questions.map((q, idx) => {
              const Icon = questionTypeIcons[q.type] || Type;
              return (
                <div
                  key={q.id}
                  className="flex items-center gap-3 rounded-md bg-[var(--color-surface-secondary)] px-3 py-2"
                >
                  <span className="text-body-xs text-[var(--color-text-tertiary)] tabular-nums w-5">
                    {idx + 1}.
                  </span>
                  <Icon size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
                  <p className="flex-1 text-body-sm text-[var(--color-text-primary)]">{q.label}</p>
                  <Badge variant={q.required ? 'brand' : 'outline'}>
                    {q.required ? 'Required' : 'Optional'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-[var(--color-text-primary)]">
            Check-ins
            <span className="ml-2 text-heading-3 font-normal text-[var(--color-text-tertiary)] tabular-nums">
              {mockCheckIns.filter((ci) => ci.status === 'pending').length + pendingSubmissions.length} pending
            </span>
          </h1>
          <p className="mt-1 text-body-md text-[var(--color-text-secondary)]">
            Review client progress photos, measurements, and weekly updates.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'pending' && renderPendingTab()}
      {activeTab === 'completed' && renderCompletedTab()}
      {activeTab === 'templates' && renderTemplatesTab()}

      {/* Create Template Modal */}
      <Dialog
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Create Check-in Template"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-body-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Weekly Progress Check-in"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>

          <div>
            <p className="text-body-sm font-medium text-[var(--color-text-primary)] mb-3">
              Questions
            </p>
            <div className="space-y-3">
              {templateQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-start gap-2 rounded-lg border border-[var(--color-border)] p-3 bg-[var(--color-surface-secondary)]"
                >
                  <div className="mt-2 cursor-grab text-[var(--color-text-tertiary)]">
                    <GripVertical size={14} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={q.label}
                      onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                      placeholder="Question text..."
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-colors"
                    />
                    <div className="flex items-center gap-3">
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-body-xs text-[var(--color-text-primary)] focus:border-blue-500 focus:outline-none"
                      >
                        {Object.entries(questionTypeLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1.5 text-body-xs text-[var(--color-text-secondary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                          className="rounded border-[var(--color-border)] text-blue-600 focus:ring-blue-500"
                        />
                        Required
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="mt-2 p-1 rounded-md text-[var(--color-text-tertiary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    disabled={templateQuestions.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={14} />}
              onClick={addQuestion}
              className="mt-3"
            >
              Add Question
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border-light)]">
            <Button variant="secondary" size="md" onClick={() => setShowTemplateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowTemplateModal(false)}
              disabled={!templateName.trim() || templateQuestions.some((q) => !q.label.trim())}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Template
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
