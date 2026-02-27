'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_MEMBERS, DEMO_WORKOUTS } from '@/lib/platform-data';

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'members', label: 'Clients' },
  { id: 'content', label: 'Workouts' },
  { id: 'videos', label: 'Videos' },
  { id: 'messages', label: 'Messages' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];

export default function DemoPage() {
  const [coachNav, setCoachNav] = useState('dashboard');
  const [fitTab, setFitTab] = useState('home');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setAnimIn(true));
  }, []);

  const fitUser = DEMO_MEMBERS[0];
  const avgProgress = Math.round(
    DEMO_MEMBERS.reduce((a, m) => a + m.progress, 0) / DEMO_MEMBERS.length * 100
  );
  const selectedWorkout = selectedWorkoutId
    ? DEMO_WORKOUTS.find((w) => w.id === selectedWorkoutId)
    : null;

  const completeExercise = (wId: string, eName: string) => {
    setCompletions((prev) => ({ ...prev, [`${wId}_${eName}`]: true }));
    setToast('Exercise completed! 💪');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-600 font-semibold text-sm hover:text-slate-900"
        >
          ← Back to Plans
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-platform-gradient flex items-center justify-center text-white font-extrabold text-[10px]">
            INÖ
          </div>
          <span className="font-bold text-slate-900">Platform Demo</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-platform-success/10 border border-platform-success/20">
          <div className="w-2 h-2 rounded-full bg-platform-success" />
          <span className="text-xs font-semibold text-platform-success">Live Preview</span>
        </div>
      </div>

      {/* Labels */}
      <div className="flex px-8 pt-6 gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">🖥️</div>
            <div>
              <div className="font-bold text-slate-900">INÖ Coach</div>
              <div className="text-xs text-slate-500">Web dashboard for coaches</div>
            </div>
          </div>
        </div>
        <div className="w-[364px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-platform-pink/10 flex items-center justify-center text-platform-pink">📱</div>
            <div>
              <div className="font-bold text-slate-900">INÖ Fit</div>
              <div className="text-xs text-slate-500">Mobile app for clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Side by side */}
      <div
        className={`flex gap-6 px-8 pb-12 pt-4 transition-all duration-500 ${
          animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Coach panel */}
        <div className="flex-1 flex h-[640px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <aside className="w-52 bg-slate-900 p-4 flex flex-col">
            <div className="flex items-center gap-2 px-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-platform-gradient flex items-center justify-center text-white font-extrabold text-[10px]">
                INÖ
              </div>
              <div>
                <div className="text-white font-bold text-sm">Coach</div>
                <div className="text-slate-500 text-[10px]">Elite Fitness</div>
              </div>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCoachNav(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                  coachNav === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className="pt-4 border-t border-white/10 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                SM
              </div>
              <div>
                <div className="text-white text-xs font-semibold">Sarah M.</div>
                <div className="text-slate-500 text-[10px]">Pro Plan</div>
              </div>
            </div>
          </aside>
          <main className="flex-1 p-6 overflow-y-auto">
            {coachNav === 'dashboard' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900">Dashboard</h2>
                <p className="text-sm text-slate-500 mt-1">Welcome back, Sarah!</p>
                <div className="grid grid-cols-4 gap-3 mt-6">
                  {[
                    { label: 'Active Clients', value: '47', color: 'indigo' },
                    { label: 'Avg Adherence', value: `${avgProgress}%`, color: 'green' },
                    { label: 'Pending Reviews', value: '5', color: 'amber' },
                    { label: 'At Risk', value: '3', color: 'red' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Clients</span>
                    <button onClick={() => setCoachNav('members')} className="text-xs text-indigo-600 font-semibold">
                      View All →
                    </button>
                  </div>
                  {DEMO_MEMBERS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setCoachNav('members')}
                      className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          m.status === 'at_risk' ? 'bg-red-500/10 text-red-600' : 'bg-indigo-500/10 text-indigo-600'
                        }`}
                      >
                        {m.initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.lastActive}</div>
                      </div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-platform-success"
                          style={{ width: `${m.progress * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{Math.round(m.progress * 100)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {coachNav === 'members' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 mb-5">Clients</h2>
                <div className="grid grid-cols-2 gap-4">
                  {DEMO_MEMBERS.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl p-5 border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                            m.status === 'at_risk' ? 'bg-red-500/10 text-red-600' : 'bg-indigo-500/10 text-indigo-600'
                          }`}
                        >
                          {m.initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className={`text-xs font-semibold ${m.status === 'at_risk' ? 'text-red-600' : 'text-platform-success'}`}>
                            {m.status === 'at_risk' ? '⚠ At Risk' : '● Active'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div><span className="text-slate-500">Adherence</span><br /><strong>{Math.round(m.progress * 100)}%</strong></div>
                        <div><span className="text-slate-500">Streak</span><br /><strong>{m.streak > 0 ? `🔥 ${m.streak}d` : '—'}</strong></div>
                        <div><span className="text-slate-500">Last Active</span><br /><strong>{m.lastActive}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {coachNav === 'content' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 mb-5">Workouts</h2>
                {DEMO_WORKOUTS.map((w) => (
                  <div key={w.id} className="bg-white rounded-xl p-5 border border-slate-200 mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="font-bold text-slate-900">{w.title}</div>
                        <div className="text-xs text-slate-500">{w.desc} · {w.exercises.length} exercises</div>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600">Active</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {w.exercises.map((e) => (
                        <span key={e.name} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                          {e.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
            {coachNav === 'videos' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Video Reviews</h2>
                <p className="text-sm text-slate-500 mb-5">Review client form check submissions</p>
                {[
                  { client: 'Emma Davis', exercise: 'Squat Form Check', time: '2 hours ago', status: 'pending' },
                  { client: 'James Wilson', exercise: 'Bench Press Form', time: 'Yesterday', status: 'pending' },
                  { client: 'Lisa Park', exercise: 'Deadlift Review', time: '2 days ago', status: 'approved' },
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 mb-2">
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-white text-2xl">▶</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{v.exercise}</div>
                      <div className="text-xs text-slate-500">{v.client} · {v.time}</div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                      v.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-platform-success/10 text-platform-success'
                    }`}>
                      {v.status === 'pending' ? 'Needs Review' : 'Approved'}
                    </span>
                  </div>
                ))}
              </>
            )}
            {coachNav === 'messages' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Messages</h2>
                <p className="text-sm text-slate-500 mb-5">Client conversations</p>
                {[
                  { name: 'Emma Davis', msg: 'Can we adjust my macros for this week?', time: '9:15 AM', unread: true },
                  { name: 'Lisa Park', msg: 'Thanks for the new program! Loving it 💪', time: 'Yesterday', unread: true },
                ].map((m, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border mb-2 cursor-pointer ${
                    m.unread ? 'bg-white border-indigo-500/30' : 'bg-white border-slate-200'
                  }`}>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 text-sm">
                      {m.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className={`font-semibold text-slate-900 ${m.unread ? 'font-bold' : ''}`}>{m.name}</span>
                        <span className="text-xs text-slate-400">{m.time}</span>
                      </div>
                      <div className="text-sm text-slate-600 truncate">{m.msg}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {coachNav === 'analytics' && (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Analytics</h2>
                <p className="text-sm text-slate-500 mb-5">Business performance</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Monthly Revenue', value: '$11,750', change: '+18%' },
                    { label: 'Retention Rate', value: '94%', change: '+3%' },
                    { label: 'Avg. Adherence', value: '82%', change: '+5%' },
                    { label: 'New Clients (30d)', value: '8', change: '+3' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-2">{s.label}</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-slate-900">{s.value}</span>
                        <span className="text-xs font-semibold text-platform-success bg-platform-success/10 px-2 py-0.5 rounded">↑ {s.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-4">Client Adherence (7-day)</div>
                  <div className="flex items-end gap-2 h-28">
                    {[65, 72, 58, 80, 85, 78, 92].map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-md bg-indigo-500/20"
                          style={{ height: `${v * 1.1}px` }}
                        />
                        <span className="text-[10px] text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {coachNav === 'settings' && (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 text-2xl mb-4">⚙️</div>
                <div className="font-bold text-slate-900 mb-1">Settings</div>
                <div className="text-sm text-slate-500">Organization & account settings</div>
              </div>
            )}
          </main>
        </div>

        {/* Fit phone */}
        <div className="w-[340px] flex-shrink-0 flex justify-center">
          <div className="w-[320px] bg-black rounded-[3rem] p-3 shadow-2xl">
            <div className="bg-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[620px]">
              <div className="flex justify-between items-center px-6 py-3 text-white text-sm font-semibold">
                <span>9:41</span>
                <div className="w-24 h-6 bg-black rounded-full" />
                <div className="w-6 h-3 bg-white rounded-sm" />
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {fitTab === 'home' && !selectedWorkout && (
                  <>
                    <div className="mb-6">
                      <div className="text-slate-400 text-sm">Welcome back,</div>
                      <div className="text-2xl font-extrabold text-white">{fitUser.name.split(' ')[0]} 👋</div>
                    </div>
                    <div className="bg-platform-gradient rounded-2xl p-5 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-white/70">Current Streak</div>
                          <div className="text-3xl font-extrabold text-white">{fitUser.streak} days</div>
                        </div>
                        <span className="text-4xl">🔥</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-white/70 mb-1">
                          <span>Adherence</span>
                          <span className="font-bold text-white">{Math.round(fitUser.progress * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full">
                          <div className="h-full bg-white rounded-full" style={{ width: `${fitUser.progress * 100}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-white mb-3">Today&apos;s Workouts</div>
                    {DEMO_WORKOUTS.map((w) => (
                      <div
                        key={w.id}
                        onClick={() => setSelectedWorkoutId(w.id)}
                        className="bg-white/5 rounded-xl p-4 mb-2 border border-white/10 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{w.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{w.exercises.length} exercises · {w.desc}</div>
                          </div>
                          <span className="text-slate-400">›</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {fitTab === 'home' && selectedWorkout && (
                  <>
                    <button
                      onClick={() => setSelectedWorkoutId(null)}
                      className="flex items-center gap-1.5 mb-4 text-white/80 text-sm font-semibold"
                    >
                      ← Back
                    </button>
                    <div className="text-xl font-extrabold text-white mb-1">{selectedWorkout.title}</div>
                    <div className="text-sm text-slate-400 mb-5">{selectedWorkout.desc}</div>
                    {selectedWorkout.exercises.map((e, i) => {
                      const done = completions[`${selectedWorkout.id}_${e.name}`];
                      return (
                        <div
                          key={i}
                          className={`rounded-xl p-4 mb-2 border ${
                            done ? 'bg-platform-success/10 border-platform-success/20' : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className={`text-sm font-semibold ${done ? 'text-platform-success' : 'text-white'}`}>
                                {done && '✓ '}{e.name}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">{e.sets} sets × {e.reps} reps</div>
                            </div>
                            {!done && (
                              <button
                                onClick={() => completeExercise(selectedWorkout.id, e.name)}
                                className="px-4 py-2 rounded-lg bg-platform-success text-white text-xs font-bold"
                              >
                                Done
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                {fitTab === 'progress' && (
                  <>
                    <div className="font-bold text-white mb-5">Your Progress</div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Day Streak', value: fitUser.streak, emoji: '🔥' },
                        { label: 'Adherence', value: `${Math.round(fitUser.progress * 100)}%`, emoji: '🎯' },
                        { label: 'Workouts', value: 3, emoji: '💪' },
                        { label: 'Completed', value: Object.keys(completions).length, emoji: '✓' },
                      ].map((s, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                          <div className="text-2xl font-extrabold text-white">{s.value}</div>
                          <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {fitTab === 'profile' && (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 flex items-center justify-center font-bold text-2xl text-indigo-400 mx-auto mb-4">
                      {fitUser.initials}
                    </div>
                    <div className="text-xl font-bold text-white">{fitUser.name}</div>
                    <div className="text-sm text-slate-400 mt-1">james@email.com</div>
                    <div className="mt-8 text-left space-y-0">
                      {['Notifications', 'Goals', 'Settings', 'My Coach'].map((item) => (
                        <div key={item} className="flex items-center gap-3 py-4 border-b border-white/5">
                          <span className="flex-1 text-white text-sm">{item}</span>
                          <span className="text-slate-400">›</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-black/80 backdrop-blur p-3 flex justify-around border-t border-white/5">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'progress', label: 'Progress' },
                  { id: 'profile', label: 'Profile' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setFitTab(tab.id);
                      if (tab.id !== 'home') setSelectedWorkoutId(null);
                    }}
                    className={`flex flex-col items-center gap-1 py-2 px-4 font-medium text-[10px] transition ${
                      fitTab === tab.id ? 'text-indigo-400' : 'text-white/40'
                    }`}
                  >
                    {tab.id === 'home' && '🏠'}
                    {tab.id === 'progress' && '📊'}
                    {tab.id === 'profile' && '👤'}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-7 right-7 z-50 bg-white rounded-xl px-6 py-4 shadow-xl border-l-4 border-platform-success flex items-center gap-3">
          <span className="text-platform-success text-xl">✓</span>
          <span className="font-semibold text-slate-900">{toast}</span>
        </div>
      )}
    </div>
  );
}
