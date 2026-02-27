import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Persistent Storage Helpers ───
const store = {
  async get(key, shared = false) {
    try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, value, shared = false) {
    try { await window.storage.set(key, JSON.stringify(value), shared); return true; }
    catch { return false; }
  },
  async list(prefix, shared = false) {
    try { const r = await window.storage.list(prefix, shared); return r?.keys || []; }
    catch { return []; }
  },
  async delete(key, shared = false) {
    try { await window.storage.delete(key, shared); return true; }
    catch { return false; }
  }
};

// ─── Theme System ───
const themes = {
  obsidian: {
    name: 'Obsidian', bg: '#08080c', bgCard: '#111118', bgCard2: '#18182240', bgInput: '#1c1c28',
    text: '#eeeef0', textSec: '#8e8ea0', textMuted: '#55556a', textDim: '#33334a',
    accent: '#6d5cff', accentSoft: 'rgba(109,92,255,0.12)', accentGlow: 'rgba(109,92,255,0.25)',
    success: '#2dd4a0', successSoft: 'rgba(45,212,160,0.12)',
    warn: '#ffb547', warnSoft: 'rgba(255,181,71,0.12)',
    danger: '#ff5c6a', dangerSoft: 'rgba(255,92,106,0.12)',
    border: '#222238', gradient: 'linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)',
  },
  arctic: {
    name: 'Arctic', bg: '#f4f7fb', bgCard: '#ffffff', bgCard2: '#f0f4f8', bgInput: '#e8ecf2',
    text: '#0f1729', textSec: '#4a5568', textMuted: '#8896a8', textDim: '#b4c0cc',
    accent: '#2563eb', accentSoft: 'rgba(37,99,235,0.08)', accentGlow: 'rgba(37,99,235,0.18)',
    success: '#059669', successSoft: 'rgba(5,150,105,0.08)',
    warn: '#d97706', warnSoft: 'rgba(217,119,6,0.08)',
    danger: '#dc2626', dangerSoft: 'rgba(220,38,38,0.08)',
    border: '#e2e8f0', gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  },
  ember: {
    name: 'Ember', bg: '#0c0806', bgCard: '#161210', bgCard2: '#1e1814', bgInput: '#241e18',
    text: '#f5ebe0', textSec: '#bfa68a', textMuted: '#7a6550', textDim: '#4a3d30',
    accent: '#ff6b35', accentSoft: 'rgba(255,107,53,0.12)', accentGlow: 'rgba(255,107,53,0.25)',
    success: '#4ade80', successSoft: 'rgba(74,222,128,0.12)',
    warn: '#fbbf24', warnSoft: 'rgba(251,191,36,0.12)',
    danger: '#f87171', dangerSoft: 'rgba(248,113,113,0.12)',
    border: '#2a221a', gradient: 'linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%)',
  },
  sakura: {
    name: 'Sakura', bg: '#fef7f9', bgCard: '#ffffff', bgCard2: '#fff0f3', bgInput: '#fce7ed',
    text: '#3d0c1c', textSec: '#7a2e4a', textMuted: '#c07090', textDim: '#e8b0c4',
    accent: '#e8447a', accentSoft: 'rgba(232,68,122,0.1)', accentGlow: 'rgba(232,68,122,0.2)',
    success: '#10b981', successSoft: 'rgba(16,185,129,0.1)',
    warn: '#f59e0b', warnSoft: 'rgba(245,158,11,0.1)',
    danger: '#ef4444', dangerSoft: 'rgba(239,68,68,0.1)',
    border: '#fad0dc', gradient: 'linear-gradient(135deg, #e8447a 0%, #f472b6 100%)',
  },
};

// ─── SVG Icons ───
const I = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  dumbbell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M3 10v4M21 10v4M5 8v8M19 8v8M7 6v12M17 6v12"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  msg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  play: <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>,
  pause: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  flame: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  right: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>,
  camera: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  zap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
  moon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  droplet: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  send: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>,
  target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  link: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  swap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  weight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a7.5 7.5 0 0 0-2 3.5L3 21h18l-1.5-9.5A7.5 7.5 0 0 0 17.5 8"/></svg>,
  pulse: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
};

const Icon = ({ name, size = 20, color = 'currentColor' }) => (
  <div style={{ width: size, height: size, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    {I[name] || null}
  </div>
);

// ─── CSS Injection ───
const injectCSS = () => {
  if (document.getElementById('ino-css')) return;
  const style = document.createElement('style');
  style.id = 'ino-css';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    ::-webkit-scrollbar { width: 0; height: 0; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(109,92,255,0.15); } 50% { box-shadow: 0 0 30px rgba(109,92,255,0.3); } }
    @keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    .anim-fade { animation: fadeUp 0.4s ease both; }
    .anim-slide { animation: slideIn 0.35s ease both; }
    .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .hover-lift:hover { transform: translateY(-2px); }
    .hover-lift:active { transform: translateY(0); }
    input, textarea { font-family: 'DM Sans', sans-serif; }
  `;
  document.head.appendChild(style);
};

// ─── Date Helpers ───
const today = () => new Date().toISOString().slice(0, 10);
const dayLabel = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
const timeNow = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// ─── MAIN APP ───
export default function INOFitness() {
  useEffect(() => { injectCSS(); }, []);

  const [themeKey, setThemeKey] = useState('obsidian');
  const [tab, setTab] = useState('today');
  const [screen, setScreen] = useState('main');
  const [showThemes, setShowThemes] = useState(false);
  const [loading, setLoading] = useState(true);

  // Workout state
  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [exIdx, setExIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [doneSets, setDoneSets] = useState({});
  const [setLogs, setSetLogs] = useState({}); // { "0-0": { weight: 135, reps: 8 } }

  // Data state (synced to storage)
  const [profile, setProfile] = useState({
    name: 'Alex', coachCode: '', coachConnected: false,
    coachName: 'Coach Sarah', bodyWeight: 175,
  });
  const [habits, setHabits] = useState({ water: 5, protein: 120, steps: 6500, sleep: 7 });
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [prs, setPrs] = useState([
    { exercise: 'Squat', weight: 245, reps: 5, date: today() },
    { exercise: 'Deadlift', weight: 335, reps: 3, date: '2026-02-10' },
    { exercise: 'Bench Press', weight: 205, reps: 5, date: '2026-02-05' },
  ]);
  const [muscleHits, setMuscleHits] = useState({
    chest: 0, frontDelts: 0, biceps: 0, forearms: 0, abs: 0,
    obliques: 0, quads: 0, calves: 0, traps: 0, rearDelts: 0,
    triceps: 0, lats: 0, lowerBack: 0, glutes: 0, hamstrings: 0, neck: 0,
  });
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [activeWorkoutKey, setActiveWorkoutKey] = useState('push'); // 'push' | 'pull' | 'legs'

  // Coach dashboard state
  const [coachAthletes, setCoachAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const t = themes[themeKey];

  // Muscle label map (display + anatomical for realism)
  const muscleLabels = {
    chest: 'Chest', frontDelts: 'Front Delts', biceps: 'Biceps', forearms: 'Forearms',
    abs: 'Abs', obliques: 'Obliques', quads: 'Quads', calves: 'Calves',
    traps: 'Traps', rearDelts: 'Rear Delts', triceps: 'Triceps', lats: 'Lats',
    lowerBack: 'Lower Back', glutes: 'Glutes', hamstrings: 'Hamstrings', neck: 'Neck',
  };
  const muscleSubtitle = {
    chest: 'Pectoralis major', frontDelts: 'Anterior deltoid', biceps: 'Biceps brachii', forearms: 'Brachioradialis, flexors',
    abs: 'Rectus abdominis', obliques: 'External obliques', quads: 'Quadriceps femoris', calves: 'Gastrocnemius, soleus',
    traps: 'Trapezius', rearDelts: 'Posterior deltoid', triceps: 'Triceps brachii', lats: 'Latissimus dorsi',
    lowerBack: 'Erector spinae', glutes: 'Gluteus maximus', hamstrings: 'Biceps femoris, semitendinosus', neck: 'Sternocleidomastoid',
  };

  // Realistic workout templates: Push / Pull / Legs with correct primary + secondary muscles
  const WORKOUT_TEMPLATES = {
    push: {
      name: 'Push Day',
      description: 'Chest, shoulders, triceps',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', muscle: 'Chest', muscles: ['chest','frontDelts','triceps'], targetWeight: 185 },
        { name: 'Overhead Press', sets: 3, reps: '8-10', muscle: 'Shoulders', muscles: ['frontDelts','triceps','upperChest'], targetWeight: 95 },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', muscle: 'Upper Chest', muscles: ['chest','frontDelts','triceps'], targetWeight: 55 },
        { name: 'Cable Tricep Pushdown', sets: 3, reps: '10-12', muscle: 'Triceps', muscles: ['triceps','forearms'], targetWeight: 40 },
        { name: 'Lateral Raise', sets: 3, reps: '12-15', muscle: 'Side Delts', muscles: ['frontDelts'], targetWeight: 15 },
      ],
    },
    pull: {
      name: 'Pull Day',
      description: 'Back, biceps, rear delts',
      exercises: [
        { name: 'Barbell Row', sets: 4, reps: '6-8', muscle: 'Back', muscles: ['lats','traps','rearDelts','biceps','lowerBack'], targetWeight: 135 },
        { name: 'Lat Pulldown', sets: 3, reps: '8-10', muscle: 'Lats', muscles: ['lats','biceps','forearms'], targetWeight: 100 },
        { name: 'Face Pull', sets: 3, reps: '12-15', muscle: 'Rear Delts', muscles: ['rearDelts','traps'], targetWeight: 30 },
        { name: 'Barbell Curl', sets: 3, reps: '8-10', muscle: 'Biceps', muscles: ['biceps','forearms'], targetWeight: 65 },
        { name: 'Hammer Curl', sets: 2, reps: '10-12', muscle: 'Forearms', muscles: ['forearms','biceps'], targetWeight: 25 },
      ],
    },
    legs: {
      name: 'Leg Day',
      description: 'Quads, hamstrings, glutes, calves',
      exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: '6-8', muscle: 'Quads', muscles: ['quads','glutes','lowerBack','abs'], targetWeight: 225 },
        { name: 'Romanian Deadlift', sets: 3, reps: '8-10', muscle: 'Hamstrings', muscles: ['hamstrings','glutes','lowerBack'], targetWeight: 185 },
        { name: 'Leg Press', sets: 3, reps: '10-12', muscle: 'Quads', muscles: ['quads','glutes','calves'], targetWeight: 360 },
        { name: 'Leg Curl', sets: 3, reps: '10-12', muscle: 'Hamstrings', muscles: ['hamstrings'], targetWeight: 95 },
        { name: 'Calf Raises', sets: 4, reps: '12-15', muscle: 'Calves', muscles: ['calves'], targetWeight: 135 },
      ],
    },
  };
  // Normalize: "upperChest" not in muscleHits — map to chest
  const normalizeMuscle = (m) => (m === 'upperChest' ? 'chest' : m);
  const activeTemplate = WORKOUT_TEMPLATES[activeWorkoutKey];
  const exercises = activeTemplate ? activeTemplate.exercises.map(ex => ({
    ...ex,
    muscles: (ex.muscles || []).map(normalizeMuscle).filter(m => muscleLabels[m]),
  })) : WORKOUT_TEMPLATES.legs.exercises;

  // ─── Persistence & Sync ───
  const syncToStorage = useCallback(async (data) => {
    const payload = {
      profile: data?.profile || profile,
      habits: data?.habits || habits,
      workoutHistory: data?.workoutHistory || workoutHistory,
      prs: data?.prs || prs,
      messages: data?.messages || messages,
      muscleHits: data?.muscleHits || muscleHits,
      lastSync: new Date().toISOString(),
    };
    await store.set('ino-athlete-data', payload, false);
    if ((data?.profile || profile).coachConnected) {
      await store.set(`ino-shared:${(data?.profile || profile).name}`, payload, true);
    }
  }, [profile, habits, workoutHistory, prs, messages, muscleHits]);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const data = await store.get('ino-athlete-data', false);
      if (data) {
        if (data.profile) setProfile(data.profile);
        if (data.habits) setHabits(data.habits);
        if (data.workoutHistory) setWorkoutHistory(data.workoutHistory);
        if (data.prs) setPrs(data.prs);
        if (data.messages) setMessages(data.messages);
        if (data.muscleHits) setMuscleHits(data.muscleHits);
      }
      // Load coach athletes from shared storage
      const sharedKeys = await store.list('ino-shared:', true);
      const athletes = [];
      for (const key of sharedKeys) {
        const ad = await store.get(key, true);
        if (ad) athletes.push({ key: key.replace('ino-shared:', ''), ...ad });
      }
      setCoachAthletes(athletes);
      setLoading(false);
    })();
  }, []);

  // Auto-save on data changes
  useEffect(() => {
    if (!loading) syncToStorage();
  }, [profile, habits, workoutHistory, prs, messages, muscleHits, loading]);

  // Workout timer
  useEffect(() => {
    if (!workoutActive || paused) return;
    const i = setInterval(() => setWorkoutTime(t => t + 1), 1000);
    return () => clearInterval(i);
  }, [workoutActive, paused]);

  // Rest timer
  useEffect(() => {
    if (restTimer <= 0) return;
    const i = setInterval(() => setRestTimer(t => t <= 1 ? 0 : t - 1), 1000);
    return () => clearInterval(i);
  }, [restTimer]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const startWorkout = () => {
    setWorkoutActive(true); setScreen('workout'); setWorkoutTime(0);
    setExIdx(0); setSetIdx(0); setDoneSets({}); setSetLogs({});
  };

  const completeSet = () => {
    const key = `${exIdx}-${setIdx}`;
    setDoneSets(prev => ({ ...prev, [key]: true }));
    setRestTimer(90);
    if (setIdx < exercises[exIdx].sets - 1) setSetIdx(setIdx + 1);
    else if (exIdx < exercises.length - 1) { setExIdx(exIdx + 1); setSetIdx(0); }
  };

  const finishWorkout = () => {
    const workoutName = activeTemplate ? activeTemplate.name : 'Workout';
    const log = {
      date: today(), time: timeNow(), duration: workoutTime,
      name: workoutName, exercises: exercises.map((ex, ei) => ({
        ...ex, sets: Array(ex.sets).fill(0).map((_, si) => ({
          completed: !!doneSets[`${ei}-${si}`],
          ...(setLogs[`${ei}-${si}`] || { weight: ex.targetWeight, reps: parseInt(ex.reps) || 8 }),
        })),
      })),
      totalSets: Object.keys(doneSets).length,
      totalVolume: Object.entries(setLogs).reduce((sum, [, v]) => sum + (v.weight || 0) * (v.reps || 0), 0),
    };
    setWorkoutHistory(prev => [log, ...prev]);
    // Accumulate muscle hits from completed exercises
    const newHits = { ...muscleHits };
    exercises.forEach((ex, ei) => {
      const exCompleted = Array(ex.sets).fill(0).some((_, si) => doneSets[`${ei}-${si}`]);
      if (exCompleted && ex.muscles) {
        ex.muscles.forEach(m => {
          const key = normalizeMuscle(m);
          if (null != muscleLabels[key]) newHits[key] = (newHits[key] || 0) + 1;
        });
      }
    });
    setMuscleHits(newHits);
    setWorkoutActive(false); setScreen('main'); setPaused(false);
  };

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    const msg = { from: 'athlete', text: newMsg.trim(), time: timeNow(), date: today() };
    setMessages(prev => [...prev, msg]);
    setNewMsg('');
    // Simulate coach auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'coach', text: getCoachReply(msg.text), time: timeNow(), date: today(),
      }]);
    }, 1500);
  };

  const getCoachReply = (msg) => {
    const replies = [
      "Great work! Keep pushing those limits.",
      "I can see your progress in real-time — looking solid!",
      "Remember to focus on form over weight. Quality reps matter.",
      "Your consistency is paying off. Let's talk about next week's plan.",
      "Nice! Let's bump up your squat target next session.",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const connectCoach = (code) => {
    setProfile(prev => ({ ...prev, coachCode: code, coachConnected: true }));
  };

  const refreshCoachData = async () => {
    const sharedKeys = await store.list('ino-shared:', true);
    const athletes = [];
    for (const key of sharedKeys) {
      const ad = await store.get(key, true);
      if (ad) athletes.push({ key: key.replace('ino-shared:', ''), ...ad });
    }
    setCoachAthletes(athletes);
  };

  // ─── STYLES ───
  const S = {
    app: {
      width: '100%', maxWidth: 420, margin: '0 auto',
      background: t.bg, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif",
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    },
    card: {
      background: t.bgCard, borderRadius: 16, padding: 18,
      border: `1px solid ${t.border}`, marginBottom: 14,
    },
    btn: (bg = t.accent, color = '#fff') => ({
      padding: '12px 20px', borderRadius: 12, background: bg, border: 'none',
      color, fontSize: 14, fontWeight: 600, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      transition: 'all 0.15s ease',
    }),
    tag: (bg, color) => ({
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 20, background: bg,
      color, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
    }),
    input: {
      width: '100%', padding: '12px 14px', borderRadius: 10,
      background: t.bgInput, border: `1px solid ${t.border}`,
      color: t.text, fontSize: 14, outline: 'none',
    },
  };

  // ─── HEADER BAR ───
  const Header = ({ title, subtitle }) => (
    <div style={{ padding: '14px 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="anim-fade">
      <div>
        {subtitle && <div style={{ color: t.textMuted, fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em' }}>{subtitle}</div>}
        <div style={{ color: t.text, fontSize: 22, fontWeight: 700, marginTop: 2, letterSpacing: '-0.02em' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setShowThemes(true)} style={{
          width: 38, height: 38, borderRadius: 12, background: t.bgCard, border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSec,
        }}>
          <Icon name="moon" size={16} />
        </button>
        <div style={{ position: 'relative' }}>
          <button style={{
            width: 38, height: 38, borderRadius: 12, background: t.bgCard, border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: t.textSec,
          }}>
            <Icon name="bell" size={16} />
          </button>
          <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, background: t.danger }} />
        </div>
      </div>
    </div>
  );

  // ─── TAB BAR ───
  const TabBar = () => (
    <div style={{
      display: 'flex', justifyContent: 'space-around', padding: '10px 0 22px',
      background: t.bg, borderTop: `1px solid ${t.border}`,
      backdropFilter: 'blur(20px)',
    }}>
      {[
        { id: 'today', icon: 'home', label: 'Today' },
        { id: 'train', icon: 'dumbbell', label: 'Train' },
        { id: 'recover', icon: 'heart', label: 'Recover' },
        { id: 'progress', icon: 'chart', label: 'Progress' },
        { id: 'coach', icon: 'msg', label: 'Coach' },
      ].map(tb => (
        <button key={tb.id} onClick={() => { setTab(tb.id); setScreen('main'); }}
          style={{
            background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, cursor: 'pointer', padding: '4px 14px',
            color: tab === tb.id ? t.accent : t.textMuted, transition: 'color 0.2s',
          }}>
          <Icon name={tb.icon} size={20} />
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.03em' }}>{tb.label}</span>
          {tab === tb.id && <div style={{ width: 4, height: 4, borderRadius: 2, background: t.accent, marginTop: 1 }} />}
        </button>
      ))}
    </div>
  );

  // ─── COACH LIVE INDICATOR ───
  const LiveBadge = () => (
    <div style={S.tag(t.successSoft, t.success)}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: t.success, animation: 'pulse 2s infinite' }} />
      LIVE
    </div>
  );

  // ═══════════════════════════════════
  // ATHLETE SCREENS
  // ═══════════════════════════════════

  const TodayScreen = () => (
    <div style={{ padding: '0 18px 18px' }}>
      {/* Coach Connection Status */}
      {profile.coachConnected && (
        <div style={{ ...S.card, background: t.accentSoft, borderColor: t.accent + '30', display: 'flex', alignItems: 'center', gap: 12 }} className="anim-fade">
          <div style={{ width: 40, height: 40, borderRadius: 12, background: t.accentGlow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="link" size={18} color={t.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>Connected to {profile.coachName}</div>
            <div style={{ color: t.textSec, fontSize: 11 }}>Your coach can see your data in real-time</div>
          </div>
          <LiveBadge />
        </div>
      )}

      {/* Readiness Score */}
      <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }} className="anim-fade hover-lift">
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, background: t.accentSoft, filter: 'blur(40px)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div>
            <div style={{ color: t.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>READINESS</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ color: t.text, fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>78</span>
              <span style={S.tag(t.successSoft, t.success)}>GOOD</span>
            </div>
          </div>
          <div style={{
            width: 72, height: 72, borderRadius: 36, position: 'relative',
            background: `conic-gradient(${t.success} 78%, ${t.bgInput} 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28, background: t.bgCard,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="check" size={24} color={t.success} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[
            { label: 'Sleep', value: '7.5h', color: t.accent },
            { label: 'HRV', value: '62ms', color: t.success },
            { label: 'Strain', value: 'Low', color: t.warn },
            { label: 'Stress', value: '2/10', color: t.success },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, background: t.bgInput }}>
              <div style={{ color: t.textMuted, fontSize: 10, fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ color: m.color, fontSize: 15, fontWeight: 700, marginTop: 2 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Workout CTA */}
      <div style={{
        ...S.card, cursor: 'pointer', position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${t.accent}18, ${t.accent}05)`,
        borderColor: t.accent + '25',
      }} onClick={startWorkout} className="anim-fade hover-lift">
        <div style={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: 50, background: t.accentGlow, filter: 'blur(30px)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ ...S.tag(t.accentSoft, t.accent), marginBottom: 8 }}>
              <Icon name="zap" size={10} /> TODAY
            </div>
            <div style={{ color: t.text, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Lower Body Power</div>
            <div style={{ color: t.textSec, fontSize: 13, marginTop: 6, display: 'flex', gap: 12 }}>
              <span>5 exercises</span><span>·</span><span>~45 min</span><span>·</span><span>~320 cal</span>
            </div>
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: t.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px ${t.accentGlow}`,
          }}>
            <Icon name="play" size={18} color="#fff" />
          </div>
        </div>
      </div>

      {/* Habits */}
      <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>Daily Habits</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { icon: 'droplet', label: 'Water', key: 'water', value: habits.water, target: 8, unit: ' glasses', color: '#3b82f6' },
          { icon: 'zap', label: 'Protein', key: 'protein', value: habits.protein, target: 180, unit: 'g', color: '#f59e0b' },
          { icon: 'flame', label: 'Steps', key: 'steps', value: habits.steps, target: 10000, unit: '', color: '#22c55e' },
          { icon: 'moon', label: 'Sleep', key: 'sleep', value: habits.sleep, target: 8, unit: ' hrs', color: '#8b5cf6' },
        ].map((h, i) => (
          <div key={i} style={{ ...S.card, marginBottom: 0, padding: 14, cursor: 'pointer' }}
            className="anim-fade hover-lift"
            onClick={() => {
              const inc = h.key === 'steps' ? 500 : h.key === 'protein' ? 10 : 1;
              setHabits(prev => ({ ...prev, [h.key]: Math.min(prev[h.key] + inc, h.target * 1.5) }));
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={h.icon} size={14} color={h.color} />
                <span style={{ color: t.textSec, fontSize: 12, fontWeight: 500 }}>{h.label}</span>
              </div>
              {h.value >= h.target && <Icon name="check" size={12} color={t.success} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ color: t.text, fontSize: 20, fontWeight: 700 }}>{h.value.toLocaleString()}</span>
              <span style={{ color: t.textMuted, fontSize: 11 }}>/ {h.target.toLocaleString()}{h.unit}</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, marginTop: 8, background: t.bgInput, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2, background: h.color,
                width: `${Math.min(100, (h.value / h.target) * 100)}%`,
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── TRAIN SCREEN ───
  const TrainScreen = () => (
    <div style={{ padding: '0 18px 18px' }}>
      <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }} className="anim-fade">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, background: t.accentGlow, filter: 'blur(30px)' }} />
        <div style={{ ...S.tag(t.accentSoft, t.accent), marginBottom: 10 }}>
          <Icon name="zap" size={10} /> TODAY — PUSH / PULL / LEGS
        </div>
        {/* Workout type selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, background: t.bgInput, borderRadius: 12, padding: 4 }}>
          {['push', 'pull', 'legs'].map(key => (
            <button key={key} onClick={() => setActiveWorkoutKey(key)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeWorkoutKey === key ? t.accent : 'transparent',
                color: activeWorkoutKey === key ? '#fff' : t.textMuted,
                fontSize: 12, fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s',
              }}>
              {key}
            </button>
          ))}
        </div>
        <div style={{ color: t.text, fontSize: 22, fontWeight: 700, position: 'relative' }}>{activeTemplate ? activeTemplate.name : 'Workout'}</div>
        <div style={{ color: t.textMuted, fontSize: 13, marginTop: 2 }}>{activeTemplate ? activeTemplate.description : ''}</div>
        <div style={{ display: 'flex', gap: 16, margin: '14px 0', position: 'relative' }}>
          {[
            { icon: 'clock', value: '45–60 min' },
            { icon: 'dumbbell', value: `${exercises.length} exercises` },
            { icon: 'flame', value: '~300–400 cal' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name={m.icon} size={13} color={t.textMuted} />
              <span style={{ color: t.textSec, fontSize: 13 }}>{m.value}</span>
            </div>
          ))}
        </div>
        <button onClick={startWorkout} style={{ ...S.btn(t.gradient), width: '100%', position: 'relative' }}>
          <Icon name="play" size={16} /> Start Workout
        </button>
      </div>

      {/* Weekly Schedule */}
      <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>This Week</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
          const isToday = i === new Date().getDay() - 1;
          const done = i < (new Date().getDay() - 1);
          const rest = i === 3 || i === 6;
          return (
            <div key={i} style={{
              flex: 1, padding: '10px 4px', borderRadius: 10, textAlign: 'center',
              background: isToday ? t.accentSoft : t.bgCard,
              border: `1px solid ${isToday ? t.accent + '50' : t.border}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ color: isToday ? t.accent : t.textMuted, fontSize: 10, fontWeight: 600, marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>{d}</div>
              {done && !rest && <Icon name="check" size={14} color={t.success} />}
              {rest && <span style={{ color: t.textDim, fontSize: 9 }}>REST</span>}
              {isToday && <div style={{ width: 6, height: 6, borderRadius: 3, background: t.accent, margin: '0 auto' }} />}
              {!done && !rest && !isToday && <div style={{ width: 6, height: 6, borderRadius: 3, background: t.bgInput, margin: '0 auto' }} />}
            </div>
          );
        })}
      </div>

      <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Exercises</div>
      {exercises.map((ex, i) => (
        <div key={i} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, padding: 14 }} className="anim-slide hover-lift">
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: t.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: t.accent, fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{i + 1}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
            <div style={{ color: t.textMuted, fontSize: 12 }}>{ex.sets} × {ex.reps} · {ex.muscle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: t.accent, fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{ex.targetWeight}</div>
            <div style={{ color: t.textDim, fontSize: 10 }}>lbs</div>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── WORKOUT SCREEN ───
  const WorkoutScreen = () => {
    const ex = exercises[exIdx];
    const totalSets = exercises.reduce((s, e) => s + e.sets, 0);
    const completedCount = Object.keys(doneSets).length;

    return (
      <div style={{ padding: '0 18px 18px', minHeight: '100%' }}>
        {/* Workout Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 16px' }}>
          <button onClick={() => { if (confirm('End workout?')) finishWorkout(); }} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer' }}>
            <Icon name="x" size={22} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: t.accent, fontSize: 32, fontWeight: 700, fontFamily: "'Space Mono', monospace", letterSpacing: '-0.02em' }}>
              {fmt(workoutTime)}
            </div>
            <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{completedCount}/{totalSets} sets done</div>
          </div>
          <button onClick={() => setPaused(!paused)} style={{
            width: 40, height: 40, borderRadius: 12,
            background: paused ? t.success : t.warn, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Icon name={paused ? 'play' : 'pause'} size={16} color="#fff" />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 3, borderRadius: 2, background: t.bgInput, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2, background: t.gradient,
            width: `${(completedCount / totalSets) * 100}%`, transition: 'width 0.5s ease',
          }} />
        </div>

        {/* Coach Live Watching */}
        {profile.coachConnected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 12px', borderRadius: 10, background: t.accentSoft }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: t.success, animation: 'pulse 2s infinite' }} />
            <span style={{ color: t.textSec, fontSize: 12 }}>{profile.coachName} is watching your workout live</span>
          </div>
        )}

        {/* Rest Timer */}
        {restTimer > 0 && (
          <div style={{ ...S.card, background: t.accentSoft, borderColor: t.accent + '25', textAlign: 'center' }}>
            <div style={{ color: t.accent, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>REST</div>
            <div style={{ color: t.text, fontSize: 48, fontWeight: 700, fontFamily: "'Space Mono', monospace", margin: '4px 0' }}>{fmt(restTimer)}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button onClick={() => setRestTimer(Math.max(0, restTimer - 15))} style={S.btn(t.bgInput, t.text)}>-15s</button>
              <button onClick={() => setRestTimer(restTimer + 15)} style={S.btn(t.bgInput, t.text)}>+15s</button>
              <button onClick={() => setRestTimer(0)} style={S.btn(t.accent)}>Skip</button>
            </div>
          </div>
        )}

        {/* Current Exercise */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ ...S.tag(t.accentSoft, t.accent), marginBottom: 6 }}>
                EXERCISE {exIdx + 1}/{exercises.length}
              </div>
              <div style={{ color: t.text, fontSize: 18, fontWeight: 700 }}>{ex.name}</div>
              <div style={{ color: t.textMuted, fontSize: 12, marginTop: 3 }}>{ex.muscle} · Target: {ex.targetWeight} lbs</div>
            </div>
          </div>

          {/* Weight/Rep Input for current set */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: t.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>WEIGHT (lbs)</div>
              <input
                type="number"
                value={setLogs[`${exIdx}-${setIdx}`]?.weight ?? ex.targetWeight}
                onChange={e => setSetLogs(prev => ({
                  ...prev, [`${exIdx}-${setIdx}`]: { ...prev[`${exIdx}-${setIdx}`], weight: Number(e.target.value), reps: prev[`${exIdx}-${setIdx}`]?.reps || parseInt(ex.reps) || 8 }
                }))}
                style={S.input}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: t.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>REPS</div>
              <input
                type="number"
                value={setLogs[`${exIdx}-${setIdx}`]?.reps ?? (parseInt(ex.reps) || 8)}
                onChange={e => setSetLogs(prev => ({
                  ...prev, [`${exIdx}-${setIdx}`]: { weight: prev[`${exIdx}-${setIdx}`]?.weight || ex.targetWeight, reps: Number(e.target.value) }
                }))}
                style={S.input}
              />
            </div>
          </div>

          {/* Set Indicators */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {Array(ex.sets).fill(0).map((_, i) => {
              const key = `${exIdx}-${i}`;
              const done = doneSets[key];
              const cur = i === setIdx && !done;
              return (
                <div key={i} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 10, textAlign: 'center',
                  background: done ? t.successSoft : cur ? t.accentSoft : t.bgInput,
                  border: `1px solid ${done ? t.success + '30' : cur ? t.accent + '30' : 'transparent'}`,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ color: done ? t.success : cur ? t.accent : t.textMuted, fontSize: 10, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
                    SET {i + 1}
                  </div>
                  {done ? <Icon name="check" size={16} color={t.success} />
                    : <div style={{ color: cur ? t.text : t.textDim, fontSize: 13, fontWeight: 600, marginTop: 2 }}>{ex.reps}</div>}
                </div>
              );
            })}
          </div>

          <button onClick={completeSet} style={{ ...S.btn(t.gradient), width: '100%' }}>
            <Icon name="check" size={16} /> Complete Set {setIdx + 1}
          </button>
        </div>

        {/* Up Next */}
        {exIdx < exercises.length - 1 && (
          <div>
            <div style={{ color: t.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Space Mono', monospace" }}>UP NEXT</div>
            <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12, padding: 14, opacity: 0.7 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bgInput, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="dumbbell" size={16} color={t.textMuted} />
              </div>
              <div>
                <div style={{ color: t.text, fontSize: 14, fontWeight: 500 }}>{exercises[exIdx + 1].name}</div>
                <div style={{ color: t.textMuted, fontSize: 12 }}>{exercises[exIdx + 1].sets} × {exercises[exIdx + 1].reps}</div>
              </div>
            </div>
          </div>
        )}

        {/* Finish Workout */}
        <button onClick={finishWorkout} style={{ ...S.btn(t.dangerSoft, t.danger), width: '100%', marginTop: 8 }}>
          Finish Workout
        </button>
      </div>
    );
  };

  // ─── RECOVER SCREEN ───
  const RecoverScreen = () => (
    <div style={{ padding: '0 18px 18px' }}>
      <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }} className="anim-fade">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, background: t.successSoft, filter: 'blur(30px)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div>
            <div style={{ color: t.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace" }}>RECOVERY</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <span style={{ color: t.text, fontSize: 52, fontWeight: 700, lineHeight: 1 }}>82</span>
              <span style={S.tag(t.successSoft, t.success)}>↑ 5%</span>
            </div>
          </div>
          <div style={{
            width: 72, height: 72, borderRadius: 36,
            background: `conic-gradient(${t.success} 82%, ${t.bgInput} 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28, background: t.bgCard,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.success, fontSize: 13, fontWeight: 700,
            }}>Good</div>
          </div>
        </div>
      </div>

      <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>HRV Trend</div>
      <div style={S.card} className="anim-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 }}>
          {[45, 52, 48, 55, 60, 58, 62].map((v, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 26, borderRadius: 6, height: v,
                background: i === 6 ? t.gradient : t.accentSoft,
                transition: 'height 0.5s ease',
              }} />
              <span style={{ color: t.textDim, fontSize: 10, fontFamily: "'Space Mono', monospace" }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
          <span style={{ color: t.textMuted, fontSize: 12 }}>Avg: 54ms</span>
          <span style={S.tag(t.successSoft, t.success)}>+8% this week</span>
        </div>
      </div>

      <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Recommended</div>
      {[
        { name: 'Hip Mobility Flow', time: '12 min', type: 'Mobility', icon: 'heart' },
        { name: 'Full Body Stretch', time: '15 min', type: 'Stretch', icon: 'zap' },
        { name: 'Box Breathing', time: '5 min', type: 'Breathing', icon: 'moon' },
      ].map((item, i) => (
        <div key={i} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, padding: 14 }} className="anim-slide hover-lift">
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: t.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={item.icon} size={18} color={t.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{item.name}</div>
            <div style={{ color: t.textMuted, fontSize: 12 }}>{item.time} · {item.type}</div>
          </div>
          <Icon name="right" size={16} color={t.textDim} />
        </div>
      ))}
    </div>
  );

  // ─── BODY DIAGRAM COMPONENT (anatomical style: grey/blue base + red highlight) ───
  const BODY_PALETTE = {
    base: '#b8bdc6',      // light grey-blue body
    stroke: '#8e95a2',    // outline
    muscleRest: '#a0a8b4', // untrained muscle
    muscleTrained: '#c62828', // red highlight (trained)
  };

  const BodyDiagram = () => {
    const [bodyView, setBodyView] = useState('front');
    const [viewMode, setViewMode] = useState('single'); // 'single' | 'grid'
    const maxHits = Math.max(1, ...Object.values(muscleHits));

    const intensity = (muscle) => Math.min(1, (muscleHits[muscle] || 0) / maxHits);
    const isTrained = (muscle) => (muscleHits[muscle] || 0) > 0;

    const handleTap = (muscle) => setSelectedMuscle(selectedMuscle === muscle ? null : muscle);

    // Anatomical style: untrained = grey-blue, trained = solid red (opacity by intensity)
    const heatColor = (muscle, baseOpacity = 1) => {
      const r = intensity(muscle);
      if (r === 0) return { fill: BODY_PALETTE.muscleRest, opacity: 0.85 * baseOpacity };
      return { fill: BODY_PALETTE.muscleTrained, opacity: Math.max(0.4, r) * baseOpacity };
    };

    const ms = (muscle, op = 1) => {
      const h = heatColor(muscle, op);
      const sel = selectedMuscle === muscle;
      return {
        fill: h.fill, opacity: h.opacity,
        stroke: sel ? '#1a1a1a' : BODY_PALETTE.stroke,
        strokeWidth: sel ? 1.8 : 0.5,
        cursor: 'pointer', transition: 'all 0.3s ease',
        filter: sel ? 'drop-shadow(0 0 6px rgba(198,40,40,0.5))' : 'none',
      };
    };
    // For grid view: one muscle highlighted in red (if trained), rest grey
    const pathStyle = (highlightOnly) => (m) => {
      if (undefined === highlightOnly) return ms(m);
      const trained = m === highlightOnly && isTrained(highlightOnly);
      return {
        fill: trained ? BODY_PALETTE.muscleTrained : BODY_PALETTE.muscleRest,
        opacity: trained ? 0.95 : 0.75,
        stroke: BODY_PALETTE.stroke,
        strokeWidth: 0.4,
        cursor: 'pointer',
      };
    };

    // ──────────────── FRONT VIEW SVG ────────────────
    const FrontBody = ({ highlightOnly } = {}) => {
      const ps = pathStyle(highlightOnly);
      return (
      <svg viewBox="0 0 440 880" style={{ width: '100%', maxWidth: 300, height: 'auto' }}>
        <defs>
          <linearGradient id="skinF" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={BODY_PALETTE.base}/>
            <stop offset="100%" stopColor="#a8aeb8"/>
          </linearGradient>
          <linearGradient id="skinStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BODY_PALETTE.stroke}/>
            <stop offset="100%" stopColor="#7a8190"/>
          </linearGradient>
        </defs>

        {/* ════ BODY SILHOUETTE (grey-blue base like reference) ════ */}
        <g fill="url(#skinF)" stroke={BODY_PALETTE.stroke} strokeWidth="0.8" strokeLinejoin="round">
          {/* Head */}
          <path d="M220,8 C247,8 268,32 268,62 C268,82 258,98 245,106 L240,110 C236,115 234,122 234,128 L206,128 C206,122 204,115 200,110 L195,106 C182,98 172,82 172,62 C172,32 193,8 220,8 Z"/>
          {/* Neck */}
          <path d="M200,118 C200,126 196,132 196,138 L196,156 C200,162 210,166 220,166 C230,166 240,162 244,156 L244,138 C244,132 240,126 240,118"/>
          {/* Torso */}
          <path d="M156,166 C140,170 118,186 108,206 L96,236 C88,260 86,288 86,316 L86,356 C86,380 90,404 94,420 L100,446 C104,460 112,470 126,476 L156,488 C180,496 200,500 220,500 C240,500 260,496 284,488 L314,476 C328,470 336,460 340,446 L346,420 C350,404 354,380 354,356 L354,316 C354,288 352,260 344,236 L332,206 C322,186 300,170 284,166"/>
          {/* Left arm */}
          <path d="M108,206 C94,214 80,234 72,258 L56,314 C48,344 42,374 40,400 L36,436 C34,460 36,478 40,492 L44,508 C48,522 54,532 60,536 L68,538 C74,536 78,530 80,522 L84,504 C88,484 88,462 86,440 L84,410 C82,382 84,354 88,326 L96,282 C100,262 106,242 112,226"/>
          {/* Right arm */}
          <path d="M332,206 C346,214 360,234 368,258 L384,314 C392,344 398,374 400,400 L404,436 C406,460 404,478 400,492 L396,508 C392,522 386,532 380,536 L372,538 C366,536 362,530 360,522 L356,504 C352,484 352,462 354,440 L356,410 C358,382 356,354 352,326 L344,282 C340,262 334,242 328,226"/>
          {/* Left hand */}
          <path d="M40,530 C34,534 28,542 26,552 L24,566 C24,576 28,584 36,588 L50,592 C58,592 66,586 68,578 L72,560 C74,548 72,538 68,530"/>
          {/* Right hand */}
          <path d="M400,530 C406,534 412,542 414,552 L416,566 C416,576 412,584 404,588 L390,592 C382,592 374,586 372,578 L368,560 C366,548 368,538 372,530"/>
          {/* Hips/pelvis */}
          <path d="M126,476 C114,488 108,508 108,528 L110,548 C114,564 124,574 140,580 L168,588 C192,594 210,596 220,596 C230,596 248,594 272,588 L300,580 C316,574 326,564 330,548 L332,528 C332,508 326,488 314,476"/>
          {/* Left leg */}
          <path d="M140,580 C128,592 118,618 112,648 L102,700 C96,740 92,776 90,808 L88,836 C88,850 92,858 100,862 L120,866 C130,866 138,860 140,852 L144,830 C148,800 150,768 152,736 L158,684 C162,650 164,622 168,600 L172,588"/>
          {/* Right leg */}
          <path d="M300,580 C312,592 322,618 328,648 L338,700 C344,740 348,776 350,808 L352,836 C352,850 348,858 340,862 L320,866 C310,866 302,860 300,852 L296,830 C292,800 290,768 288,736 L282,684 C278,650 276,622 272,600 L268,588"/>
          {/* Left foot */}
          <path d="M88,852 L82,864 C76,876 74,884 78,890 L92,896 C108,900 126,900 136,896 L142,890 C146,882 144,870 140,860"/>
          {/* Right foot */}
          <path d="M352,852 L358,864 C364,876 366,884 362,890 L348,896 C332,900 314,900 304,896 L298,890 C294,882 296,870 300,860"/>
        </g>

        {/* Navel */}
        <ellipse cx="220" cy="408" rx="5" ry="6" fill="none" stroke={BODY_PALETTE.stroke} strokeWidth="0.5" opacity="0.35"/>

        {/* ════ FRONT MUSCLES ════ */}

        {/* NECK — sternocleidomastoid */}
        <path d="M200,130 C198,138 196,148 198,158 C202,162 210,164 214,162 L210,148 C208,140 206,132 204,128 Z"
          style={ps('neck')} onClick={() => handleTap('neck')}/>
        <path d="M240,130 C242,138 244,148 242,158 C238,162 230,164 226,162 L230,148 C232,140 234,132 236,128 Z"
          style={ps('neck')} onClick={() => handleTap('neck')}/>

        {/* FRONT DELTS — anterior deltoid */}
        <path d="M156,172 C142,176 126,188 116,204 L110,218 C108,226 112,230 118,228 L130,218 C140,206 150,194 158,184 C162,178 160,172 156,170 Z"
          style={ps('frontDelts')} onClick={() => handleTap('frontDelts')}/>
        <path d="M284,172 C298,176 314,188 324,204 L330,218 C332,226 328,230 322,228 L310,218 C300,206 290,194 282,184 C278,178 280,172 284,170 Z"
          style={ps('frontDelts')} onClick={() => handleTap('frontDelts')}/>

        {/* CHEST — pectoralis major */}
        <path d="M160,186 C150,190 138,200 128,214 L120,230 C116,242 118,254 126,264 L140,274 C156,282 174,286 192,286 L210,284 C216,280 220,272 220,262 L220,240 C218,222 214,206 208,194 L200,186 C186,180 170,180 160,186 Z"
          style={ps('chest')} onClick={() => handleTap('chest')}/>
        <path d="M280,186 C290,190 302,200 312,214 L320,230 C324,242 322,254 314,264 L300,274 C284,282 266,286 248,286 L230,284 C224,280 220,272 220,262 L220,240 C222,222 226,206 232,194 L240,186 C254,180 270,180 280,186 Z"
          style={ps('chest')} onClick={() => handleTap('chest')}/>

        {/* BICEPS — biceps brachii */}
        <path d="M106,228 C96,238 88,256 82,278 L76,304 C74,320 76,332 82,340 L90,344 C96,342 100,334 102,322 L106,296 C110,274 112,252 114,238 L112,230 Z"
          style={ps('biceps')} onClick={() => handleTap('biceps')}/>
        <path d="M334,228 C344,238 352,256 358,278 L364,304 C366,320 364,332 358,340 L350,344 C344,342 340,334 338,322 L334,296 C330,274 328,252 326,238 L328,230 Z"
          style={ps('biceps')} onClick={() => handleTap('biceps')}/>

        {/* FOREARMS — brachioradialis + wrist flexors */}
        <path d="M82,344 C74,356 66,380 58,408 L50,440 C46,462 44,482 44,498 L46,510 C50,520 56,524 62,520 L68,510 C72,494 76,472 80,450 L88,412 C94,386 96,366 96,350 Z"
          style={ps('forearms')} onClick={() => handleTap('forearms')}/>
        <path d="M358,344 C366,356 374,380 382,408 L390,440 C394,462 396,482 396,498 L394,510 C390,520 384,524 378,520 L372,510 C368,494 364,472 360,450 L352,412 C346,386 344,366 344,350 Z"
          style={ps('forearms')} onClick={() => handleTap('forearms')}/>

        {/* ABS — rectus abdominis (8-pack) */}
        {/* Row 1 */}
        <path d="M198,286 C194,288 192,294 192,302 L192,318 C194,324 200,326 208,326 L216,324 C220,320 220,312 220,304 L220,292 C218,286 212,284 204,284 Z"
          style={ps('abs')} onClick={() => handleTap('abs')}/>
        <path d="M242,286 C246,288 248,294 248,302 L248,318 C246,324 240,326 232,326 L224,324 C220,320 220,312 220,304 L220,292 C222,286 228,284 236,284 Z"
          style={ps('abs')} onClick={() => handleTap('abs')}/>
        {/* Row 2 */}
        <path d="M196,332 C192,334 190,340 190,350 L190,366 C192,372 198,374 206,374 L216,372 C220,368 220,360 220,352 L220,338 C218,332 210,330 202,330 Z"
          style={ps('abs')} onClick={() => handleTap('abs')}/>
        <path d="M244,332 C248,334 250,340 250,350 L250,366 C248,372 242,374 234,374 L224,372 C220,368 220,360 220,352 L220,338 C222,332 230,330 238,330 Z"
          style={ps('abs')} onClick={() => handleTap('abs')}/>
        {/* Row 3 */}
        <path d="M194,380 C190,382 188,388 188,398 L188,414 C190,420 196,422 204,422 L216,420 C220,416 220,408 220,400 L220,386 C218,380 208,378 200,378 Z"
          style={ps('abs')} onClick={() => handleTap('abs')}/>
        <path d="M246,380 C250,382 252,388 252,398 L252,414 C250,420 244,422 236,422 L224,420 C220,416 220,408 220,400 L220,386 C222,380 232,378 240,378 Z"
          style={ps('abs')} onClick={() => handleTap('abs')}/>
        {/* Row 4 */}
        <path d="M192,428 C188,430 186,436 188,446 L190,460 C194,468 200,470 208,468 L218,464 C220,458 220,450 220,444 L220,434 C218,428 208,426 198,426 Z"
          style={ps('abs')} onClick={() => handleTap('abs')}/>
        <path d="M248,428 C252,430 254,436 252,446 L250,460 C246,468 240,470 232,468 L222,464 C220,458 220,450 220,444 L220,434 C222,428 232,426 242,426 Z"
          style={ps('abs')} onClick={() => handleTap('abs')}/>

        {/* Linea alba (center line) */}
        <line x1="220" y1="280" x2="220" y2="472" stroke={BODY_PALETTE.stroke} strokeWidth="0.6" opacity="0.25"/>

        {/* OBLIQUES — external obliques */}
        <path d="M126,268 C118,280 112,300 108,326 L104,360 C102,392 102,420 106,444 L112,462 C118,474 128,480 140,480 L154,476 C164,470 172,458 178,442 L184,418 C186,394 186,370 186,346 L184,316 C182,296 178,280 172,270 L162,264 C148,262 134,264 126,268 Z"
          style={ps('obliques')} onClick={() => handleTap('obliques')}/>
        <path d="M314,268 C322,280 328,300 332,326 L336,360 C338,392 338,420 334,444 L328,462 C322,474 312,480 300,480 L286,476 C276,470 268,458 262,442 L256,418 C254,394 254,370 254,346 L256,316 C258,296 262,280 268,270 L278,264 C292,262 306,264 314,268 Z"
          style={ps('obliques')} onClick={() => handleTap('obliques')}/>

        {/* QUADS — quadriceps femoris */}
        {/* Left quad - 3 visible heads */}
        {/* Vastus lateralis (outer sweep) */}
        <path d="M130,590 C120,610 112,644 106,684 L98,732 C94,764 92,792 92,814 L94,830 C98,840 106,844 114,840 L120,832 C122,816 124,794 126,768 L132,720 C136,680 140,648 146,620 L150,600 C148,590 140,586 134,588 Z"
          style={ps('quads')} onClick={() => handleTap('quads')}/>
        {/* Rectus femoris (center) */}
        <path d="M148,592 C142,608 138,636 134,672 L130,716 C128,748 126,776 126,800 L128,826 C132,838 140,842 148,840 L156,836 C160,824 162,804 162,780 L164,738 C166,700 166,664 168,634 L170,608 C168,596 160,590 152,590 Z"
          style={ps('quads')} onClick={() => handleTap('quads')}/>
        {/* Vastus medialis (inner teardrop) */}
        <path d="M166,610 C162,630 160,660 158,696 L156,738 C154,770 154,798 156,822 L160,840 C164,850 172,852 178,846 L182,834 C184,814 182,788 180,758 L176,710 C174,670 170,640 168,618 L166,606 Z"
          style={ps('quads')} onClick={() => handleTap('quads')}/>
        {/* Right quad */}
        <path d="M310,590 C320,610 328,644 334,684 L342,732 C346,764 348,792 348,814 L346,830 C342,840 334,844 326,840 L320,832 C318,816 316,794 314,768 L308,720 C304,680 300,648 294,620 L290,600 C292,590 300,586 306,588 Z"
          style={ps('quads')} onClick={() => handleTap('quads')}/>
        <path d="M292,592 C298,608 302,636 306,672 L310,716 C312,748 314,776 314,800 L312,826 C308,838 300,842 292,840 L284,836 C280,824 278,804 278,780 L276,738 C274,700 274,664 272,634 L270,608 C272,596 280,590 288,590 Z"
          style={ps('quads')} onClick={() => handleTap('quads')}/>
        <path d="M274,610 C278,630 280,660 282,696 L284,738 C286,770 286,798 284,822 L280,840 C276,850 268,852 262,846 L258,834 C256,814 258,788 260,758 L264,710 C266,670 270,640 272,618 L274,606 Z"
          style={ps('quads')} onClick={() => handleTap('quads')}/>

        {/* CALVES — tibialis anterior (front shin) + gastrocnemius peek */}
        <path d="M100,842 C96,852 92,868 92,884 L96,890 C102,892 112,892 118,888 L122,878 C124,866 122,854 118,844 L114,840 Z"
          style={ps('calves')} onClick={() => !highlightOnly && handleTap('calves')}/>
        <path d="M340,842 C344,852 348,868 348,884 L344,890 C338,892 328,892 322,888 L318,878 C316,866 318,854 322,844 L326,840 Z"
          style={ps('calves')} onClick={() => !highlightOnly && handleTap('calves')}/>
      </svg>
      );
    };

    // ──────────────── BACK VIEW SVG ────────────────
    const BackBody = ({ highlightOnly } = {}) => {
      const ps = pathStyle(highlightOnly);
      return (
      <svg viewBox="0 0 440 880" style={{ width: '100%', maxWidth: 300, height: 'auto' }}>
        <defs>
          <linearGradient id="skinB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={BODY_PALETTE.base}/>
            <stop offset="100%" stopColor="#a8aeb8"/>
          </linearGradient>
        </defs>

        {/* ════ BODY SILHOUETTE (BACK) ════ */}
        <g fill="url(#skinB)" stroke={BODY_PALETTE.stroke} strokeWidth="0.8" strokeLinejoin="round">
          <path d="M220,8 C247,8 268,32 268,62 C268,82 258,98 245,106 L240,110 C236,115 234,122 234,128 L206,128 C206,122 204,115 200,110 L195,106 C182,98 172,82 172,62 C172,32 193,8 220,8 Z"/>
          <path d="M200,118 C200,126 196,132 196,138 L196,156 C200,162 210,166 220,166 C230,166 240,162 244,156 L244,138 C244,132 240,126 240,118"/>
          <path d="M156,166 C140,170 118,186 108,206 L96,236 C88,260 86,288 86,316 L86,356 C86,380 90,404 94,420 L100,446 C104,460 112,470 126,476 L156,488 C180,496 200,500 220,500 C240,500 260,496 284,488 L314,476 C328,470 336,460 340,446 L346,420 C350,404 354,380 354,356 L354,316 C354,288 352,260 344,236 L332,206 C322,186 300,170 284,166"/>
          <path d="M108,206 C94,214 80,234 72,258 L56,314 C48,344 42,374 40,400 L36,436 C34,460 36,478 40,492 L44,508 C48,522 54,532 60,536 L68,538 C74,536 78,530 80,522 L84,504 C88,484 88,462 86,440 L84,410 C82,382 84,354 88,326 L96,282 C100,262 106,242 112,226"/>
          <path d="M332,206 C346,214 360,234 368,258 L384,314 C392,344 398,374 400,400 L404,436 C406,460 404,478 400,492 L396,508 C392,522 386,532 380,536 L372,538 C366,536 362,530 360,522 L356,504 C352,484 352,462 354,440 L356,410 C358,382 356,354 352,326 L344,282 C340,262 334,242 328,226"/>
          <path d="M40,530 C34,534 28,542 26,552 L24,566 C24,576 28,584 36,588 L50,592 C58,592 66,586 68,578 L72,560 C74,548 72,538 68,530"/>
          <path d="M400,530 C406,534 412,542 414,552 L416,566 C416,576 412,584 404,588 L390,592 C382,592 374,586 372,578 L368,560 C366,548 368,538 372,530"/>
          <path d="M126,476 C114,488 108,508 108,528 L110,548 C114,564 124,574 140,580 L168,588 C192,594 210,596 220,596 C230,596 248,594 272,588 L300,580 C316,574 326,564 330,548 L332,528 C332,508 326,488 314,476"/>
          <path d="M140,580 C128,592 118,618 112,648 L102,700 C96,740 92,776 90,808 L88,836 C88,850 92,858 100,862 L120,866 C130,866 138,860 140,852 L144,830 C148,800 150,768 152,736 L158,684 C162,650 164,622 168,600 L172,588"/>
          <path d="M300,580 C312,592 322,618 328,648 L338,700 C344,740 348,776 350,808 L352,836 C352,850 348,858 340,862 L320,866 C310,866 302,860 300,852 L296,830 C292,800 290,768 288,736 L282,684 C278,650 276,622 272,600 L268,588"/>
          <path d="M88,852 L82,864 C76,876 74,884 78,890 L92,896 C108,900 126,900 136,896 L142,890 C146,882 144,870 140,860"/>
          <path d="M352,852 L358,864 C364,876 366,884 362,890 L348,896 C332,900 314,900 304,896 L298,890 C294,882 296,870 300,860"/>
        </g>

        {/* Spine line */}
        <path d="M220,130 C220,200 220,300 220,400 C220,440 220,470 220,500" stroke={BODY_PALETTE.stroke} strokeWidth="0.6" opacity="0.25" fill="none"/>

        {/* ════ BACK MUSCLES ════ */}

        {/* TRAPS — trapezius (upper, mid, lower) */}
        {/* Upper traps */}
        <path d="M204,132 C196,136 180,148 168,164 L154,178 C148,184 146,188 150,190 L162,186 C176,178 192,168 204,158 L212,150 C216,144 214,136 210,132 Z"
          style={ps('traps')} onClick={() => !highlightOnly && handleTap('traps')}/>
        <path d="M236,132 C244,136 260,148 272,164 L286,178 C292,184 294,188 290,190 L278,186 C264,178 248,168 236,158 L228,150 C224,144 226,136 230,132 Z"
          style={ps('traps')} onClick={() => !highlightOnly && handleTap('traps')}/>
        {/* Mid traps */}
        <path d="M152,190 C142,200 136,214 134,230 L132,248 C134,258 140,262 150,260 L168,252 C184,242 200,232 212,224 L220,218 C220,210 216,204 210,200 L196,194 C178,188 162,188 152,190 Z"
          style={ps('traps')} onClick={() => !highlightOnly && handleTap('traps')}/>
        <path d="M288,190 C298,200 304,214 306,230 L308,248 C306,258 300,262 290,260 L272,252 C256,242 240,232 228,224 L220,218 C220,210 224,204 230,200 L244,194 C262,188 278,188 288,190 Z"
          style={ps('traps')} onClick={() => !highlightOnly && handleTap('traps')}/>

        {/* REAR DELTS — posterior deltoid */}
        <path d="M150,178 C138,182 122,196 112,212 L106,226 C104,234 108,238 114,236 L128,226 C140,214 150,200 156,190 C158,186 156,180 152,178 Z"
          style={ps('rearDelts')} onClick={() => !highlightOnly && handleTap('rearDelts')}/>
        <path d="M290,178 C302,182 318,196 328,212 L334,226 C336,234 332,238 326,236 L312,226 C300,214 290,200 284,190 C282,186 284,180 288,178 Z"
          style={ps('rearDelts')} onClick={() => !highlightOnly && handleTap('rearDelts')}/>

        {/* TRICEPS — triceps brachii (horseshoe shape) */}
        <path d="M108,234 C98,248 90,270 84,296 L78,324 C76,344 78,358 84,366 L94,370 C102,366 106,354 108,338 L112,308 C116,282 118,260 120,244 L118,236 Z"
          style={ps('triceps')} onClick={() => !highlightOnly && handleTap('triceps')}/>
        <path d="M332,234 C342,248 350,270 356,296 L362,324 C364,344 362,358 356,366 L346,370 C338,366 334,354 332,338 L328,308 C324,282 322,260 320,244 L322,236 Z"
          style={ps('triceps')} onClick={() => !highlightOnly && handleTap('triceps')}/>

        {/* LATS — latissimus dorsi (V-taper) */}
        <path d="M152,204 C140,218 130,242 124,272 L118,310 C114,346 112,382 114,412 L118,436 C124,456 136,468 152,472 L172,476 C186,476 196,468 202,454 L208,428 C212,398 212,366 210,334 L206,296 C202,264 196,236 188,216 L178,202 C168,196 158,198 152,204 Z"
          style={ps('lats')} onClick={() => !highlightOnly && handleTap('lats')}/>
        <path d="M288,204 C300,218 310,242 316,272 L322,310 C326,346 328,382 326,412 L322,436 C316,456 304,468 288,472 L268,476 C254,476 244,468 238,454 L232,428 C228,398 228,366 230,334 L234,296 C238,264 244,236 252,216 L262,202 C272,196 282,198 288,204 Z"
          style={ps('lats')} onClick={() => !highlightOnly && handleTap('lats')}/>

        {/* LOWER BACK — erector spinae (two columns along spine) */}
        <path d="M204,280 C198,296 196,320 196,350 L196,390 C196,420 200,446 206,466 L212,480 C216,486 220,486 220,480 L220,380 C220,340 218,304 214,280 L210,274 C208,274 206,276 204,280 Z"
          style={ps('lowerBack')} onClick={() => !highlightOnly && handleTap('lowerBack')}/>
        <path d="M236,280 C242,296 244,320 244,350 L244,390 C244,420 240,446 234,466 L228,480 C224,486 220,486 220,480 L220,380 C220,340 222,304 226,280 L230,274 C232,274 234,276 236,280 Z"
          style={ps('lowerBack')} onClick={() => !highlightOnly && handleTap('lowerBack')}/>

        {/* GLUTES — gluteus maximus */}
        <path d="M136,496 C124,504 116,520 114,540 L114,558 C118,572 128,580 142,582 L164,584 C180,584 194,578 204,568 L212,554 C218,540 218,524 214,510 L208,500 C198,492 182,488 166,488 C152,488 142,492 136,496 Z"
          style={ps('glutes')} onClick={() => !highlightOnly && handleTap('glutes')}/>
        <path d="M304,496 C316,504 324,520 326,540 L326,558 C322,572 312,580 298,582 L276,584 C260,584 246,578 236,568 L228,554 C222,540 222,524 226,510 L232,500 C242,492 258,488 274,488 C288,488 298,492 304,496 Z"
          style={ps('glutes')} onClick={() => !highlightOnly && handleTap('glutes')}/>

        {/* HAMSTRINGS — biceps femoris + semitendinosus + semimembranosus */}
        {/* Left hamstring group */}
        <path d="M128,590 C118,608 110,640 104,680 L98,728 C94,764 92,796 92,820 L96,836 C100,844 108,846 116,842 L122,832 C124,812 126,788 130,760 L136,712 C140,672 144,638 150,610 L152,596 C148,590 138,586 130,588 Z"
          style={ps('hamstrings')} onClick={() => !highlightOnly && handleTap('hamstrings')}/>
        <path d="M152,596 C148,616 146,648 144,688 L142,732 C142,764 142,792 144,818 L148,838 C152,848 160,850 166,846 L170,834 C172,812 172,786 172,756 L170,708 C168,666 168,634 168,608 L166,596 C162,590 156,590 152,594 Z"
          style={ps('hamstrings')} onClick={() => !highlightOnly && handleTap('hamstrings')}/>
        {/* Right hamstring group */}
        <path d="M312,590 C322,608 330,640 336,680 L342,728 C346,764 348,796 348,820 L344,836 C340,844 332,846 324,842 L318,832 C316,812 314,788 310,760 L304,712 C300,672 296,638 290,610 L288,596 C292,590 302,586 310,588 Z"
          style={ps('hamstrings')} onClick={() => !highlightOnly && handleTap('hamstrings')}/>
        <path d="M288,596 C292,616 294,648 296,688 L298,732 C298,764 298,792 296,818 L292,838 C288,848 280,850 274,846 L270,834 C268,812 268,786 268,756 L270,708 C272,666 272,634 272,608 L274,596 C278,590 284,590 288,594 Z"
          style={ps('hamstrings')} onClick={() => !highlightOnly && handleTap('hamstrings')}/>

        {/* CALVES — gastrocnemius (two-headed diamond) */}
        <path d="M98,840 C92,852 88,870 88,890 L92,894 C100,896 112,896 120,892 L126,882 C128,870 126,856 122,846 Z"
          style={ps('calves')} onClick={() => !highlightOnly && handleTap('calves')}/>
        <path d="M118,844 C122,854 126,870 128,886 L126,892 C120,896 108,896 98,892 L94,884 C92,870 96,856 100,846 Z"
          style={ps('calves')} onClick={() => !highlightOnly && handleTap('calves')}/>
        <path d="M342,840 C348,852 352,870 352,890 L348,894 C340,896 328,896 320,892 L314,882 C312,870 314,856 318,846 Z"
          style={ps('calves')} onClick={() => !highlightOnly && handleTap('calves')}/>
        <path d="M322,844 C318,854 314,870 312,886 L314,892 C320,896 332,896 342,892 L346,884 C348,870 344,856 340,846 Z"
          style={ps('calves')} onClick={() => !highlightOnly && handleTap('calves')}/>
      </svg>
      );
    };

    return (
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }} className="anim-fade">
        {/* Header */}
        <div style={{ padding: '16px 18px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ color: t.text, fontSize: 15, fontWeight: 700 }}>Muscle Map</div>
            <div style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>Grey = body · Red = trained muscles</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ display: 'flex', background: t.bgInput, borderRadius: 10, padding: 3 }}>
              {['single', 'grid'].map(v => (
                <button key={v} onClick={() => { setViewMode(v); setSelectedMuscle(null); }}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: viewMode === v ? t.accent : 'transparent',
                    color: viewMode === v ? '#fff' : t.textMuted,
                    fontSize: 11, fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize',
                  }}>
                  {v}
                </button>
              ))}
            </div>
            {viewMode === 'single' && (
              <div style={{ display: 'flex', background: t.bgInput, borderRadius: 10, padding: 3 }}>
                {['front', 'back'].map(v => (
                  <button key={v} onClick={() => { setBodyView(v); setSelectedMuscle(null); }}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: bodyView === v ? BODY_PALETTE.muscleTrained : 'transparent',
                      color: bodyView === v ? '#fff' : t.textMuted,
                      fontSize: 11, fontWeight: 600, transition: 'all 0.2s',
                    }}>
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Body SVG: single view or grid (like reference image) */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', padding: '0 16px 4px' }}>
          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, width: '100%', maxWidth: 420 }}>
              {[
                { view: 'front', muscle: 'chest', label: 'Chest' },
                { view: 'front', muscle: 'frontDelts', label: 'Deltoids' },
                { view: 'front', muscle: 'biceps', label: 'Biceps' },
                { view: 'front', muscle: 'abs', label: 'Abs' },
                { view: 'front', muscle: 'quads', label: 'Quads' },
                { view: 'back', muscle: 'lats', label: 'Lats' },
                { view: 'back', muscle: 'lowerBack', label: 'Lower Back' },
                { view: 'back', muscle: 'triceps', label: 'Triceps' },
                { view: 'back', muscle: 'glutes', label: 'Glutes' },
                { view: 'back', muscle: 'calves', label: 'Calves' },
              ].map(({ view, muscle, label }) => (
                <div key={muscle} onClick={() => handleTap(muscle)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: 72, margin: '0 auto', background: '#eef0f3', borderRadius: 8, padding: 4 }}>
                    {view === 'front' ? <FrontBody highlightOnly={muscle} /> : <BackBody highlightOnly={muscle} />}
                  </div>
                  <div style={{ color: t.textSec, fontSize: 10, marginTop: 4, fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
          ) : (
            bodyView === 'front' ? <FrontBody /> : <BackBody />
          )}

          {/* Detail tooltip */}
          {selectedMuscle && (
            <div style={{
              position: 'absolute', top: 12, right: 18,
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 14, padding: 16, minWidth: 152, zIndex: 10,
              boxShadow: `0 12px 40px rgba(0,0,0,0.45)`,
              animation: 'fadeUp 0.2s ease',
            }}>
              <div style={{ color: t.textMuted, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>
                MUSCLE DETAIL
              </div>
              <div style={{ color: t.text, fontSize: 17, fontWeight: 700, marginBottom: 2 }}>
                {muscleLabels[selectedMuscle]}
              </div>
              {muscleSubtitle[selectedMuscle] && (
                <div style={{ color: t.textMuted, fontSize: 11, fontStyle: 'italic', marginBottom: 8 }}>
                  {muscleSubtitle[selectedMuscle]}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
                <span style={{ color: t.accent, fontSize: 32, fontWeight: 700, fontFamily: "'Space Mono', monospace", lineHeight: 1 }}>
                  {muscleHits[selectedMuscle] || 0}
                </span>
                <span style={{ color: t.textMuted, fontSize: 11 }}>workouts</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: t.bgInput, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: t.gradient,
                  width: `${intensity(selectedMuscle) * 100}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ color: t.textSec, fontSize: 11, lineHeight: 1.4 }}>
                {intensity(selectedMuscle) >= 0.75 ? '🔥 Top trained muscle' :
                 intensity(selectedMuscle) >= 0.4 ? '💪 Well trained' :
                 intensity(selectedMuscle) > 0 ? '⚡ Needs more work' : '⚠️ Not trained yet'}
              </div>
            </div>
          )}
        </div>

        {/* Heat legend (single view): grey → red */}
        {viewMode === 'single' && (
          <div style={{ padding: '4px 18px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: t.textDim, fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em' }}>0</span>
            <div style={{ flex: 1, display: 'flex', gap: 1, height: 6, borderRadius: 3, overflow: 'hidden' }}>
              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((s, i) => (
                <div key={i} style={{
                  flex: 1, background: s === 0 ? BODY_PALETTE.muscleRest : BODY_PALETTE.muscleTrained,
                  opacity: s === 0 ? 0.8 : Math.max(0.4, s),
                }} />
              ))}
            </div>
            <span style={{ color: t.textDim, fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em' }}>{maxHits}</span>
          </div>
        )}

        {/* Muscle list */}
        <div style={{ padding: '0 14px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {Object.entries(muscleHits)
              .filter(([m]) => viewMode === 'grid' || (bodyView === 'front'
                ? ['chest','frontDelts','biceps','forearms','abs','obliques','quads','calves','neck'].includes(m)
                : ['traps','rearDelts','triceps','lats','lowerBack','glutes','hamstrings','calves'].includes(m)))
              .sort(([,a], [,b]) => b - a)
              .map(([muscle, hits]) => (
                <div key={muscle} onClick={() => handleTap(muscle)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    background: selectedMuscle === muscle ? t.accentSoft : 'transparent',
                    border: `1px solid ${selectedMuscle === muscle ? t.accent + '40' : 'transparent'}`,
                  }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: 3, flexShrink: 0,
                    background: heatColor(muscle).opacity > 0 ? BODY_PALETTE.muscleTrained : t.bgInput,
                    opacity: heatColor(muscle).opacity || 0.5,
                    border: `1px solid ${intensity(muscle) > 0 ? BODY_PALETTE.muscleTrained + '99' : t.textDim + '30'}`,
                  }} />
                  <span style={{ color: t.textSec, fontSize: 11, flex: 1 }}>{muscleLabels[muscle]}</span>
                  <span style={{ color: t.text, fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{hits}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  };

  // ─── PROGRESS SCREEN ───
  const ProgressScreen = () => (
    <div style={{ padding: '0 18px 18px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { icon: 'flame', label: 'Streak', value: `${workoutHistory.length + 12}`, color: t.warn },
          { icon: 'trophy', label: 'PRs', value: `${prs.length}`, color: t.accent },
          { icon: 'chart', label: 'Volume', value: '↑18%', color: t.success },
        ].map((s, i) => (
          <div key={i} style={{ ...S.card, flex: 1, textAlign: 'center', marginBottom: 0, padding: 14 }} className="anim-fade hover-lift">
            <Icon name={s.icon} size={18} color={s.color} />
            <div style={{ color: t.text, fontSize: 24, fontWeight: 700, marginTop: 6, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
            <div style={{ color: t.textMuted, fontSize: 11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Body Muscle Map */}
      <BodyDiagram />

      <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Recent PRs</div>
      {prs.map((pr, i) => (
        <div key={i} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, padding: 14 }} className="anim-slide hover-lift">
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: t.warnSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="trophy" size={16} color={t.warn} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{pr.exercise}</div>
            <div style={{ color: t.textMuted, fontSize: 12 }}>{pr.date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: t.accent, fontSize: 17, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{pr.weight}</div>
            <div style={{ color: t.textMuted, fontSize: 11 }}>× {pr.reps} reps</div>
          </div>
        </div>
      ))}

      {workoutHistory.length > 0 && (
        <>
          <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10, marginTop: 10 }}>Workout History</div>
          {workoutHistory.slice(0, 5).map((w, i) => (
            <div key={i} style={{ ...S.card, marginBottom: 8, padding: 14 }} className="anim-slide">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                  <div style={{ color: t.textMuted, fontSize: 12 }}>{w.date} · {w.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: t.accent, fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmt(w.duration)}</div>
                  <div style={{ color: t.textMuted, fontSize: 11 }}>{w.totalSets} sets</div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  // ─── COACH SCREEN (Athlete View) ───
  const CoachScreen = () => {
    const [connectInput, setConnectInput] = useState('');

    return (
      <div style={{ padding: '0 18px 18px' }}>
        {/* Coach Connection */}
        {!profile.coachConnected ? (
          <div style={{ ...S.card, textAlign: 'center', padding: 28 }} className="anim-fade">
            <div style={{ width: 56, height: 56, borderRadius: 16, background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="link" size={24} color={t.accent} />
            </div>
            <div style={{ color: t.text, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Connect to Your Coach</div>
            <div style={{ color: t.textSec, fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
              Enter your coach's code to share your progress data in real-time
            </div>
            <input
              value={connectInput}
              onChange={e => setConnectInput(e.target.value)}
              placeholder="Enter coach code..."
              style={{ ...S.input, marginBottom: 12, textAlign: 'center' }}
            />
            <button onClick={() => connectCoach(connectInput || 'COACH-001')} style={{ ...S.btn(t.gradient), width: '100%' }}>
              <Icon name="link" size={16} /> Connect
            </button>
          </div>
        ) : (
          <>
            {/* Connected Coach Card */}
            <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }} className="anim-fade">
              <div style={{
                width: 52, height: 52, borderRadius: 16, background: t.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="user" size={22} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: t.text, fontSize: 16, fontWeight: 700 }}>{profile.coachName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 4, background: t.success }} />
                  <span style={{ color: t.success, fontSize: 12 }}>Online</span>
                  <span style={{ color: t.textDim, fontSize: 12 }}>·</span>
                  <LiveBadge />
                </div>
              </div>
            </div>

            {/* Data Sharing Status */}
            <div style={{ ...S.card, padding: 14 }} className="anim-fade">
              <div style={{ color: t.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>
                SHARED DATA
              </div>
              {[
                { label: 'Workout logs', icon: 'dumbbell', active: true },
                { label: 'Body metrics', icon: 'weight', active: true },
                { label: 'Daily habits', icon: 'target', active: true },
                { label: 'Recovery scores', icon: 'heart', active: true },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 3 ? `1px solid ${t.border}` : 'none' }}>
                  <Icon name={item.icon} size={14} color={t.accent} />
                  <span style={{ color: t.text, fontSize: 13, flex: 1 }}>{item.label}</span>
                  <div style={{ width: 32, height: 18, borderRadius: 9, background: item.active ? t.success : t.bgInput, padding: 2, cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 7, background: '#fff', transform: item.active ? 'translateX(14px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Messages */}
            <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Messages</div>
            <div style={{ ...S.card, padding: 14, maxHeight: 300, overflow: 'auto' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: t.textMuted, fontSize: 13 }}>
                  Send your first message to your coach!
                </div>
              ) : messages.map((msg, i) => (
                <div key={i} style={{
                  padding: '10px 14px', borderRadius: 14, marginBottom: 6,
                  background: msg.from === 'athlete' ? t.accentSoft : t.bgInput,
                  marginLeft: msg.from === 'athlete' ? 40 : 0,
                  marginRight: msg.from !== 'athlete' ? 40 : 0,
                  animation: 'fadeUp 0.3s ease',
                }}>
                  <div style={{ color: msg.from === 'athlete' ? t.accent : t.text, fontSize: 13, lineHeight: 1.4 }}>{msg.text}</div>
                  <div style={{ color: t.textDim, fontSize: 10, marginTop: 3 }}>{msg.time}</div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Message your coach..."
                style={{ ...S.input, flex: 1 }}
              />
              <button onClick={sendMessage} style={{ ...S.btn(t.gradient), padding: '12px 14px' }}>
                <Icon name="send" size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════
  // COACH DASHBOARD
  // ═══════════════════════════════════
  const CoachDashboard = () => {
    const athlete = selectedAthlete ? coachAthletes.find(a => a.key === selectedAthlete) : null;

    return (
      <div style={{ padding: 18 }}>
        <Header title="Coach Dashboard" subtitle="REAL-TIME MONITORING" />

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={refreshCoachData} style={{ ...S.btn(t.bgCard, t.textSec), flex: 1, border: `1px solid ${t.border}` }}>
            <Icon name="refresh" size={14} /> Refresh Data
          </button>
          <button onClick={() => setSelectedAthlete(null)} style={{ ...S.btn(t.accentSoft, t.accent), flex: 1 }}>
            <Icon name="user" size={14} /> All Athletes
          </button>
        </div>

        {!selectedAthlete ? (
          <>
            {/* Athletes Overview */}
            <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
              Athletes ({coachAthletes.length || 1})
            </div>

            {/* Always show the demo athlete card */}
            <div style={{ ...S.card, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}
              className="hover-lift" onClick={() => setSelectedAthlete('self')}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="user" size={20} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: t.text, fontSize: 15, fontWeight: 700 }}>{profile.name}</span>
                  <LiveBadge />
                </div>
                <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>
                  Last sync: just now · Readiness: 78
                </div>
              </div>
              <Icon name="right" size={18} color={t.textDim} />
            </div>

            {coachAthletes.filter(a => a.key !== profile.name).map((a, i) => (
              <div key={i} style={{ ...S.card, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}
                className="hover-lift" onClick={() => setSelectedAthlete(a.key)}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: t.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="user" size={20} color={t.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: t.text, fontSize: 15, fontWeight: 700 }}>{a.profile?.name || a.key}</span>
                    {a.lastSync && <LiveBadge />}
                  </div>
                  <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>
                    Last sync: {a.lastSync ? new Date(a.lastSync).toLocaleTimeString() : 'N/A'}
                  </div>
                </div>
                <Icon name="right" size={18} color={t.textDim} />
              </div>
            ))}

            {/* Quick Stats Grid */}
            <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10, marginTop: 10 }}>Quick Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Active Now', value: '1', icon: 'pulse', color: t.success },
                { label: 'Workouts Today', value: `${workoutHistory.length}`, icon: 'dumbbell', color: t.accent },
                { label: 'Avg Readiness', value: '78', icon: 'target', color: t.warn },
                { label: 'Messages', value: `${messages.length}`, icon: 'msg', color: t.accent },
              ].map((s, i) => (
                <div key={i} style={{ ...S.card, marginBottom: 0, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Icon name={s.icon} size={14} color={s.color} />
                    <span style={{ color: t.textMuted, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                  </div>
                  <div style={{ color: t.text, fontSize: 26, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Athlete Detail View */
          <AthleteDetail data={selectedAthlete === 'self' ? { profile, habits, workoutHistory, prs, messages } : athlete} />
        )}
      </div>
    );
  };

  const AthleteDetail = ({ data }) => {
    if (!data) return <div style={{ color: t.textMuted, textAlign: 'center', padding: 40 }}>No data available</div>;
    const p = data.profile || profile;
    const h = data.habits || habits;
    const wh = data.workoutHistory || workoutHistory;
    const pr = data.prs || prs;

    return (
      <div className="anim-fade">
        <button onClick={() => setSelectedAthlete(null)} style={{ ...S.btn(t.bgCard, t.textSec), marginBottom: 14, border: `1px solid ${t.border}` }}>
          ← Back to All Athletes
        </button>

        {/* Athlete Header */}
        <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" size={24} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: t.text, fontSize: 20, fontWeight: 700 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <span style={{ color: t.textSec, fontSize: 12 }}>Body Weight: {p.bodyWeight} lbs</span>
            </div>
          </div>
          <LiveBadge />
        </div>

        {/* Today's Habits */}
        <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Today's Habits</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Water', value: h.water, target: 8, unit: '/8 glasses', color: '#3b82f6' },
            { label: 'Protein', value: h.protein, target: 180, unit: '/180g', color: '#f59e0b' },
            { label: 'Steps', value: h.steps, target: 10000, unit: '/10k', color: '#22c55e' },
            { label: 'Sleep', value: h.sleep, target: 8, unit: '/8 hrs', color: '#8b5cf6' },
          ].map((hab, i) => (
            <div key={i} style={{ ...S.card, marginBottom: 0, padding: 14 }}>
              <div style={{ color: t.textMuted, fontSize: 11, marginBottom: 4 }}>{hab.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ color: t.text, fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{hab.value.toLocaleString()}</span>
                <span style={{ color: t.textMuted, fontSize: 11 }}>{hab.unit}</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, marginTop: 6, background: t.bgInput, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, background: hab.color, width: `${Math.min(100, (hab.value / hab.target) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* PRs */}
        <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Personal Records</div>
        {pr.map((p, i) => (
          <div key={i} style={{ ...S.card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.warnSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="trophy" size={14} color={t.warn} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: t.text, fontSize: 13, fontWeight: 600 }}>{p.exercise}</div>
              <div style={{ color: t.textMuted, fontSize: 11 }}>{p.date}</div>
            </div>
            <div style={{ color: t.accent, fontSize: 15, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{p.weight} × {p.reps}</div>
          </div>
        ))}

        {/* Workout History */}
        <div style={{ color: t.text, fontSize: 15, fontWeight: 700, marginBottom: 10, marginTop: 6 }}>Workout History</div>
        {wh.length === 0 ? (
          <div style={{ ...S.card, textAlign: 'center', padding: 20, color: t.textMuted, fontSize: 13 }}>No workouts logged yet</div>
        ) : wh.slice(0, 10).map((w, i) => (
          <div key={i} style={{ ...S.card, marginBottom: 8, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                <div style={{ color: t.textMuted, fontSize: 12 }}>{w.date} · {w.time}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: t.accent, fontSize: 14, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmt(w.duration)}</div>
                <div style={{ color: t.textMuted, fontSize: 11 }}>{w.totalSets} sets · {w.totalVolume?.toLocaleString() || 0} lbs vol</div>
              </div>
            </div>
            {w.exercises && (
              <div style={{ marginTop: 10, padding: '10px 0 0', borderTop: `1px solid ${t.border}` }}>
                {w.exercises.map((ex, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span style={{ color: t.textSec, fontSize: 12 }}>{ex.name}</span>
                    <span style={{ color: t.textMuted, fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
                      {ex.sets.filter(s => s.completed).length}/{ex.sets.length} sets
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ─── THEME PICKER ───
  const ThemePicker = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
    }} onClick={() => setShowThemes(false)}>
      <div style={{
        background: t.bgCard, borderRadius: '24px 24px 0 0', padding: 24,
        width: '100%', maxWidth: 420,
        border: `1px solid ${t.border}`, borderBottom: 'none',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: t.textDim, margin: '0 auto 18px' }} />
        <div style={{ color: t.text, fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 18 }}>Choose Theme</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {Object.entries(themes).map(([key, th]) => (
            <button key={key} onClick={() => { setThemeKey(key); setShowThemes(false); }}
              style={{
                padding: 16, borderRadius: 14, background: th.bg,
                border: `2px solid ${themeKey === key ? th.accent : th.border}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                {[th.accent, th.success, th.warn].map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: 5, background: c }} />
                ))}
              </div>
              <div style={{ color: th.text, fontSize: 14, fontWeight: 600 }}>{th.name}</div>
              <div style={{ color: th.textMuted, fontSize: 11, marginTop: 2 }}>
                {key === 'obsidian' ? 'Deep & moody' : key === 'arctic' ? 'Clean & bright' : key === 'ember' ? 'Warm & bold' : 'Soft & elegant'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── RENDER ───
  const renderScreen = () => {
    if (screen === 'workout') return <WorkoutScreen />;
    switch (tab) {
      case 'today': return <TodayScreen />;
      case 'train': return <TrainScreen />;
      case 'recover': return <RecoverScreen />;
      case 'progress': return <ProgressScreen />;
      case 'coach': return <CoachScreen />;
      default: return <TodayScreen />;
    }
  };

  if (loading) return (
    <div style={{ ...S.app, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: t.accent, fontSize: 20, fontWeight: 700, fontFamily: "'Space Mono', monospace", animation: 'pulse 1.5s infinite' }}>
        INO FITNESS
      </div>
    </div>
  );

  return (
    <div style={S.app}>
      {screen !== 'workout' && (
        <Header
          title={tab === 'today' ? `Hey ${profile.name}!` : tab === 'train' ? 'Training' : tab === 'recover' ? 'Recovery' : tab === 'progress' ? 'Progress' : 'Coach'}
          subtitle={tab === 'today' ? dayLabel().toUpperCase() : undefined}
        />
      )}

      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderScreen()}
      </div>

      {screen !== 'workout' && <TabBar />}
      {showThemes && <ThemePicker />}
    </div>
  );
}
