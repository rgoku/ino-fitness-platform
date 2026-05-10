/**
 * Enterprise Layer — Multi-coach organizations, corporate wellness, franchise system.
 */

export interface Organization {
  id: string;
  name: string;
  type: 'gym' | 'studio' | 'corporate' | 'franchise' | 'medical';
  plan: 'team' | 'enterprise' | 'custom';
  coaches: CoachMember[];
  totalClients: number;
  mrr: number;
  createdAt: string;
  branding?: WhiteLabelConfig;
}

export interface CoachMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'head_coach' | 'coach' | 'assistant';
  clientCount: number;
  revenue: number;
  compliance: number;
  joinedAt: string;
}

export interface WhiteLabelConfig {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  appName: string;
  domain: string;
  hidePoweredBy: boolean;
}

export interface CorporateWellnessMetrics {
  orgId: string;
  totalEmployees: number;
  activeParticipants: number;
  participationRate: number;
  avgWellnessScore: number;
  totalWorkouts: number;
  avgStepsPerDay: number;
  avgSleepHours: number;
  healthRiskReduction: number; // %
  estimatedHealthcareSavings: number; // $
  topDepartments: { name: string; score: number }[];
  monthlyTrend: { month: string; score: number }[];
}

// ─── Role Permissions ────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<CoachMember['role'], string[]> = {
  owner: ['*'],
  head_coach: [
    'view_all_clients', 'manage_coaches', 'view_revenue', 'manage_programs',
    'manage_billing', 'view_analytics', 'manage_branding',
  ],
  coach: [
    'view_own_clients', 'manage_own_programs', 'view_own_analytics',
    'send_messages', 'manage_check_ins',
  ],
  assistant: [
    'view_assigned_clients', 'send_messages', 'view_check_ins',
  ],
};

export function hasPermission(role: CoachMember['role'], permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes('*') || perms.includes(permission);
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const MOCK_ORG: Organization = {
  id: 'org-1',
  name: 'Elite Performance Coaching',
  type: 'gym',
  plan: 'enterprise',
  totalClients: 142,
  mrr: 28400,
  createdAt: '2025-06-01',
  coaches: [
    { id: 'co1', name: 'Sarah Mitchell', email: 'sarah@elite.fit', role: 'owner', clientCount: 23, revenue: 5727, compliance: 91, joinedAt: '2025-06-01' },
    { id: 'co2', name: 'Mike Chen', email: 'mike@elite.fit', role: 'head_coach', clientCount: 35, revenue: 8715, compliance: 88, joinedAt: '2025-07-15' },
    { id: 'co3', name: 'Emma Rodriguez', email: 'emma@elite.fit', role: 'coach', clientCount: 28, revenue: 6972, compliance: 94, joinedAt: '2025-09-01' },
    { id: 'co4', name: 'Jake Park', email: 'jake@elite.fit', role: 'coach', clientCount: 31, revenue: 4961, compliance: 85, joinedAt: '2025-10-15' },
    { id: 'co5', name: 'Ana Silva', email: 'ana@elite.fit', role: 'assistant', clientCount: 25, revenue: 2025, compliance: 90, joinedAt: '2026-01-10' },
  ],
};

export const MOCK_WELLNESS: CorporateWellnessMetrics = {
  orgId: 'corp-1',
  totalEmployees: 500,
  activeParticipants: 312,
  participationRate: 62.4,
  avgWellnessScore: 74,
  totalWorkouts: 4820,
  avgStepsPerDay: 8400,
  avgSleepHours: 7.1,
  healthRiskReduction: 18,
  estimatedHealthcareSavings: 156000,
  topDepartments: [
    { name: 'Engineering', score: 82 },
    { name: 'Sales', score: 78 },
    { name: 'Marketing', score: 75 },
    { name: 'Operations', score: 71 },
    { name: 'Finance', score: 68 },
  ],
  monthlyTrend: [
    { month: 'Nov', score: 64 },
    { month: 'Dec', score: 62 },
    { month: 'Jan', score: 68 },
    { month: 'Feb', score: 71 },
    { month: 'Mar', score: 73 },
    { month: 'Apr', score: 74 },
  ],
};
