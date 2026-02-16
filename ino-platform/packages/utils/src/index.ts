// ════════════════════════════════════════════════════════════════
// INÖ PLATFORM — SHARED UTILITIES
// ════════════════════════════════════════════════════════════════

// ── DATE & TIME ───────────────────────────────────────────────

export const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const daysBetween = (a: string, b: string): number =>
  Math.floor(Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000);

export const isToday = (iso: string): boolean =>
  new Date(iso).toDateString() === new Date().toDateString();

// ── ADHERENCE ─────────────────────────────────────────────────

export const computeAdherence = (
  completed: number,
  assigned: number,
): number => (assigned === 0 ? 0 : Math.round((completed / assigned) * 100));

export const adherenceColor = (pct: number): string =>
  pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

export const adherenceLabel = (pct: number): string =>
  pct >= 80 ? 'On Track' : pct >= 50 ? 'Needs Attention' : 'At Risk';

// ── READINESS ─────────────────────────────────────────────────

export const computeReadiness = (
  sleep: number, energy: number, stress: number, soreness: number,
): number => {
  // Weighted score: sleep 30%, energy 30%, stress 20% (inverted), soreness 20% (inverted)
  const norm = (v: number) => ((v - 1) / 4) * 100;
  const inv = (v: number) => ((5 - v) / 4) * 100;
  return Math.round(norm(sleep) * 0.3 + norm(energy) * 0.3 + inv(stress) * 0.2 + inv(soreness) * 0.2);
};

// ── FORMATTING ────────────────────────────────────────────────

export const formatCurrency = (cents: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    .format(cents / 100);

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-US').format(n);

export const formatPercent = (n: number): string => `${Math.round(n)}%`;

export const initials = (name: string): string =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const truncate = (s: string, len: number): string =>
  s.length <= len ? s : s.slice(0, len - 1) + '…';

// ── VALIDATION ────────────────────────────────────────────────

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isStrongPassword = (pw: string): boolean =>
  pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw);

// ── PLAN LIMITS ───────────────────────────────────────────────

export const PLAN_LIMITS = {
  starter: { clients: 20, automation: false, videoReview: false, teams: false, analytics: 'basic' },
  pro:     { clients: 50, automation: true,  videoReview: true,  teams: false, analytics: 'advanced' },
  scale:   { clients: 999, automation: true, videoReview: true,  teams: true,  analytics: 'advanced' },
} as const;

export const canAccess = (tier: keyof typeof PLAN_LIMITS, feature: string): boolean => {
  const limits = PLAN_LIMITS[tier];
  return (limits as any)[feature] === true || (limits as any)[feature] === 'advanced';
};

// ── RETRY / DEBOUNCE ──────────────────────────────────────────

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1000,
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (e) { if (i === attempts - 1) throw e; await sleep(delayMs * (i + 1)); }
  }
  throw new Error('Unreachable');
};

export const debounce = <T extends (...args: any[]) => any>(fn: T, ms: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};
