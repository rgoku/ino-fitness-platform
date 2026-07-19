'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DEMO_MEMBERS, DEMO_WORKOUTS } from '@/lib/platform-data';
import { CustomCursor } from '@/components/CustomCursor';
import { ThemeToggle } from '@/components/ThemeToggle';

/* ══════════════════════════════════════════════════════════ */
/*  BOOT SEQUENCE — Terminal Loader                         */
/* ══════════════════════════════════════════════════════════ */
const BOOT_LINES = [
  { text: '$ ino --init --env=demo', type: 'cmd' },
  { text: '[INFO] Loading platform kernel v2.1.0...', type: 'info' },
  { text: '[INFO] Reading config ~/.ino/config.toml    [OK]', type: 'ok' },
  { text: '[INFO] Authenticating session (JWT-RS256)   [OK]', type: 'ok' },
  { text: '[INFO] Establishing secure TLS handshake    [OK]', type: 'ok' },
  { text: '[INFO] Connecting to Coach API (edge-us-1)  [OK]', type: 'ok' },
  { text: '[INFO] Hydrating client store (2.4MB)       [OK]', type: 'ok' },
  { text: '[INFO] Mounting AI inference engine         [OK]', type: 'ok' },
  { text: '[INFO] Loading periodization models         [OK]', type: 'ok' },
  { text: '[INFO] Spinning up automation workers (x8)  [OK]', type: 'ok' },
  { text: '[INFO] Syncing 2,412 coaches                [OK]', type: 'ok' },
  { text: '[INFO] Indexing 58,941 client records       [OK]', type: 'ok' },
  { text: '[INFO] Warming up form-analysis pipeline    [OK]', type: 'ok' },
  { text: '[INFO] Subscribing to realtime channels     [OK]', type: 'ok' },
  { text: '[INFO] Platform ready. Uptime: 247d 14h.', type: 'info' },
  { text: '$ ino dashboard --live --user=marcus', type: 'cmd' },
];

function BootSequence({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState<typeof BOOT_LINES>([]);
  const [fadeOut, setFadeOut] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const next = () => {
      if (cancelled) return;
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i];
        setVisible((prev) => [...prev, line]);
        i += 1;
        setTimeout(next, i === 1 ? 120 : 45 + Math.random() * 35);
      } else {
        setTimeout(() => {
          if (cancelled) return;
          setReady(true);
          setTimeout(() => {
            if (cancelled) return;
            setFadeOut(true);
            setTimeout(() => { if (!cancelled) onDone(); }, 400);
          }, 500);
        }, 250);
      }
    };
    next();
    return () => { cancelled = true; };
  }, [onDone]);

  const progress = Math.min(100, Math.round((visible.length / BOOT_LINES.length) * 100));
  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A] transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 grid-pattern" />

      {/* Central LOADING badge */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-10">
        <div className={`rounded-lg border backdrop-blur-xl px-8 py-5 text-center glow-accent transition-all duration-500 ${
          ready ? 'border-[#00B4D8]/40 bg-[#00B4D8]/[0.08]' : 'border-[#3A86FF]/30 bg-[#3A86FF]/[0.06]'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-[#00B4D8]' : 'bg-[#3A86FF] animate-pulse'}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-[#00B4D8]' : 'bg-[#3A86FF] animate-pulse'}`} style={{ animationDelay: '0.2s' }} />
            <span className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-[#00B4D8]' : 'bg-[#3A86FF] animate-pulse'}`} style={{ animationDelay: '0.4s' }} />
          </div>
          <div className={`font-mono text-[13px] font-bold uppercase tracking-[0.3em] ${ready ? 'text-[#00B4D8]' : 'text-[#3A86FF]'}`}>
            {ready ? 'Ready' : 'Loading...'}
          </div>
          <div className="mt-3 w-40 h-0.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3A86FF] to-[#00B4D8] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 font-mono text-[10px] text-white/40 tracking-wider">
            {ready ? '100% · System online' : `${progress}% · Initializing system`}
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-2xl mx-auto px-8 mt-20">
        {/* Terminal window */}
        <div className="rounded-lg border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-[#3A86FF]/5">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/15" />
              <div className="w-3 h-3 rounded-full bg-white/15" />
              <div className="w-3 h-3 rounded-full bg-[#3A86FF]/60" />
            </div>
            <div className="flex-1 text-center text-[11px] text-white/35 font-mono tracking-wider">ino@platform:~</div>
          </div>
          {/* Terminal body */}
          <div className="px-5 py-4 font-mono text-[12.5px] min-h-[460px]">
            {visible.map((line, i) => line && (
              <div key={i} className="leading-6">
                {line.type === 'cmd' && <span className="text-[#3A86FF]">{line.text}</span>}
                {line.type === 'info' && <span className="text-white/60">{line.text}</span>}
                {line.type === 'ok' && (
                  <span className="text-white/50">
                    {line.text.replace('[OK]', '')}
                    <span className="text-[#00B4D8]">[OK]</span>
                  </span>
                )}
              </div>
            ))}
            <div className="leading-6 inline-flex items-center">
              <span className="text-[#3A86FF]">&gt;&nbsp;</span>
              <span className="inline-block w-2 h-4 bg-[#3A86FF] animate-pulse ml-0.5" />
            </div>
          </div>
        </div>
        {/* Subtitle */}
        <div className="mt-6 text-center text-xs text-white/30 uppercase tracking-[0.25em] font-medium">
          Initializing demo environment
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  ICONS                                                   */
/* ══════════════════════════════════════════════════════════ */
const IconArrow = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);
const IconCheck = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'members',   label: 'Clients' },
  { id: 'workouts',  label: 'Workouts' },
  { id: 'analytics', label: 'Analytics' },
];

/* ══════════════════════════════════════════════════════════ */
/*  MAIN DEMO PAGE                                          */
/* ══════════════════════════════════════════════════════════ */
export default function DemoPage() {
  const [booted, setBooted] = useState(false);
  const [coachNav, setCoachNav] = useState('dashboard');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [device, setDevice] = useState<'ios' | 'android'>('ios');

  const avgProgress = Math.round(
    DEMO_MEMBERS.reduce((a, m) => a + m.progress, 0) / DEMO_MEMBERS.length * 100
  );
  const activeCount = DEMO_MEMBERS.filter((m) => m.status === 'active').length;
  const atRisk = DEMO_MEMBERS.filter((m) => m.status === 'at_risk').length;
  const selectedWorkout = selectedWorkoutId ? DEMO_WORKOUTS.find((w) => w.id === selectedWorkoutId) : null;

  const completeExercise = (wId: string, eName: string) => {
    setCompletions((prev) => ({ ...prev, [`${wId}_${eName}`]: true }));
    setToast(`✓ ${eName} logged`);
    setTimeout(() => setToast(null), 2200);
  };

  if (!booted) {
    return (
      <div className="custom-cursor-active">
        <CustomCursor />
        <BootSequence onDone={() => setBooted(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen noise bg-[#0A0A0A] custom-cursor-active">
      <CustomCursor />

      {/* Top bar */}
      <nav className="sticky top-0 z-40 bg-[#0A0A0A]/85 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors text-sm font-medium">
            <IconArrow className="w-3.5 h-3.5 rotate-180" />
            Back
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#3A86FF] flex items-center justify-center text-white font-black text-[9px]">INÖ</div>
            <span className="font-semibold text-white/90 text-sm tracking-tight">Platform Demo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3A86FF]/10 border border-[#3A86FF]/20">
              <span className="dot-accent" />
              <span className="text-[10px] font-bold text-[#3A86FF] uppercase tracking-wider">Live</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Command bar / terminal hint */}
      <div className="border-b border-white/5 bg-white/[0.012]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 flex items-center gap-3 font-mono text-[11px]">
          <span className="text-[#3A86FF]">$</span>
          <span className="text-white/40">ino view <span className="text-white/70">--section={coachNav}</span> <span className="text-[#00B4D8]">--live</span></span>
          <span className="ml-auto text-white/25">uptime 247d · 99.98%</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr_380px] gap-6">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-3 px-3">Navigation</div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCoachNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${
                    coachNav === item.id
                      ? 'bg-[#3A86FF]/10 text-white border border-[#3A86FF]/20'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  {coachNav === item.id && <span className="dot-accent" />}
                </button>
              ))}
            </div>

            {/* System stats — live platform telemetry */}
            <div className="mt-8 rounded-xl border border-white/8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-xl p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-bold">System</div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-[#10B981] opacity-70 animate-ping" />
                    <span className="relative rounded-full bg-[#10B981] w-1.5 h-1.5" />
                  </span>
                  <span className="text-[9px] text-[#10B981] font-bold tracking-[0.18em]">LIVE</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Coaches',        value: '2,412',  trend: null,     hot: false },
                  { label: 'Clients',        value: '58,941', trend: null,     hot: false },
                  { label: 'Workouts / day', value: '12,307', trend: '+4.2%',  hot: true  },
                  { label: 'AI calls / min', value: '847',    trend: null,     hot: true  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1 h-3.5 rounded-full ${
                          row.hot ? 'bg-[#10B981]' : 'bg-white/15'
                        }`}
                      />
                      <span className="text-[11px] text-white/55 tracking-wide">{row.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      {row.trend && (
                        <span className="text-[9px] text-[#10B981] font-semibold tabular-nums">
                          ▲ {row.trend}
                        </span>
                      )}
                      <span
                        className={`text-[13px] font-bold stat-number ${
                          row.hot ? 'text-white' : 'text-white/90'
                        }`}
                      >
                        {row.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN PANEL ── */}
        <main className="space-y-6 min-w-0">
          {coachNav === 'dashboard' && (
            <>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Good morning, Marcus</h1>
                <p className="text-sm text-white/40 mt-1">{activeCount} active · {atRisk} need attention · {avgProgress}% avg adherence</p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Total clients', value: '74', trend: '+12' },
                  { label: 'This week', value: '42', trend: 'workouts' },
                  { label: 'Compliance', value: `${avgProgress}%`, trend: '+3%' },
                  { label: 'MRR', value: '$7.4k', trend: '+$820' },
                ].map((s, i) => (
                  <div key={i} className="card-cinematic rounded-lg p-4">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-white/35 font-bold mb-2">{s.label}</div>
                    <div className="text-2xl font-black text-white tracking-tight stat-number">{s.value}</div>
                    <div className="text-[10px] text-[#00B4D8] mt-1 font-mono">{s.trend}</div>
                  </div>
                ))}
              </div>

              {/* Client roster */}
              <div className="card-cinematic rounded-lg overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="text-sm font-semibold text-white/90">Roster</div>
                  <span className="text-[11px] text-white/30 font-mono">{DEMO_MEMBERS.length} clients</span>
                </div>
                <div>
                  {DEMO_MEMBERS.map((m) => (
                    <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.015] transition-colors hoverable">
                      <div className="w-8 h-8 rounded-full bg-[#3A86FF]/10 border border-[#3A86FF]/15 flex items-center justify-center text-[#3A86FF] text-xs font-bold">{m.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{m.name}</div>
                        <div className="text-[11px] text-white/35 font-mono">{m.lastActive} · streak {m.streak}d</div>
                      </div>
                      <div className="w-32 hidden md:block">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${m.status === 'at_risk' ? 'bg-red-500/60' : 'bg-[#3A86FF]'}`}
                              style={{ width: `${m.progress * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-white/50 tabular-nums w-9 text-right">{Math.round(m.progress * 100)}%</span>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        m.status === 'at_risk'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-[#3A86FF]/10 text-[#3A86FF] border border-[#3A86FF]/20'
                      }`}>
                        {m.status === 'at_risk' ? 'At risk' : 'Active'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {coachNav === 'members' && (
            <>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Clients</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEMO_MEMBERS.map((m) => (
                  <div key={m.id} className="card-cinematic rounded-lg p-5 hoverable">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#3A86FF]/10 border border-[#3A86FF]/20 flex items-center justify-center text-[#3A86FF] font-bold">{m.initials}</div>
                      <div>
                        <div className="text-sm font-semibold text-white">{m.name}</div>
                        <div className="text-[11px] text-white/40 font-mono">{m.lastActive}</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                      <div className={`h-full ${m.status === 'at_risk' ? 'bg-red-500/60' : 'bg-[#3A86FF]'}`} style={{ width: `${m.progress * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-white/40">Adherence</span>
                      <span className="text-white/70">{Math.round(m.progress * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {coachNav === 'workouts' && (
            <>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Workouts</h1>
              <div className="space-y-3">
                {DEMO_WORKOUTS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWorkoutId(w.id === selectedWorkoutId ? null : w.id)}
                    className={`w-full text-left card-cinematic rounded-lg p-5 hoverable ${selectedWorkoutId === w.id ? 'border-[#3A86FF]/30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-bold text-white">{w.title}</div>
                        <div className="text-[11px] text-white/40">{w.desc}</div>
                      </div>
                      <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{w.exercises.length} exercises</span>
                    </div>
                    {selectedWorkoutId === w.id && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                        {w.exercises.map((ex) => {
                          const done = completions[`${w.id}_${ex.name}`];
                          return (
                            <div key={ex.name} className="flex items-center justify-between py-1.5">
                              <span className={`text-sm ${done ? 'text-white/30 line-through' : 'text-white/80'}`}>{ex.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] text-white/40 font-mono">{ex.sets}×{ex.reps}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); completeExercise(w.id, ex.name); }}
                                  className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${
                                    done ? 'bg-[#3A86FF] border-[#3A86FF] text-white' : 'border-white/15 text-transparent hover:border-[#3A86FF]/50'
                                  }`}
                                >
                                  <IconCheck className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {coachNav === 'analytics' && (
            <>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Analytics</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Retention', value: '94%', sub: 'last 90 days' },
                  { label: 'Completion', value: '91%', sub: 'avg per client' },
                  { label: 'Revenue/client', value: '$312', sub: 'monthly' },
                  { label: 'Lifetime value', value: '$3.7k', sub: 'projected' },
                ].map((s, i) => (
                  <div key={i} className="card-cinematic rounded-lg p-6">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold mb-3">{s.label}</div>
                    <div className="text-4xl font-black text-white tracking-tight stat-number">{s.value}</div>
                    <div className="text-[11px] text-white/35 mt-1 font-mono">{s.sub}</div>
                  </div>
                ))}
              </div>
              {/* Fake chart */}
              <div className="card-cinematic rounded-lg p-6">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold mb-4">Weekly workouts logged</div>
                <div className="flex items-end gap-2 h-32">
                  {[42, 58, 49, 71, 63, 82, 74].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full rounded-t bg-gradient-to-t from-[#3A86FF] to-[#00B4D8]" style={{ height: `${v}%` }} />
                      <span className="text-[10px] text-white/30 font-mono">{['M','T','W','T','F','S','S'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>

        {/* ── RIGHT: PHONE PREVIEW ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-3 px-1">Client App · Live</div>
            <div className="mx-auto w-[300px]">
              {/* Phone frame — accent shadow matches the real app's emerald primary.
                  Chrome (corner radius, notch vs punch-hole, status bar) swaps with `device`. */}
              <div
                className={`relative border border-white/10 bg-black/40 p-2 shadow-2xl shadow-[#10B981]/5 transition-all duration-300 ${
                  device === 'ios' ? 'rounded-[2.5rem]' : 'rounded-[1.75rem]'
                }`}
              >
                <div
                  className={`bg-[#0A0F1E] overflow-hidden border border-white/5 ${
                    device === 'ios' ? 'rounded-[2rem]' : 'rounded-[1.25rem]'
                  }`}
                >
                  {device === 'ios' ? (
                    /* iOS — Dynamic-Island-style pill */
                    <div className="h-6 flex items-center justify-center">
                      <div className="w-20 h-4 rounded-full bg-black" />
                    </div>
                  ) : (
                    /* Android — status bar with centered punch-hole camera */
                    <div className="relative h-6 flex items-center justify-between px-4 text-[8px] font-mono text-white/55">
                      <span>9:41</span>
                      <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-2 h-2 rounded-full bg-black ring-1 ring-white/10" />
                      <div className="flex items-center gap-1">
                        {/* signal */}
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="currentColor"><rect x="0" y="5" width="1.5" height="2"/><rect x="2.5" y="3" width="1.5" height="4"/><rect x="5" y="1" width="1.5" height="6"/><rect x="7.5" y="0" width="1.5" height="7"/></svg>
                        {/* battery */}
                        <svg width="13" height="7" viewBox="0 0 13 7" fill="none" stroke="currentColor" strokeWidth="0.8"><rect x="0.5" y="0.5" width="10" height="6" rx="1"/><rect x="1.5" y="1.5" width="7" height="4" fill="currentColor"/><rect x="11" y="2" width="1.2" height="3" fill="currentColor"/></svg>
                      </div>
                    </div>
                  )}

                  {/* App body — mirrors mobile/src/screens/HomeScreen.tsx */}
                  <div className="px-4 pb-5 min-h-[520px]">
                    {/* Header: "GOOD MORNING" + greeting */}
                    <div className="mb-4">
                      <div className="text-[9px] text-white/35 uppercase tracking-[0.18em] font-bold">Good morning</div>
                      <div className="text-[17px] font-bold text-white mt-0.5 tracking-tight">Let&apos;s train, Jordan.</div>
                    </div>

                    {/* Streak banner — flame icon + day count */}
                    <div className="flex items-center gap-2.5 mb-4 p-3 rounded-xl bg-[#0C1220] border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-[#F97316]/15 flex items-center justify-center">
                        {/* Lucide flame */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-white">12 day streak</div>
                        <div className="text-[10px] text-white/40">Longest: 28 days</div>
                      </div>
                    </div>

                    {/* Today's Workout CTA — emerald primary */}
                    <div className="rounded-xl p-3.5 mb-4 bg-gradient-to-br from-[#10B981]/12 to-[#10B981]/4 border border-[#10B981]/25">
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#10B981] font-bold">Today&apos;s Workout</div>
                      <div className="text-[15px] font-bold text-white mt-1">Upper Body Strength</div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/50">
                        <span>4 exercises</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span>45 min</span>
                      </div>
                      <button className="w-full mt-3 py-2 rounded-lg bg-[#10B981] text-white text-[11px] font-semibold hover:bg-[#0EA371] transition-colors">
                        Start Workout
                      </button>
                    </div>

                    {/* Today's Nutrition — 4 mini macro rings */}
                    <div className="rounded-xl p-3 mb-4 bg-[#0C1220] border border-white/5">
                      <div className="text-[9px] uppercase tracking-[0.18em] text-white/45 font-bold mb-2.5">Today&apos;s Nutrition</div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 1420, max: 2000, label: 'Cal',    color: '#10B981' },
                          { value: 98,   max: 150,  label: 'Protein',color: '#3B82F6' },
                          { value: 162,  max: 250,  label: 'Carbs',  color: '#F97316' },
                          { value: 41,   max: 65,   label: 'Fat',    color: '#8B5CF6' },
                        ].map((m) => {
                          const r = 14;
                          const c = 2 * Math.PI * r;
                          const pct = Math.min(m.value / m.max, 1);
                          return (
                            <div key={m.label} className="flex flex-col items-center gap-1">
                              <div className="relative w-9 h-9">
                                <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
                                  <circle cx="18" cy="18" r={r} fill="none" stroke="#1E293B" strokeWidth="3" />
                                  <circle cx="18" cy="18" r={r} fill="none" stroke={m.color} strokeWidth="3"
                                    strokeDasharray={c} strokeDashoffset={c - pct * c} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white tabular-nums">
                                  {m.value}
                                </div>
                              </div>
                              <span className="text-[8px] text-white/50 font-medium">{m.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Insight card */}
                    <div className="rounded-xl p-3 mb-4 bg-[#10B981]/8 border border-[#10B981]/20">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider bg-[#10B981] text-[#0A0F1E]">AI</span>
                        <span className="text-[9px] uppercase tracking-[0.18em] text-[#10B981] font-bold">AI Insight</span>
                      </div>
                      <p className="text-[10px] leading-snug text-white/75">
                        Protein 15% below target. A post-workout shake closes the gap.
                      </p>
                    </div>

                    {/* Quick Actions row — Scan Food / Start Workout / Progress */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'Scan Food', sub: 'Snap a meal',   color: '#10B981',
                          icon: <><rect x="3" y="6" width="18" height="13" rx="2.5"/><circle cx="12" cy="12.5" r="3.2"/><path d="M8 6l1.5-2h5L16 6"/></> },
                        { label: 'Workout',   sub: "Today's plan",  color: '#3B82F6',
                          icon: <><line x1="6.5" y1="12" x2="17.5" y2="12"/><rect x="2" y="8" width="2.5" height="8" rx="0.5"/><rect x="5" y="6.5" width="2" height="11" rx="0.5"/><rect x="17" y="6.5" width="2" height="11" rx="0.5"/><rect x="19.5" y="8" width="2.5" height="8" rx="0.5"/></> },
                        { label: 'Progress',  sub: 'Weekly stats',  color: '#8B5CF6',
                          icon: <><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></> },
                      ].map((a) => (
                        <div key={a.label} className="rounded-lg p-2.5 bg-[#0C1220] border border-white/5">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center mb-1.5"
                            style={{ backgroundColor: `${a.color}20` }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              {a.icon}
                            </svg>
                          </div>
                          <div className="text-[9px] font-bold text-white leading-tight">{a.label}</div>
                          <div className="text-[8px] text-white/40 leading-tight">{a.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Device toggle — switches frame chrome above */}
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
                  {(['ios', 'android'] as const).map((d) => {
                    const active = device === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setDevice(d)}
                        aria-pressed={active}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide transition-all ${
                          active
                            ? 'bg-[#10B981] text-[#0A0F1E] shadow-md shadow-[#10B981]/20'
                            : 'text-white/55 hover:text-white/85'
                        }`}
                      >
                        {d === 'ios' ? (
                          /* Apple logo */
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
                          </svg>
                        ) : (
                          /* Android robot */
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 00-.83.22l-1.88 3.24a11.43 11.43 0 00-8.94 0L5.65 5.67a.643.643 0 00-.87-.2.633.633 0 00-.22.85L6.4 9.48A10.78 10.78 0 001 18h22a10.78 10.78 0 00-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/>
                          </svg>
                        )}
                        {d === 'ios' ? 'iOS' : 'Android'}
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] text-white/30 font-mono">ino.fit/app</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg bg-[#3A86FF]/10 border border-[#3A86FF]/30 backdrop-blur text-sm text-[#3A86FF] font-mono animate-in fade-in">
          {toast}
        </div>
      )}

      {/* CTA footer — glowing attention button */}
      <div className="border-t border-white/5 py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A86FF]/[0.08] to-transparent pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B4D8]/10 border border-[#00B4D8]/20 text-[10px] text-[#00B4D8] font-bold uppercase tracking-[0.2em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse" />
            Limited-time launch pricing
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
            Ready to <span className="text-gradient">scale without burning out</span>?
          </h3>
          <p className="text-sm text-white/45 mb-8 max-w-md mx-auto">
            You just saw it work. Start your 14-day free trial — no credit card, cancel anytime.
          </p>
          <Link
            href="/#pricing"
            className="cta-glow inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-[#3A86FF] text-white font-bold text-base hover:bg-[#5196FF] transition-all"
          >
            Start Your Free Trial
            <IconArrow className="w-5 h-5" />
          </Link>
          <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-white/30 font-medium">
            <span className="flex items-center gap-1.5"><IconCheck className="w-3 h-3 text-[#00B4D8]" /> 14-day free</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5"><IconCheck className="w-3 h-3 text-[#00B4D8]" /> No credit card</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5"><IconCheck className="w-3 h-3 text-[#00B4D8]" /> Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
