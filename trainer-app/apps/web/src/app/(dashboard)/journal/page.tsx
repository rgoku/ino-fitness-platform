'use client';

import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Heart,
  Moon,
  Zap,
  Brain,
  Utensils,
  Activity,
  Watch,
  ChevronDown,
  ChevronUp,
  Send,
  Calendar,
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  clientName: string;
  clientAvatar: string;
  mood: number;
  energy: number;
  sleep: number;
  appetite: number;
  notes: string;
  manualData?: {
    sleepHours?: number;
    hrv?: number;
    restingHR?: number;
    steps?: number;
    weight?: number;
  };
  wearableConnected: 'oura' | 'whoop' | 'ultrahuman' | null;
  coachNote?: string;
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: '2026-06-08',
    clientName: 'Alex Rivera',
    clientAvatar: 'AR',
    mood: 8,
    energy: 7,
    sleep: 9,
    appetite: 6,
    notes: 'Felt strong today. Morning run was great. A little hungry in the afternoon but stuck to the plan.',
    manualData: { sleepHours: 7.5, hrv: 52, restingHR: 58, steps: 11200, weight: 82.3 },
    wearableConnected: 'oura',
  },
  {
    id: '2',
    date: '2026-06-08',
    clientName: 'Sarah Kim',
    clientAvatar: 'SK',
    mood: 5,
    energy: 4,
    sleep: 6,
    appetite: 3,
    notes: 'GLP-1 side effects kicking in. Nausea after lunch. Skipped evening snack. Feeling low energy overall.',
    manualData: { sleepHours: 6, steps: 4300, weight: 74.1 },
    wearableConnected: null,
  },
  {
    id: '3',
    date: '2026-06-07',
    clientName: 'Marcus Johnson',
    clientAvatar: 'MJ',
    mood: 9,
    energy: 8,
    sleep: 8,
    appetite: 7,
    notes: 'PR on deadlift today! 180kg x 3. Recovery feels great. Sleep was solid.',
    manualData: { sleepHours: 8.2, hrv: 68, restingHR: 52, steps: 8900, weight: 95.6 },
    wearableConnected: 'whoop',
  },
  {
    id: '4',
    date: '2026-06-07',
    clientName: 'Emma Torres',
    clientAvatar: 'ET',
    mood: 7,
    energy: 6,
    sleep: 7,
    appetite: 8,
    notes: 'Good day overall. Craving sweets in the evening but had Greek yogurt with berries instead.',
    manualData: { sleepHours: 7, steps: 6500, weight: 63.8 },
    wearableConnected: 'ultrahuman',
  },
];

const moodEmojis = ['', '😫', '😢', '😞', '😕', '😐', '🙂', '😊', '😄', '🤩', '🔥'];

function ScaleBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-[var(--color-surface-hover)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-body-xs tabular-nums font-medium text-[var(--color-text-primary)]">{value}/{max}</span>
    </div>
  );
}

function WearableBadge({ type }: { type: 'oura' | 'whoop' | 'ultrahuman' | null }) {
  if (!type) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-2 py-0.5 text-body-xs text-[var(--color-text-tertiary)]">
      <Watch size={10} /> Manual entry
    </span>
  );
  const labels = { oura: 'Oura Ring', whoop: 'WHOOP', ultrahuman: 'Ultrahuman' };
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-body-xs text-green-600 dark:text-green-400">
      <Activity size={10} /> {labels[type]}
    </span>
  );
}

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState('2026-06-08');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const filteredEntries = mockEntries.filter((e) => e.date === selectedDate);
  const dates = [...new Set(mockEntries.map((e) => e.date))].sort().reverse();

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Daily Journal
          </h1>
          <p className="text-body-sm text-[var(--color-text-secondary)]">
            Client daily check-ins, mood, energy, and biometrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[var(--color-text-tertiary)]" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-sm text-[var(--color-text-primary)]"
          >
            {dates.map((d) => (
              <option key={d} value={d}>{new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Entries Today', value: filteredEntries.length, icon: BookOpen, color: 'text-blue-500' },
          { label: 'Avg Mood', value: (filteredEntries.reduce((s, e) => s + e.mood, 0) / (filteredEntries.length || 1)).toFixed(1), icon: Heart, color: 'text-pink-500' },
          { label: 'Avg Energy', value: (filteredEntries.reduce((s, e) => s + e.energy, 0) / (filteredEntries.length || 1)).toFixed(1), icon: Zap, color: 'text-amber-500' },
          { label: 'Avg Sleep', value: (filteredEntries.reduce((s, e) => s + e.sleep, 0) / (filteredEntries.length || 1)).toFixed(1), icon: Moon, color: 'text-indigo-500' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex items-center gap-2">
              <stat.icon size={16} className={stat.color} />
              <span className="text-body-xs text-[var(--color-text-tertiary)]">{stat.label}</span>
            </div>
            <p className="mt-1 text-heading-2 tabular-nums text-[var(--color-text-primary)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Journal Entries */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
            <BookOpen size={32} className="mx-auto text-[var(--color-text-tertiary)]" />
            <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">No journal entries for this date</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
                    {entry.clientAvatar}
                  </div>
                  <div>
                    <p className="text-sub-md font-medium text-[var(--color-text-primary)]">{entry.clientName}</p>
                    <WearableBadge type={entry.wearableConnected} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                  <button
                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                    className="rounded-lg p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-hover)]"
                  >
                    {expandedEntry === entry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Scales */}
              <div className="grid grid-cols-2 gap-3 px-4 pb-3 lg:grid-cols-4">
                <div>
                  <span className="text-body-xs text-[var(--color-text-tertiary)] flex items-center gap-1"><Heart size={10} /> Mood</span>
                  <ScaleBar value={entry.mood} color="#ec4899" />
                </div>
                <div>
                  <span className="text-body-xs text-[var(--color-text-tertiary)] flex items-center gap-1"><Zap size={10} /> Energy</span>
                  <ScaleBar value={entry.energy} color="#f59e0b" />
                </div>
                <div>
                  <span className="text-body-xs text-[var(--color-text-tertiary)] flex items-center gap-1"><Moon size={10} /> Sleep</span>
                  <ScaleBar value={entry.sleep} color="#6366f1" />
                </div>
                <div>
                  <span className="text-body-xs text-[var(--color-text-tertiary)] flex items-center gap-1"><Utensils size={10} /> Appetite</span>
                  <ScaleBar value={entry.appetite} color="#10b981" />
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-[var(--color-border-light)] px-4 py-3">
                <p className="text-body-sm text-[var(--color-text-primary)]">{entry.notes}</p>
              </div>

              {/* Expanded section */}
              {expandedEntry === entry.id && (
                <div className="border-t border-[var(--color-border-light)] bg-[var(--color-surface-secondary)] p-4 space-y-4 animate-fade-in">
                  {/* Biometrics */}
                  {entry.manualData && (
                    <div>
                      <p className="text-body-xs font-medium text-[var(--color-text-secondary)] mb-2">Biometrics</p>
                      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
                        {entry.manualData.sleepHours != null && (
                          <div className="rounded-lg bg-[var(--color-surface)] p-2.5 border border-[var(--color-border-light)]">
                            <span className="text-body-xs text-[var(--color-text-tertiary)]">Sleep</span>
                            <p className="text-sub-md tabular-nums font-medium text-[var(--color-text-primary)]">{entry.manualData.sleepHours}h</p>
                          </div>
                        )}
                        {entry.manualData.hrv != null && (
                          <div className="rounded-lg bg-[var(--color-surface)] p-2.5 border border-[var(--color-border-light)]">
                            <span className="text-body-xs text-[var(--color-text-tertiary)]">HRV</span>
                            <p className="text-sub-md tabular-nums font-medium text-[var(--color-text-primary)]">{entry.manualData.hrv}ms</p>
                          </div>
                        )}
                        {entry.manualData.restingHR != null && (
                          <div className="rounded-lg bg-[var(--color-surface)] p-2.5 border border-[var(--color-border-light)]">
                            <span className="text-body-xs text-[var(--color-text-tertiary)]">Resting HR</span>
                            <p className="text-sub-md tabular-nums font-medium text-[var(--color-text-primary)]">{entry.manualData.restingHR}bpm</p>
                          </div>
                        )}
                        {entry.manualData.steps != null && (
                          <div className="rounded-lg bg-[var(--color-surface)] p-2.5 border border-[var(--color-border-light)]">
                            <span className="text-body-xs text-[var(--color-text-tertiary)]">Steps</span>
                            <p className="text-sub-md tabular-nums font-medium text-[var(--color-text-primary)]">{entry.manualData.steps.toLocaleString()}</p>
                          </div>
                        )}
                        {entry.manualData.weight != null && (
                          <div className="rounded-lg bg-[var(--color-surface)] p-2.5 border border-[var(--color-border-light)]">
                            <span className="text-body-xs text-[var(--color-text-tertiary)]">Weight</span>
                            <p className="text-sub-md tabular-nums font-medium text-[var(--color-text-primary)]">{entry.manualData.weight}kg</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Coach Reply */}
                  <div>
                    <p className="text-body-xs font-medium text-[var(--color-text-secondary)] mb-2">Coach Note</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText[entry.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [entry.id]: e.target.value })}
                        placeholder="Reply to this entry..."
                        className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
                      />
                      <button className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-700 transition-colors">
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
