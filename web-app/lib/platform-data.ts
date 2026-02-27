/**
 * INÖ Platform — marketing & pricing data
 * Landing page, pricing tiers, FAQ, comparison, demo mock data.
 */

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 129,
    period: '/mo',
    desc: 'Everything you need to coach professionally',
    clients: '20 clients',
    features: [
      'Workout Builder & Templates',
      'Exercise Video Library',
      'Client Messaging',
      'Progress Photo Tracking',
      'Basic Check-ins',
      'Nutrition Guidelines',
    ],
    missing: ['Automation', 'Advanced Check-ins', 'Client Flags', 'Deep Analytics'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 249,
    period: '/mo',
    desc: 'The full toolkit to scale past 30+ clients',
    clients: '50 clients',
    features: [
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
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 399,
    period: '/mo',
    desc: 'For coaching teams running a real operation',
    clients: '100+ clients',
    features: [
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
    popular: false,
  },
] as const;

export const FEATURES = [
  {
    icon: 'dumbbell',
    color: 'primary',
    title: 'Workout Builder',
    desc: 'Create, assign, and manage training programs with a drag-and-drop builder. Template entire mesocycles in minutes.',
  },
  {
    icon: 'video',
    color: 'pink',
    title: 'Form Video Review',
    desc: 'Clients submit form check videos directly in-app. Review, annotate, and send feedback without leaving the platform.',
  },
  {
    icon: 'alertCircle',
    color: 'danger',
    title: 'Client Risk Flags',
    desc: 'Automatic alerts when clients miss sessions, drop adherence, or show signs of disengagement. Intervene before they churn.',
  },
  {
    icon: 'zap',
    color: 'warning',
    title: 'Smart Automation',
    desc: 'Client misses 2 workouts → auto-send check-in → flag coach after 48h. Set rules once, let them run. No manual follow-up.',
  },
  {
    icon: 'heartPulse',
    color: 'success',
    title: 'Readiness & Check-ins',
    desc: 'Daily readiness scores, weekly check-ins, and progress photo tracking — all synced to the coach dashboard.',
  },
  {
    icon: 'chart',
    color: 'cyan',
    title: 'Analytics Dashboard',
    desc: 'Client adherence trends, revenue tracking, retention rates, and business performance — all in one view.',
  },
] as const;

export const TESTIMONIALS = [
  {
    name: 'Marcus Rivera',
    role: 'Online Strength Coach',
    initials: 'MR',
    color: 'primary',
    quote: 'Went from 18 to 62 clients in 4 months. The automation handles what used to take me 3 hours a day.',
    metric: '18 → 62 clients',
  },
  {
    name: 'Jenna Kowalski',
    role: 'Nutrition & Fitness Coach',
    initials: 'JK',
    color: 'pink',
    quote: 'My clients love the app. Check-in completion went from maybe 40% to over 90%. It changed my entire business.',
    metric: '90% check-in rate',
  },
  {
    name: 'David Okonkwo',
    role: 'Gym Owner & Head Coach',
    initials: 'DO',
    color: 'cyan',
    quote: "We run 100+ online clients alongside our gym. INÖ is the only platform that didn't break at scale.",
    metric: '100+ clients managed',
  },
] as const;

export const FAQ_DATA = [
  {
    q: 'Can my clients actually use this app?',
    a: "Yes. INÖ Fit is designed to be dead simple — your clients download it, enter your coach code, and they're in. No confusing onboarding, no tech support calls. If they can use Instagram, they can use INÖ Fit.",
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
] as const;

export const COMPARISON_FEATURES = [
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
] as const;

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

export const YEARLY_DISCOUNT = 0.2; // 20% off
