/**
 * INÖ Platform — data layer for the landing page.
 * Outcome-driven copy, realistic testimonials, coach-focused language.
 */

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 129,
    period: '/mo',
    desc: 'Everything you need to run a real coaching business',
    clients: '20 clients',
    features: [
      'AI Program Builder',
      'Client Mobile App',
      'Progress Tracking',
      'Messaging & Check-ins',
      'Form Video Uploads',
      'Exercise Library',
    ],
    missing: ['Automation Engine', 'Real-time Form Feedback', 'Client Intelligence', 'Team Access'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    period: '/mo',
    desc: 'Scale past 50+ clients without burning out',
    clients: '50 clients',
    features: [
      'Everything in Starter',
      'AI Automation Workflows',
      'Real-time Form Feedback',
      'Client Intelligence & Risk Flags',
      'Readiness & Recovery Scoring',
      'Custom Branding',
      'Priority Support',
    ],
    missing: ['Team Access', 'API Access'],
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 399,
    period: '/mo',
    desc: 'For coaching teams running 100+ clients',
    clients: '100+ clients',
    features: [
      'Everything in Pro',
      'Team Access & Roles',
      'Shared Inbox',
      'Advanced Analytics',
      'White-label Branding',
      'Dedicated Account Manager',
      'API Access',
    ],
    missing: [],
    popular: false,
  },
] as const;

export const FEATURES = [
  {
    icon: 'cpu',
    title: 'AI Program Engine',
    desc: 'Generates individualized programs from client goals, history, and feedback. Not templates — actual programming logic.',
  },
  {
    icon: 'zap',
    title: 'Workflow Automation',
    desc: 'Missed check-in → automated follow-up. Plateau detected → protocol adjusts. You set the rules once. The system runs.',
  },
  {
    icon: 'video',
    title: 'Real-time Form Feedback',
    desc: 'Clients film a set. Get cue-level feedback in seconds. You review what matters, skip what doesn\'t.',
  },
  {
    icon: 'alertCircle',
    title: 'Client Intelligence',
    desc: 'Risk flags surface clients drifting before they churn. Adherence, recovery, engagement — monitored continuously.',
  },
  {
    icon: 'heartPulse',
    title: 'Readiness & Recovery',
    desc: 'Daily readiness scores, RPE trends, sleep signals. Programs adjust to how the client actually shows up.',
  },
  {
    icon: 'chart',
    title: 'Business Intelligence',
    desc: 'Retention, revenue, client LTV. Finally know which programs work, which clients stick, and where to focus.',
  },
] as const;

export const TESTIMONIALS = [
  {
    name: 'Marcus Rivera',
    role: 'Strength Coach · Austin, TX',
    initials: 'MR',
    quote: 'I coached 22 clients before INÖ. Now I run 74 — without hiring. The automation handles what used to take me three hours a day.',
    metric: '22 → 74 clients',
  },
  {
    name: 'Jenna Kowalski',
    role: 'Powerlifting Coach · Chicago',
    initials: 'JK',
    quote: "My check-in completion went from 38% to 91%. Clients actually respond now because the prompts feel personal — even though they're automated.",
    metric: '91% completion',
  },
  {
    name: 'David Okonkwo',
    role: 'Hybrid Gym + Online · Atlanta',
    initials: 'DO',
    quote: 'We tried Trainerize, TrueCoach, Everfit. INÖ is the first platform that didn\'t break when we crossed 80 clients. It\'s built like actual software.',
    metric: '110 active clients',
  },
] as const;

export const BEFORE_AFTER = {
  before: {
    label: 'Before INÖ',
    items: [
      'Capped at 20–30 clients before quality drops',
      'Manual check-ins every Sunday night',
      'Spreadsheets, Google Docs, and chaos',
      'Burnout disguised as "being busy"',
      'Trading time for revenue, forever',
    ],
  },
  after: {
    label: 'After INÖ',
    items: [
      '80–100+ clients with zero drop in quality',
      'Check-ins automated, responses contextual',
      'One system. Every client. Every workflow.',
      'Work 25 hours/week — coach at full capacity',
      'A real business that scales beyond you',
    ],
  },
} as const;

export const PROBLEM_SOLUTION = {
  problem: {
    title: 'The coaching ceiling is real.',
    desc: 'You can only coach so many clients before quality drops, check-ins pile up, and every program becomes a template. You trade freedom for revenue — or revenue for your sanity.',
  },
  solution: {
    title: 'INÖ is the system that breaks it.',
    desc: 'AI handles the check-ins, programs, and feedback at scale. Every client feels seen. You work less. Your business grows. The infrastructure scales with you — not against you.',
  },
} as const;

export const MARQUEE_ITEMS = [
  'Coaches scaling to 100+ clients',
  'Real infrastructure — not templates',
  'AI-powered programming',
  'Real-time form feedback',
  'Built for coaches who coach',
  'Automation that feels personal',
] as const;

export const FAQ_DATA = [
  {
    q: 'How is this different from Trainerize or TrueCoach?',
    a: 'Those tools work at 10–20 clients and break at 40+. INÖ was engineered for scale — real AI programming, automated workflows, and a client app that actually gets used. You\'re not paying for a CMS with workouts on top.',
  },
  {
    q: 'Do my clients need a separate app?',
    a: "They get INÖ Fit free — a mobile app branded to your coaching. They open it, see their program, log their sets, film form checks. If they can use Instagram, they can use this.",
  },
  {
    q: 'What happens to my current programs and clients?',
    a: 'We migrate everything. CSV, spreadsheet, or existing platform — we handle the transfer. Pro and Scale plans get white-glove onboarding at no extra cost.',
  },
  {
    q: 'Is the AI actually good, or is this marketing?',
    a: 'Fair question. The engine uses your programming logic and client data — not generic "AI workout" slop. You set the rules, the templates, and the autoregulation parameters. It executes them at scale. You stay in control.',
  },
  {
    q: 'What if I want to cancel?',
    a: 'Month-to-month, no contracts. Cancel from your dashboard anytime. We keep your data for 90 days in case you come back.',
  },
  {
    q: 'Who is this not for?',
    a: 'Coaches running under 10 clients — you don\'t need this yet. Also coaches who don\'t want to systematize (the AI mirrors YOUR approach; it doesn\'t invent one for you).',
  },
] as const;

export const COMPARISON_FEATURES = [
  { name: 'Clients included', starter: 'Up to 20', pro: 'Up to 50', scale: '100+' },
  { name: 'AI Program Builder', starter: true, pro: true, scale: true },
  { name: 'Client Mobile App', starter: true, pro: true, scale: true },
  { name: 'Progress Tracking', starter: true, pro: true, scale: true },
  { name: 'Messaging & Check-ins', starter: true, pro: true, scale: true },
  { name: 'Exercise Library', starter: true, pro: true, scale: true },
  { name: 'Form Video Uploads', starter: true, pro: true, scale: true },
  { name: 'AI Automation Workflows', starter: false, pro: true, scale: true },
  { name: 'Real-time Form Feedback', starter: false, pro: true, scale: true },
  { name: 'Client Intelligence & Flags', starter: false, pro: true, scale: true },
  { name: 'Readiness & Recovery', starter: false, pro: true, scale: true },
  { name: 'Custom Branding', starter: false, pro: true, scale: true },
  { name: 'Team Access & Roles', starter: false, pro: false, scale: true },
  { name: 'Shared Inbox', starter: false, pro: false, scale: true },
  { name: 'Advanced Analytics', starter: false, pro: false, scale: true },
  { name: 'White-label Branding', starter: false, pro: false, scale: true },
  { name: 'API Access', starter: false, pro: false, scale: true },
  { name: 'Dedicated Account Manager', starter: false, pro: false, scale: true },
  { name: 'Priority Support', starter: 'Email', pro: 'Email', scale: 'Phone & Chat' },
] as const;

export const YEARLY_DISCOUNT = 0.2;

export const DEMO_MEMBERS = [
  { id: 'm1', name: 'James Wilson', initials: 'JW', status: 'active', progress: 0.84, streak: 12, lastActive: 'Today' },
  { id: 'm2', name: 'Emma Davis', initials: 'ED', status: 'active', progress: 0.92, streak: 28, lastActive: 'Today' },
  { id: 'm3', name: 'Mike Chen', initials: 'MC', status: 'at_risk', progress: 0.45, streak: 0, lastActive: '3 days ago' },
  { id: 'm4', name: 'Lisa Park', initials: 'LP', status: 'active', progress: 0.78, streak: 7, lastActive: 'Yesterday' },
] as const;

export const DEMO_WORKOUTS = [
  {
    id: 'u1',
    title: 'Push Day',
    desc: 'Chest, shoulders & triceps',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Incline DB Press', sets: 3, reps: 12 },
      { name: 'Cable Flyes', sets: 3, reps: 15 },
      { name: 'Shoulder Press', sets: 4, reps: 10 },
      { name: 'Lateral Raises', sets: 3, reps: 15 },
      { name: 'Tricep Pushdowns', sets: 3, reps: 12 },
    ],
  },
  {
    id: 'u2',
    title: 'Pull Day',
    desc: 'Back & biceps',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 6 },
      { name: 'Pull-ups', sets: 4, reps: 8 },
      { name: 'Barbell Rows', sets: 4, reps: 10 },
      { name: 'Face Pulls', sets: 3, reps: 15 },
    ],
  },
  {
    id: 'u3',
    title: 'Leg Day',
    desc: 'Quads, hamstrings & glutes',
    exercises: [
      { name: 'Squats', sets: 4, reps: 8 },
      { name: 'Romanian Deadlift', sets: 4, reps: 10 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Calf Raises', sets: 4, reps: 15 },
    ],
  },
] as const;
