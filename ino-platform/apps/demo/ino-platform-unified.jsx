import React, { useState, useMemo, memo, useEffect, useCallback } from 'react';

// ════════════════════════════════════════════════════════════════
// INÖ PLATFORM — FITNESS COACHING PLATFORM
// Page 1: Landing → Features → Pricing
// Page 2: Live Platform Preview (Coach Web + Fit Mobile)
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
// THEME
// ════════════════════════════════════════════════════════════════
const T = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  primaryBg: 'rgba(99, 102, 241, 0.08)',
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.08)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.08)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.08)',
  pink: '#ec4899',
  pinkBg: 'rgba(236, 72, 153, 0.08)',
  orange: '#f97316',
  cyan: '#06b6d4',
  cyanBg: 'rgba(6, 182, 212, 0.08)',
  purple: '#8b5cf6',
  bg: '#fafbfe',
  bgAlt: '#f1f4f9',
  bgCard: '#ffffff',
  bgDark: '#0c1222',
  bgDarkAlt: '#161d30',
  bgDarkCard: '#1e2940',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textDim: '#94a3b8',
  border: '#e2e8f0',
  borderDark: 'rgba(255,255,255,0.08)',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
  gradientAlt: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
  gradientWarm: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
  gradientDark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  shadow: '0 1px 3px rgba(0,0,0,0.06)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 12px 32px rgba(0,0,0,0.1)',
  shadowXl: '0 32px 64px rgba(0,0,0,0.15)',
};

// ════════════════════════════════════════════════════════════════
// ICONS (SVG paths)
// ════════════════════════════════════════════════════════════════
const iconPaths = {
  dumbbell: <path d="M6.5 6.5h11M6.5 17.5h11M3 10v4M21 10v4M5 8v8M19 8v8M7 6v12M17 6v12"/>,
  play: <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>,
  target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  check: <polyline points="20 6 9 17 4 12"/>,
  checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
  chevronRight: <polyline points="9 18 15 12 9 6"/>,
  chevronLeft: <polyline points="15 18 9 12 15 6"/>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
  smartphone: <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
  sparkles: <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  video: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
  fire: <><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></>,
  trendingUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  alertCircle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  creditCard: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  heartPulse: <><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></>,
};

const Icon = memo(({ name, size = 20, color = 'currentColor', style = {} }) => {
  const path = iconPaths[name];
  if (!path) return null;
  const filled = ['play', 'fire'].includes(name);
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      width={size} height={size} style={{ flexShrink: 0, color, ...style }}>
      {path}
    </svg>
  );
});

// ════════════════════════════════════════════════════════════════
// PRICING — $129 / $249 / $399
// ════════════════════════════════════════════════════════════════
const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 129, period: '/mo',
    desc: 'Everything you need to coach professionally',
    clients: '20 clients', features: [
      'Workout Builder & Templates',
      'Exercise Video Library',
      'Client Messaging',
      'Progress Photo Tracking',
      'Basic Check-ins',
      'Nutrition Guidelines',
    ],
    missing: ['Automation', 'Advanced Check-ins', 'Client Flags', 'Deep Analytics'],
  },
  {
    id: 'pro', name: 'Pro', price: 249, period: '/mo', popular: true,
    desc: 'The full toolkit to scale past 30+ clients',
    clients: '50 clients', features: [
      'Everything in Starter',
      'Smart Automation Workflows',
      'Advanced Check-in System',
      'Client Risk Flags & Alerts',
      'Readiness Scoring',
      'Custom Branding',
      'Form Video Review',
      'Form review videos stored 90 days (rolling)',
      'Priority Email Support',
    ],
    missing: ['Deep Automation', 'Team Access'],
  },
  {
    id: 'scale', name: 'Scale', price: 399, period: '/mo',
    desc: 'For coaching teams running a real operation',
    clients: '100+ clients', features: [
      'Everything in Pro',
      'Deep Automation Engine',
      'Staff Roles (Coach / Assistant / Admin)',
      'Shared Inbox & Assignment Ownership',
      'Advanced Client Analytics',
      'White-label Branding',
      'Dedicated Account Manager',
      'Priority Phone & Chat Support',
      'API Access',
    ],
    missing: [],
  },
];

// ════════════════════════════════════════════════════════════════
// MOCK DATA FOR DEMO
// ════════════════════════════════════════════════════════════════
const DEMO_MEMBERS = [
  { id: 'm1', name: 'James Wilson', initials: 'JW', status: 'active', progress: 0.84, streak: 12, lastActive: 'Today' },
  { id: 'm2', name: 'Emma Davis', initials: 'ED', status: 'active', progress: 0.92, streak: 28, lastActive: 'Today' },
  { id: 'm3', name: 'Mike Chen', initials: 'MC', status: 'at_risk', progress: 0.45, streak: 0, lastActive: '3 days ago' },
  { id: 'm4', name: 'Lisa Park', initials: 'LP', status: 'active', progress: 0.78, streak: 7, lastActive: 'Yesterday' },
];

const DEMO_WORKOUTS = [
  { id: 'u1', title: 'Push Day', desc: 'Chest, shoulders & triceps', exercises: [
    { name: 'Bench Press', sets: 4, reps: 8 }, { name: 'Incline DB Press', sets: 3, reps: 12 },
    { name: 'Cable Flyes', sets: 3, reps: 15 }, { name: 'Shoulder Press', sets: 4, reps: 10 },
    { name: 'Lateral Raises', sets: 3, reps: 15 }, { name: 'Tricep Pushdowns', sets: 3, reps: 12 },
  ]},
  { id: 'u2', title: 'Pull Day', desc: 'Back & biceps', exercises: [
    { name: 'Deadlift', sets: 4, reps: 6 }, { name: 'Pull-ups', sets: 4, reps: 8 },
    { name: 'Barbell Rows', sets: 4, reps: 10 }, { name: 'Face Pulls', sets: 3, reps: 15 },
  ]},
  { id: 'u3', title: 'Leg Day', desc: 'Quads, hamstrings & glutes', exercises: [
    { name: 'Squats', sets: 4, reps: 8 }, { name: 'Romanian Deadlift', sets: 4, reps: 10 },
    { name: 'Leg Press', sets: 3, reps: 12 }, { name: 'Calf Raises', sets: 4, reps: 15 },
  ]},
];

// ════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════════════════
const Avatar = ({ initials, size = 40, color = T.primary }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.3,
    background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color, fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
  }}>{initials}</div>
);

const ProgressBar = ({ value, color = T.success, h = 6 }) => (
  <div style={{ height: h, background: T.bgAlt, borderRadius: h, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(100, value)}%`, background: color, borderRadius: h, transition: 'width 0.6s ease' }} />
  </div>
);

// ════════════════════════════════════════════════════════════════
// FEATURES DATA
// ════════════════════════════════════════════════════════════════
const FEATURES = [
  {
    icon: 'dumbbell', color: T.primary,
    title: 'Workout Builder',
    desc: 'Create, assign, and manage training programs with a drag-and-drop builder. Template entire mesocycles in minutes.',
  },
  {
    icon: 'video', color: T.pink,
    title: 'Form Video Review',
    desc: 'Clients submit form check videos directly in-app. Review, annotate, and send feedback without leaving the platform.',
  },
  {
    icon: 'alertCircle', color: T.danger,
    title: 'Client Risk Flags',
    desc: 'Automatic alerts when clients miss sessions, drop adherence, or show signs of disengagement. Intervene before they churn.',
  },
  {
    icon: 'zap', color: T.warning,
    title: 'Smart Automation',
    desc: 'Client misses 2 workouts → auto-send check-in → flag coach after 48h. Set rules once, let them run. No manual follow-up.',
  },
  {
    icon: 'heartPulse', color: T.success,
    title: 'Readiness & Check-ins',
    desc: 'Daily readiness scores, weekly check-ins, and progress photo tracking — all synced to the coach dashboard.',
  },
  {
    icon: 'chart', color: T.cyan,
    title: 'Analytics Dashboard',
    desc: 'Client adherence trends, revenue tracking, retention rates, and business performance — all in one view.',
  },
];

// ════════════════════════════════════════════════════════════════
// TESTIMONIALS DATA
// ════════════════════════════════════════════════════════════════
const TESTIMONIALS = [
  {
    name: 'Marcus Rivera',
    role: 'Online Strength Coach',
    initials: 'MR',
    color: T.primary,
    quote: 'Went from 18 to 62 clients in 4 months. The automation handles what used to take me 3 hours a day.',
    metric: '18 → 62 clients',
  },
  {
    name: 'Jenna Kowalski',
    role: 'Nutrition & Fitness Coach',
    initials: 'JK',
    color: T.pink,
    quote: 'My clients love the app. Check-in completion went from maybe 40% to over 90%. It changed my entire business.',
    metric: '90% check-in rate',
  },
  {
    name: 'David Okonkwo',
    role: 'Gym Owner & Head Coach',
    initials: 'DO',
    color: T.cyan,
    quote: 'We run 100+ online clients alongside our gym. INÖ is the only platform that didn\'t break at scale.',
    metric: '100+ clients managed',
  },
];

// ════════════════════════════════════════════════════════════════
// FAQ DATA
// ════════════════════════════════════════════════════════════════
const FAQ_DATA = [
  {
    q: 'Can my clients actually use this app?',
    a: 'Yes. INÖ Fit is designed to be dead simple — your clients download it, enter your coach code, and they\'re in. No confusing onboarding, no tech support calls. If they can use Instagram, they can use INÖ Fit.',
  },
  {
    q: 'What happens if I outgrow my plan?',
    a: 'Upgrade anytime with zero downtime. Your data, clients, and workflows all carry over instantly. Most coaches start on Starter and move to Pro within 2–3 months as they scale.',
  },
  {
    q: 'Is there a contract or commitment?',
    a: 'No contracts, ever. All plans are month-to-month. You can cancel anytime from your dashboard. We keep your data for 90 days in case you come back.',
  },
  {
    q: 'How is this different from Trainerize / TrueCoach / Google Sheets?',
    a: 'INÖ was built for scale. Most coaching tools work fine at 10 clients but break at 40+. INÖ gives you automation, client risk flags, and a real mobile app — so you can grow without the chaos.',
  },
  {
    q: 'Do my clients have to pay anything?',
    a: 'No. Your subscription covers everything. Your clients get INÖ Fit completely free — it\'s branded to your coaching business.',
  },
  {
    q: 'Can I migrate from another platform?',
    a: 'Yes. We offer free migration support for Pro and Scale plans. Send us a CSV or connect your existing tool and we\'ll handle the rest.',
  },
];

// ════════════════════════════════════════════════════════════════
// COMPARISON TABLE DATA
// ════════════════════════════════════════════════════════════════
const COMPARISON_FEATURES = [
  { name: 'Clients included', starter: 'Up to 20', pro: 'Up to 50', scale: '100+' },
  { name: 'Workout Builder', starter: true, pro: true, scale: true },
  { name: 'Exercise Video Library', starter: true, pro: true, scale: true },
  { name: 'Client Messaging', starter: true, pro: true, scale: true },
  { name: 'Progress Photo Tracking', starter: true, pro: true, scale: true },
  { name: 'Nutrition Guidelines', starter: true, pro: true, scale: true },
  { name: 'Basic Check-ins', starter: true, pro: true, scale: true },
  { name: 'Smart Automation', starter: false, pro: true, scale: true },
  { name: 'Advanced Check-in System', starter: false, pro: true, scale: true },
  { name: 'Client Risk Flags & Alerts', starter: false, pro: true, scale: true },
  { name: 'Readiness Scoring', starter: false, pro: true, scale: true },
  { name: 'Form Video Review', starter: false, pro: true, scale: true },
  { name: 'Custom Branding', starter: false, pro: true, scale: true },
  { name: 'Deep Automation Engine', starter: false, pro: false, scale: true },
  { name: 'Staff Roles & Permissions', starter: false, pro: false, scale: true },
  { name: 'Shared Inbox & Assignments', starter: false, pro: false, scale: true },
  { name: 'Advanced Client Analytics', starter: false, pro: false, scale: true },
  { name: 'White-label Branding', starter: false, pro: false, scale: true },
  { name: 'Dedicated Account Manager', starter: false, pro: false, scale: true },
  { name: 'API Access', starter: false, pro: false, scale: true },
  { name: 'Priority Support', starter: 'Email', pro: 'Email', scale: 'Phone & Chat' },
];

// ════════════════════════════════════════════════════════════════
// PAGE 1: LANDING + FEATURES + PRICING (PREMIUM)
// ════════════════════════════════════════════════════════════════
const LandingPage = memo(({ onNavigate }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [animIn, setAnimIn] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => { requestAnimationFrame(() => setAnimIn(true)); }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: '"DM Sans", -apple-system, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,251,254,0.85)',
        backdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.border}`,
        padding: '0 48px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: T.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}>INÖ</div>
          <span style={{ fontWeight: 800, fontSize: 22, color: T.text, letterSpacing: '-0.03em' }}>Platform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => onNavigate('demo')} style={{
            background: 'none', border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '10px 22px',
            fontSize: 14, fontWeight: 600, color: T.textSecondary, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>See Demo</button>
          <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} style={{
            background: T.gradient, border: 'none', borderRadius: 10, padding: '10px 22px',
            fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        padding: '80px 48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(236,72,153,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px',
          background: T.primaryBg, borderRadius: 100, marginBottom: 28,
          border: `1px solid rgba(99,102,241,0.12)`,
          opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.6s ease',
        }}>
          <Icon name="dumbbell" size={16} color={T.primary} />
          <span style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>Professional-Grade Coaching Platform</span>
        </div>

        <h1 style={{
          margin: '0 auto 24px', fontSize: 64, fontWeight: 800, color: T.text,
          lineHeight: 1.05, letterSpacing: '-0.04em', maxWidth: 820,
          opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          Built for coaches who{' '}
          <span style={{ background: T.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', paddingRight: 2, display: 'inline-block' }}>
            care about their clients
          </span>
          {' '}— and their time.
        </h1>

        <p style={{
          margin: '0 auto 44px', fontSize: 20, color: T.textMuted, maxWidth: 600, lineHeight: 1.6,
          opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s ease 0.2s',
        }}>
          INÖ helps coaches grow their roster while staying present, organized, and
          responsive — so every client still feels coached, not managed.
        </p>

        {/* Social proof strip */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 20,
          opacity: animIn ? 1 : 0, transition: 'all 0.7s ease 0.35s',
        }}>
          {[
            { value: '2,400+', label: 'Active Coaches' },
            { value: '94%', label: 'Client Retention' },
            { value: '50,000+', label: 'Programs Delivered' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID (with hover) ── */}
      <section style={{ padding: '60px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
            Built for how coaches actually work
          </h2>
          <p style={{ margin: '14px 0 0', color: T.textMuted, fontSize: 17, maxWidth: 540, marginInline: 'auto' }}>
            Every feature exists to save you time or keep your clients accountable. Nothing extra.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                background: T.bgCard, borderRadius: 20, padding: 28,
                border: `1px solid ${hoveredFeature === i ? f.color + '40' : T.border}`,
                transition: 'all 0.3s ease',
                transform: hoveredFeature === i ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: hoveredFeature === i ? `0 16px 40px ${f.color}15` : T.shadow,
                cursor: 'default',
              }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, background: f.color + '12',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                transition: 'all 0.3s ease',
                transform: hoveredFeature === i ? 'scale(1.1)' : 'scale(1)',
              }}>
                <Icon name={f.icon} size={26} color={f.color} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AUTOMATION RULE VISUAL ── */}
      <section style={{ padding: '0 48px 60px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          background: T.bgCard, borderRadius: 24, border: `1px solid ${T.border}`,
          padding: 32, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: T.gradientWarm }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.warningBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="zap" size={16} color={T.warning} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Example Automation Rule</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: T.successBg, color: T.success, marginLeft: 'auto' }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Client misses 2 workouts', bg: T.dangerBg, color: T.danger, icon: 'alertCircle' },
              { label: '→', bg: 'transparent', color: T.textDim, isArrow: true },
              { label: 'Auto-send check-in message', bg: T.primaryBg, color: T.primary, icon: 'send' },
              { label: '→', bg: 'transparent', color: T.textDim, isArrow: true },
              { label: 'Flag coach after 48h', bg: T.warningBg, color: T.warning, icon: 'bell' },
            ].map((step, i) => (
              step.isArrow ? (
                <span key={i} style={{ fontSize: 18, color: T.textDim, fontWeight: 600 }}>→</span>
              ) : (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                  background: step.bg, borderRadius: 12, border: `1px solid ${step.color}18`,
                }}>
                  <Icon name={step.icon} size={16} color={step.color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: step.color }}>{step.label}</span>
                </div>
              )
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: T.textMuted }}>
            This rule has saved coaches an average of 4.2 hours/week on client follow-up.
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER CONTRAST ── */}
      <section style={{ padding: '40px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
            The difference is night and day
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Without */}
          <div style={{
            background: T.bgCard, borderRadius: 24, padding: 36, border: `1px solid ${T.border}`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: T.danger }} />
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              background: T.dangerBg, borderRadius: 100, marginBottom: 24,
            }}>
              <Icon name="x" size={14} color={T.danger} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.danger }}>WITHOUT INÖ</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Tracking clients across spreadsheets, DMs, and apps',
                'Missing check-ins with no system to follow up',
                'Clients ghosting because they feel forgotten',
                'Spending 3+ hours/day on admin instead of coaching',
                'No idea who\'s at risk until they\'ve already quit',
                'Revenue capped because you can\'t take more clients',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: T.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon name="x" size={12} color={T.danger} />
                  </div>
                  <span style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* With */}
          <div style={{
            background: T.bgCard, borderRadius: 24, padding: 36, border: `1px solid ${T.border}`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: T.gradient }} />
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              background: T.successBg, borderRadius: 100, marginBottom: 24,
            }}>
              <Icon name="checkCircle" size={14} color={T.success} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.success }}>WITH INÖ</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Every client, workout, and check-in in one dashboard',
                'Automated check-ins sent on schedule — zero effort',
                'Clients engaged daily through their own branded app',
                'Admin cut to 30 min/day with smart automation',
                'Real-time risk flags before clients disengage',
                'Scale to 50, 80, 100+ clients with the same energy',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: T.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon name="check" size={12} color={T.success} />
                  </div>
                  <span style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO-APP SECTION ── */}
      <section style={{ padding: '20px 48px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          background: T.bgDark, borderRadius: 28, padding: '56px 48px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(236,72,153,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: 48, alignItems: 'center', position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                Two apps.<br />One seamless system.
              </h3>
              <p style={{ margin: '0 0 28px', color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.7 }}>
                You get the coach dashboard on web. Your clients get INÖ Fit on mobile. Everything syncs in real time — workouts, check-ins, messages, progress.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { icon: 'monitor', label: 'INÖ Coach', sub: 'Web dashboard', color: T.primary },
                  { icon: 'smartphone', label: 'INÖ Fit', sub: 'Client mobile app', color: T.pink },
                ].map((app, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                    background: 'rgba(255,255,255,0.06)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: app.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={app.icon} size={20} color={app.color} />
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>{app.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{app.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <button onClick={() => onNavigate('demo')} style={{
                background: T.gradient, border: 'none', borderRadius: 16, padding: '18px 36px',
                fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                Launch Live Demo <Icon name="arrowRight" size={20} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '60px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
            Coaches who made the switch
          </h2>
          <p style={{ margin: '14px 0 0', color: T.textMuted, fontSize: 17 }}>
            Real results from real coaching businesses
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background: T.bgCard, borderRadius: 24, padding: 32, border: `1px solid ${T.border}`,
              display: 'flex', flexDirection: 'column', position: 'relative',
            }}>
              {/* Metric badge */}
              <div style={{
                position: 'absolute', top: 20, right: 20,
                background: t.color + '10', padding: '5px 12px', borderRadius: 100,
                fontSize: 11, fontWeight: 700, color: t.color,
              }}>{t.metric}</div>

              {/* Quote icon */}
              <div style={{ fontSize: 48, lineHeight: 1, color: t.color + '25', fontFamily: 'Georgia, serif', marginBottom: 8 }}>"</div>

              <p style={{ fontSize: 15, color: T.textSecondary, lineHeight: 1.7, flex: 1, margin: '0 0 24px' }}>
                {t.quote}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                <Avatar initials={t.initials} size={42} color={t.color} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROI MATH STRIP ── */}
      <section style={{ padding: '0 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          background: T.gradient, borderRadius: 24, padding: '44px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 600 }}>Do the math</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              $249/mo ÷ 50 clients = $4.98/client
            </div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>
              One retained client pays for a full year of INÖ.
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '20px 28px',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center', position: 'relative',
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>247x</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Average ROI</div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '80px 48px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
            Pricing that scales with you
          </h2>
          <p style={{ margin: '14px 0 24px', color: T.textMuted, fontSize: 17 }}>
            No per-client fees. No hidden costs. Just the tools to grow.
          </p>

          {/* Trust badges */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28,
          }}>
            {[
              { icon: 'shield', text: '14-day free trial' },
              { icon: 'creditCard', text: 'No credit card required' },
              { icon: 'x', text: 'Cancel anytime' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={b.icon} size={14} color={T.textDim} />
                <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>{b.text}</span>
              </div>
            ))}
          </div>

          {/* Billing toggle */}
          <div style={{
            display: 'inline-flex', background: T.bgAlt, borderRadius: 12, padding: 4,
            border: `1px solid ${T.border}`,
          }}>
            {['monthly', 'yearly'].map(c => (
              <button key={c} onClick={() => setBillingCycle(c)} style={{
                padding: '10px 24px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                background: billingCycle === c ? T.bgCard : 'transparent',
                color: billingCycle === c ? T.text : T.textMuted,
                boxShadow: billingCycle === c ? T.shadowMd : 'none',
              }}>
                {c === 'monthly' ? 'Monthly' : 'Yearly'}
                {c === 'yearly' && <span style={{ fontSize: 11, color: T.success, marginLeft: 6, fontWeight: 700 }}>Save 20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 24 }}>
          {PLANS.map(plan => {
            const price = billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div key={plan.id} style={{
                background: T.bgCard, borderRadius: 24, overflow: 'hidden',
                border: plan.popular ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                boxShadow: plan.popular ? `0 16px 48px rgba(99,102,241,0.15)` : T.shadow,
                transform: plan.popular ? 'scale(1.03)' : 'none',
                position: 'relative',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: T.gradient, padding: '5px 14px', borderRadius: 100,
                    fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.02em',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ padding: 32 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>{plan.desc}</div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 48, fontWeight: 800, color: T.text, letterSpacing: '-0.04em' }}>${price}</span>
                    <span style={{ fontSize: 16, color: T.textDim, fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>Up to {plan.clients}</div>

                  <button onClick={() => onNavigate('demo')} style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    background: plan.popular ? T.gradient : T.bgAlt,
                    color: plan.popular ? '#fff' : T.text,
                    boxShadow: plan.popular ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
                  }}>
                    Start 14-Day Free Trial
                  </button>
                </div>

                <div style={{ padding: '0 32px 32px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14 }}>What's included:</div>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <Icon name="check" size={16} color={T.success} />
                      <span style={{ fontSize: 14, color: T.textSecondary }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, opacity: 0.4 }}>
                      <Icon name="x" size={16} color={T.textDim} />
                      <span style={{ fontSize: 14, color: T.textDim }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ── */}
      <section style={{ padding: '40px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: T.text }}>Full feature comparison</h3>
        </div>

        <div style={{
          background: T.bgCard, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
            padding: '18px 28px', borderBottom: `2px solid ${T.border}`, background: T.bgAlt,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted }}>FEATURE</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textAlign: 'center' }}>STARTER</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, textAlign: 'center' }}>PRO</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textAlign: 'center' }}>SCALE</div>
          </div>

          {/* Rows */}
          {COMPARISON_FEATURES.map((row, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
              padding: '14px 28px', borderBottom: i < COMPARISON_FEATURES.length - 1 ? `1px solid ${T.border}` : 'none',
              background: i % 2 === 0 ? 'transparent' : T.bg,
            }}>
              <div style={{ fontSize: 14, color: T.textSecondary, fontWeight: 500 }}>{row.name}</div>
              {['starter', 'pro', 'scale'].map(plan => {
                const val = row[plan];
                return (
                  <div key={plan} style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {val === true ? (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.successBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={13} color={T.success} />
                      </div>
                    ) : val === false ? (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: T.bgAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="x" size={11} color={T.textDim} />
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{val}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '40px 48px 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
            Frequently asked questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ_DATA.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} style={{
                background: T.bgCard, borderRadius: 16, border: `1px solid ${isOpen ? T.primary + '30' : T.border}`,
                overflow: 'hidden', transition: 'all 0.2s ease',
              }}>
                <button onClick={() => setOpenFaq(isOpen ? null : i)} style={{
                  width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: T.text, textAlign: 'left' }}>{faq.q}</span>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, background: isOpen ? T.primaryBg : T.bgAlt,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 16,
                    transition: 'all 0.3s ease', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}>
                    <span style={{ fontSize: 20, lineHeight: 1, color: isOpen ? T.primary : T.textDim, fontWeight: 300 }}>+</span>
                  </div>
                </button>
                <div style={{
                  maxHeight: isOpen ? 200 : 0, overflow: 'hidden',
                  transition: 'max-height 0.35s ease',
                }}>
                  <div style={{ padding: '0 24px 20px' }}>
                    <p style={{ margin: 0, fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: '20px 48px 100px', textAlign: 'center' }}>
        <div style={{
          background: T.bgDark, borderRadius: 32, padding: '64px 48px', maxWidth: 900, margin: '0 auto',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(236,72,153,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

          <h2 style={{ margin: '0 0 16px', fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', position: 'relative' }}>
            Stop coaching like it's 2019
          </h2>
          <p style={{ margin: '0 0 36px', fontSize: 17, color: 'rgba(255,255,255,0.6)', maxWidth: 520, marginInline: 'auto', position: 'relative', lineHeight: 1.7 }}>
            Your clients deserve a real app. Your business deserves real infrastructure. INÖ is the platform that makes both happen.
          </p>
          <button onClick={() => onNavigate('demo')} style={{
            background: T.gradient, border: 'none', borderRadius: 14, padding: '16px 40px',
            fontSize: 17, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: 10, position: 'relative',
          }}>
            Launch Demo <Icon name="arrowRight" size={20} color="#fff" />
          </button>
        </div>
      </section>
    </div>
  );
});

// ════════════════════════════════════════════════════════════════
// PAGE 2: PLATFORM DEMO PREVIEW
// Coach (Web) on left + Fit (Mobile) on right
// ════════════════════════════════════════════════════════════════
const DemoPage = memo(({ onNavigate }) => {
  const [coachNav, setCoachNav] = useState('dashboard');
  const [fitTab, setFitTab] = useState('home');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [completions, setCompletions] = useState({});
  const [toast, setToast] = useState(null);
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setAnimIn(true)); }, []);

  const fitUser = DEMO_MEMBERS[0];
  const avgProgress = Math.round(DEMO_MEMBERS.reduce((a, m) => a + m.progress, 0) / DEMO_MEMBERS.length * 100);

  const completeExercise = (wId, eName) => {
    setCompletions(prev => ({ ...prev, [`${wId}_${eName}`]: true }));
    showToast('Exercise completed! 💪');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ── COACH WEB DASHBOARD ──
  const renderCoachPanel = () => (
    <div style={{ display: 'flex', height: '100%', background: T.bg, borderRadius: 20, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: T.shadowLg }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: T.bgDark, padding: '20px 10px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', marginBottom: 28 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11 }}>INÖ</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Coach</div>
            <div style={{ color: T.textDim, fontSize: 10 }}>Elite Fitness</div>
          </div>
        </div>

        {[
          { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
          { id: 'members', icon: 'users', label: 'Clients' },
          { id: 'content', icon: 'dumbbell', label: 'Workouts' },
          { id: 'videos', icon: 'video', label: 'Videos' },
          { id: 'messages', icon: 'message', label: 'Messages' },
          { id: 'analytics', icon: 'chart', label: 'Analytics' },
          { id: 'settings', icon: 'settings', label: 'Settings' },
        ].map(item => (
          <button key={item.id} onClick={() => setCoachNav(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', marginBottom: 4,
            background: coachNav === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            color: coachNav === item.id ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.15s',
          }}>
            <Icon name={item.icon} size={18} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.borderDark}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials="SM" size={32} color={T.primary} />
            <div>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Sarah M.</div>
              <div style={{ color: T.textDim, fontSize: 10 }}>Pro Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {coachNav === 'dashboard' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text }}>Dashboard</h2>
              <p style={{ margin: '6px 0 0', color: T.textMuted, fontSize: 13 }}>Welcome back, Sarah!</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { icon: 'users', label: 'Active Clients', value: '47', color: T.primary },
                { icon: 'target', label: 'Avg Adherence', value: `${avgProgress}%`, color: T.success },
                { icon: 'video', label: 'Pending Reviews', value: '5', color: T.warning },
                { icon: 'alertCircle', label: 'At Risk', value: '3', color: T.danger },
              ].map((s, i) => (
                <div key={i} style={{ background: T.bgCard, borderRadius: 14, padding: 16, border: `1px solid ${T.border}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon name={s.icon} size={18} color={s.color} />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: T.text }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Client List */}
            <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Clients</span>
                <span onClick={() => setCoachNav('members')} style={{ fontSize: 12, color: T.primary, fontWeight: 600, cursor: 'pointer' }}>View All →</span>
              </div>
              {DEMO_MEMBERS.map(m => (
                <div key={m.id} onClick={() => setCoachNav('members')} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                  borderBottom: `1px solid ${T.border}`, cursor: 'pointer', transition: 'background 0.15s',
                }}>
                  <Avatar initials={m.initials} size={34} color={m.status === 'at_risk' ? T.danger : T.primary} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{m.lastActive}</div>
                  </div>
                  <div style={{ width: 80 }}>
                    <ProgressBar value={m.progress * 100} color={m.progress > 0.7 ? T.success : m.progress > 0.5 ? T.warning : T.danger} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: m.progress > 0.7 ? T.success : T.textMuted }}>{Math.round(m.progress * 100)}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        {coachNav === 'members' && (
          <>
            <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: T.text }}>Clients</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {DEMO_MEMBERS.map(m => (
                <div key={m.id} style={{ background: T.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <Avatar initials={m.initials} size={44} color={m.status === 'at_risk' ? T.danger : T.primary} />
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: m.status === 'at_risk' ? T.danger : T.success, fontWeight: 600 }}>
                        {m.status === 'at_risk' ? '⚠ At Risk' : '● Active'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <div><span style={{ color: T.textMuted }}>Adherence</span><br/><strong style={{ color: T.text }}>{Math.round(m.progress * 100)}%</strong></div>
                    <div><span style={{ color: T.textMuted }}>Streak</span><br/><strong style={{ color: T.text }}>{m.streak > 0 ? `🔥 ${m.streak}d` : '—'}</strong></div>
                    <div><span style={{ color: T.textMuted }}>Last Active</span><br/><strong style={{ color: T.text }}>{m.lastActive}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {coachNav === 'content' && (
          <>
            <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800, color: T.text }}>Workouts</h2>
            {DEMO_WORKOUTS.map(w => (
              <div key={w.id} style={{ background: T.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${T.border}`, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{w.title}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>{w.desc} · {w.exercises.length} exercises</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 8, background: T.primaryBg, color: T.primary }}>Active</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {w.exercises.map(e => (
                    <span key={e.name} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: T.bgAlt, color: T.textSecondary }}>{e.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {coachNav === 'videos' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: T.text }}>Video Reviews</h2>
            <p style={{ margin: '0 0 20px', color: T.textMuted, fontSize: 13 }}>Review client form check submissions</p>
            {[
              { client: 'Emma Davis', initials: 'ED', exercise: 'Squat Form Check', time: '2 hours ago', status: 'pending' },
              { client: 'James Wilson', initials: 'JW', exercise: 'Bench Press Form', time: 'Yesterday', status: 'pending' },
              { client: 'Lisa Park', initials: 'LP', exercise: 'Deadlift Review', time: '2 days ago', status: 'approved' },
            ].map((v, i) => (
              <div key={i} style={{ background: T.bgCard, borderRadius: 14, padding: 16, border: `1px solid ${T.border}`, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: T.bgDark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="play" size={22} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{v.exercise}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{v.client} · {v.time}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 8, background: v.status === 'pending' ? T.warningBg : T.successBg, color: v.status === 'pending' ? T.warning : T.success }}>
                  {v.status === 'pending' ? 'Needs Review' : 'Approved'}
                </span>
              </div>
            ))}
          </>
        )}

        {coachNav === 'messages' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: T.text }}>Messages</h2>
            <p style={{ margin: '0 0 20px', color: T.textMuted, fontSize: 13 }}>Client conversations</p>
            {[
              { name: 'Emma Davis', initials: 'ED', msg: 'Can we adjust my macros for this week?', time: '9:15 AM', unread: true },
              { name: 'Lisa Park', initials: 'LP', msg: 'Thanks for the new program! Loving it 💪', time: 'Yesterday', unread: true },
              { name: 'James Wilson', initials: 'JW', msg: 'Feeling great after yesterday\'s session!', time: 'Yesterday', unread: false },
              { name: 'Mike Chen', initials: 'MC', msg: 'Hey coach, been feeling a bit sore...', time: '3 days ago', unread: false },
            ].map((m, i) => (
              <div key={i} style={{ background: T.bgCard, borderRadius: 14, padding: 16, border: `1px solid ${m.unread ? T.primary + '30' : T.border}`, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <Avatar initials={m.initials} size={42} color={T.primary} />
                  {m.unread && <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: T.primary, border: '2px solid #fff' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: m.unread ? 700 : 500, color: T.text }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: T.textDim }}>{m.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: m.unread ? T.textSecondary : T.textMuted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{m.msg}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {coachNav === 'analytics' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: T.text }}>Analytics</h2>
            <p style={{ margin: '0 0 20px', color: T.textMuted, fontSize: 13 }}>Track your coaching business performance</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Monthly Revenue', value: '$11,750', change: '+18%', color: T.success },
                { label: 'Retention Rate', value: '94%', change: '+3%', color: T.primary },
                { label: 'Avg. Adherence', value: '82%', change: '+5%', color: T.warning },
                { label: 'New Clients (30d)', value: '8', change: '+3', color: T.cyan },
              ].map((s, i) => (
                <div key={i} style={{ background: T.bgCard, borderRadius: 14, padding: 18, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{s.value}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.success, background: T.successBg, padding: '2px 8px', borderRadius: 6 }}>↑ {s.change}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: T.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 16 }}>Client Adherence (7-day)</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                {[65, 72, 58, 80, 85, 78, 92].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', height: `${v * 1.1}px`, background: i === 6 ? T.gradient : T.primaryBg, borderRadius: 6, transition: 'height 0.4s ease' }} />
                    <span style={{ fontSize: 10, color: T.textDim }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {coachNav === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70%', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: T.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon name="settings" size={28} color={T.primary} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6 }}>Settings</div>
            <div style={{ fontSize: 13, color: T.textMuted }}>Organization & account settings available in full platform</div>
          </div>
        )}
      </div>
    </div>
  );

  // ── FIT MOBILE APP ──
  const renderFitPhone = () => {
    const workout = selectedWorkout ? DEMO_WORKOUTS.find(w => w.id === selectedWorkout) : null;

    return (
      <div style={{ width: 340, background: '#000', borderRadius: 48, padding: 12, boxShadow: '0 40px 80px rgba(0,0,0,0.35)' }}>
        <div style={{ background: T.bgDarkAlt, borderRadius: 38, overflow: 'hidden', height: 680, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 600 }}>
            <span>9:41</span>
            <div style={{ width: 110, height: 30, background: '#000', borderRadius: 15 }} />
            <div style={{ width: 24, height: 12, background: '#fff', borderRadius: 3 }} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 8px' }}>
            {fitTab === 'home' && !workout && (
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 14, color: T.textDim }}>Welcome back,</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{fitUser.name.split(' ')[0]} 👋</div>
                </div>

                {/* Streak Card */}
                <div style={{ background: T.gradient, borderRadius: 20, padding: 22, marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Current Streak</div>
                      <div style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{fitUser.streak} days</div>
                    </div>
                    <div style={{ fontSize: 42 }}>🔥</div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Adherence</span>
                      <span style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{Math.round(fitUser.progress * 100)}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${fitUser.progress * 100}%`, background: '#fff', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>

                {/* Today's Workouts */}
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Today's Workouts</div>
                {DEMO_WORKOUTS.map(w => (
                  <div key={w.id} onClick={() => { setSelectedWorkout(w.id); setFitTab('home'); }}
                    style={{
                      background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 10,
                      border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{w.title}</div>
                        <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>{w.exercises.length} exercises · {w.desc}</div>
                      </div>
                      <Icon name="chevronRight" size={20} color={T.textDim} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fitTab === 'home' && workout && (
              <div style={{ padding: 20 }}>
                <button onClick={() => setSelectedWorkout(null)} style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 14px',
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18,
                }}>
                  <Icon name="chevronLeft" size={16} color="#fff" /> Back
                </button>

                <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{workout.title}</div>
                <div style={{ fontSize: 13, color: T.textDim, marginBottom: 20 }}>{workout.desc}</div>

                {workout.exercises.map((e, i) => {
                  const done = completions[`${workout.id}_${e.name}`];
                  return (
                    <div key={i} style={{
                      background: done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                      borderRadius: 14, padding: 16, marginBottom: 10,
                      border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: done ? T.success : '#fff' }}>
                            {done && '✓ '}{e.name}
                          </div>
                          <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>{e.sets} sets × {e.reps} reps</div>
                        </div>
                        {!done && (
                          <button onClick={() => completeExercise(workout.id, e.name)} style={{
                            background: T.success, border: 'none', borderRadius: 10, padding: '8px 16px',
                            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          }}>Done</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {fitTab === 'progress' && (
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Your Progress</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Day Streak', value: fitUser.streak, icon: 'fire', color: T.orange },
                    { label: 'Adherence', value: `${Math.round(fitUser.progress * 100)}%`, icon: 'target', color: T.success },
                    { label: 'Workouts', value: 3, icon: 'dumbbell', color: T.primary },
                    { label: 'Completed', value: Object.keys(completions).length, icon: 'check', color: T.cyan },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 18, textAlign: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                        <Icon name={s.icon} size={20} color={s.color} />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: T.textDim, marginTop: 3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fitTab === 'profile' && (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <Avatar initials={fitUser.initials} size={80} color={T.primary} />
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 14 }}>{fitUser.name}</div>
                <div style={{ fontSize: 13, color: T.textDim, marginTop: 4 }}>james@email.com</div>
                <div style={{ marginTop: 28, textAlign: 'left' }}>
                  {[
                    { label: 'Notifications', icon: 'bell', action: () => showToast('Notifications enabled ✅') },
                    { label: 'Goals', icon: 'target', action: () => showToast('Goals: Lose 10lbs, Bench 225 🎯') },
                    { label: 'Settings', icon: 'settings', action: () => showToast('Settings opened ⚙️') },
                    { label: 'My Coach', icon: 'user', action: () => showToast('Coach: Sarah Mitchell 🏋️') },
                    { label: 'Back to Plans', icon: 'arrowLeft', action: () => onNavigate('landing') },
                  ].map(item => (
                    <div key={item.label} onClick={item.action} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: item.label === 'Back to Plans' ? T.dangerBg : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={item.icon} size={18} color={item.label === 'Back to Plans' ? T.danger : T.textDim} />
                      </div>
                      <span style={{ flex: 1, color: item.label === 'Back to Plans' ? T.danger : '#fff', fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                      <Icon name="chevronRight" size={18} color={T.textDim} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Nav */}
          <div style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', padding: '12px 8px 28px', display: 'flex', justifyContent: 'space-around' }}>
            {[
              { id: 'home', icon: 'home', label: 'Home' },
              { id: 'progress', icon: 'chart', label: 'Progress' },
              { id: 'profile', icon: 'user', label: 'Profile' },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setFitTab(tab.id); if (tab.id !== 'home') setSelectedWorkout(null); }}
                style={{
                  background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, cursor: 'pointer', padding: '8px 16px', fontFamily: 'inherit',
                  color: fitTab === tab.id ? T.primary : 'rgba(255,255,255,0.35)',
                }}>
                <Icon name={tab.icon} size={22} />
                <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: '"DM Sans", -apple-system, sans-serif' }}>
      {/* Top Bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,251,254,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.border}`, padding: '0 36px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={() => onNavigate('landing')} style={{
          background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8,
          cursor: 'pointer', fontFamily: 'inherit', color: T.textSecondary, fontSize: 14, fontWeight: 600,
        }}>
          <Icon name="arrowLeft" size={18} color={T.textSecondary} /> Back to Plans
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 10 }}>INÖ</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: T.text }}>Platform Demo</span>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px',
          background: T.successBg, borderRadius: 100, border: `1px solid rgba(16,185,129,0.15)`,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.success }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.success }}>Live Preview — Changes sync between apps</span>
        </div>
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', padding: '24px 36px 12px', gap: 24 }}>
        <div style={{ flex: 1.4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="monitor" size={18} color={T.primary} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>INÖ Coach</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Web dashboard for coaches</div>
            </div>
          </div>
        </div>
        <div style={{ width: 340 + 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: T.pinkBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="smartphone" size={18} color={T.pink} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>INÖ Fit</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Mobile app for clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Side by Side */}
      <div style={{
        display: 'flex', gap: 24, padding: '8px 36px 48px', alignItems: 'flex-start',
        opacity: animIn ? 1 : 0, transform: animIn ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.6s ease',
      }}>
        <div style={{ flex: 1.4, height: 640 }}>{renderCoachPanel()}</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>{renderFitPhone()}</div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 2000,
          background: T.bgCard, borderRadius: 14, padding: '16px 24px',
          boxShadow: T.shadowXl, display: 'flex', alignItems: 'center', gap: 12,
          borderLeft: `4px solid ${T.success}`,
          animation: 'slideIn 0.3s ease',
        }}>
          <Icon name="checkCircle" size={20} color={T.success} />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{toast}</span>
        </div>
      )}
    </div>
  );
});

// ════════════════════════════════════════════════════════════════
// MAIN APP ROUTER
// ════════════════════════════════════════════════════════════════
export default function INOPlatformUnified() {
  const [page, setPage] = useState('landing');

  const handleNavigate = useCallback((target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      {page === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {page === 'demo' && <DemoPage onNavigate={handleNavigate} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: "DM Sans", -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </>
  );
}
