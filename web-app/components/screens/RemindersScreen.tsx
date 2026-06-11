'use client';

import { useState } from 'react';

interface Reminder {
  id: number;
  title: string;
  time: string;
  enabled: boolean;
  icon: 'sun' | 'droplet' | 'footprints' | 'dumbbell';
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, title: 'Morning Workout', time: '7:00 AM', enabled: true, icon: 'sun' },
    { id: 2, title: 'Drink Water', time: '10:00 AM', enabled: true, icon: 'droplet' },
    { id: 3, title: 'Lunch Break Walk', time: '12:30 PM', enabled: false, icon: 'footprints' },
    { id: 4, title: 'Evening Gym', time: '6:00 PM', enabled: true, icon: 'dumbbell' },
  ]);

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const activeCount = reminders.filter(r => r.enabled).length;

  return (
    <div className="p-6 pb-24 overflow-y-auto h-full">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium tracking-wider text-white/30 uppercase mb-1">Stay on Track</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Reminders</h1>
      </div>

      {/* Active count card */}
      <div className="rounded-xl p-4 mb-6 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
          <BellIcon />
        </div>
        <div>
          <p className="text-sm font-medium text-white"><span className="tabular-nums">{activeCount}</span> active reminders</p>
          <p className="text-xs text-white/30">{reminders.length} total configured</p>
        </div>
      </div>

      {/* Reminder items */}
      {reminders.map(reminder => (
        <div
          key={reminder.id}
          className="rounded-xl p-4 mb-3 flex justify-between items-center transition-all"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <ReminderIcon type={reminder.icon} />
            </div>
            <div>
              <div className={`font-semibold text-sm mb-0.5 ${reminder.enabled ? 'text-white' : 'text-white/30'}`}>{reminder.title}</div>
              <div className="text-xs text-white/30 tabular-nums">{reminder.time}</div>
            </div>
          </div>
          <button
            onClick={() => toggleReminder(reminder.id)}
            className={`w-12 h-7 rounded-full p-1 transition-all ${
              reminder.enabled
                ? 'bg-brand-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-white/[0.08]'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
              reminder.enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      ))}

      <button
        className="w-full py-4 rounded-xl font-semibold mt-2 text-brand-400 text-sm transition-all hover:bg-brand-500/10"
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        + Add New Reminder
      </button>
    </div>
  );
}

/* ── SVG Icons ──────────────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function ReminderIcon({ type }: { type: string }) {
  switch (type) {
    case 'sun':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case 'droplet':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
      );
    case 'footprints':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
          <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" />
        </svg>
      );
    case 'dumbbell':
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6.5 6.5 11 11" />
          <path d="m21 21-1-1" />
          <path d="m3 3 1 1" />
          <path d="m18 22 4-4" />
          <path d="m2 6 4-4" />
          <path d="m3 10 7-7" />
          <path d="m14 21 7-7" />
        </svg>
      );
  }
}
