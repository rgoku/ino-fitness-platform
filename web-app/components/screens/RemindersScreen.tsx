'use client';

import { useState } from 'react';

interface Reminder {
  id: number;
  title: string;
  time: string;
  enabled: boolean;
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, title: 'Morning Workout', time: '7:00 AM', enabled: true },
    { id: 2, title: 'Drink Water', time: '10:00 AM', enabled: true },
    { id: 3, title: 'Lunch Break Walk', time: '12:30 PM', enabled: false },
    { id: 4, title: 'Evening Gym', time: '6:00 PM', enabled: true },
  ]);

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  return (
    <div className="p-4 pb-20 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Your Reminders 🔔</h1>
        <p className="text-gray-600">Stay on track with notifications</p>
      </div>

      {reminders.map(reminder => (
        <div key={reminder.id} className="bg-white rounded-xl shadow-sm p-4 mb-3 flex justify-between items-center">
          <div>
            <div className="font-semibold text-gray-800 mb-1">{reminder.title}</div>
            <div className="text-sm text-gray-600">{reminder.time}</div>
          </div>
          <button
            onClick={() => toggleReminder(reminder.id)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              reminder.enabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              reminder.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}></div>
          </button>
        </div>
      ))}

      <button className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold mt-2 hover:bg-blue-600 transition">
        + Add New Reminder
      </button>
    </div>
  );
}
