// ════════════════════════════════════════════════════════════════
// INÖ PLATFORM — SHARED TYPES
// Single source of truth for all domain models
// ════════════════════════════════════════════════════════════════

// ── IDENTITY ──────────────────────────────────────────────────

export type UserId = string & { readonly __brand: 'UserId' };
export type CoachId = string & { readonly __brand: 'CoachId' };
export type ClientId = string & { readonly __brand: 'ClientId' };
export type WorkoutId = string & { readonly __brand: 'WorkoutId' };
export type ExerciseId = string & { readonly __brand: 'ExerciseId' };
export type VideoId = string & { readonly __brand: 'VideoId' };
export type MessageId = string & { readonly __brand: 'MessageId' };
export type CheckInId = string & { readonly __brand: 'CheckInId' };

// ── AUTH ──────────────────────────────────────────────────────

export type Role = 'coach' | 'assistant' | 'admin' | 'client';

export interface User {
  id: UserId;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  lastActiveAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

// ── COACH ─────────────────────────────────────────────────────

export type PlanTier = 'starter' | 'pro' | 'scale';

export interface Coach {
  id: CoachId;
  userId: UserId;
  businessName: string;
  planTier: PlanTier;
  clientCount: number;
  clientLimit: number;
  onboardedAt: string;
  brandColor: string | null;
  logoUrl: string | null;
}

export interface CoachStats {
  activeClients: number;
  avgAdherence: number;        // 0-100
  retentionRate: number;       // 0-100
  atRiskCount: number;
  pendingVideoReviews: number;
  monthlyRevenue: number;
  revenueChange: number;       // percentage
}

// ── CLIENT ────────────────────────────────────────────────────

export type ClientStatus = 'active' | 'at_risk' | 'churned' | 'paused';

export interface Client {
  id: ClientId;
  userId: UserId;
  coachId: CoachId;
  status: ClientStatus;
  adherence: number;           // 0-100
  streak: number;              // days
  lastActiveAt: string;
  startDate: string;
  goals: string[];
  notes: string;
}

export interface ClientRiskFlag {
  clientId: ClientId;
  type: 'missed_sessions' | 'low_adherence' | 'no_checkin' | 'low_readiness';
  severity: 'low' | 'medium' | 'high';
  message: string;
  triggeredAt: string;
  resolvedAt: string | null;
}

// ── WORKOUTS ──────────────────────────────────────────────────

export interface Exercise {
  id: ExerciseId;
  name: string;
  sets: number;
  reps: number | string;       // "8-12" or 8
  weight: number | null;
  restSeconds: number;
  notes: string;
  videoUrl: string | null;
}

export interface Workout {
  id: WorkoutId;
  coachId: CoachId;
  title: string;
  description: string;
  exercises: Exercise[];
  isTemplate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutAssignment {
  workoutId: WorkoutId;
  clientId: ClientId;
  scheduledDate: string;
  completedAt: string | null;
  completions: Record<ExerciseId, ExerciseCompletion>;
}

export interface ExerciseCompletion {
  exerciseId: ExerciseId;
  completedAt: string;
  actualSets: number;
  actualReps: number;
  actualWeight: number | null;
  rpe: number | null;          // 1-10
  notes: string;
}

// ── CHECK-INS ─────────────────────────────────────────────────

export interface CheckIn {
  id: CheckInId;
  clientId: ClientId;
  coachId: CoachId;
  type: 'daily_readiness' | 'weekly_checkin' | 'progress_photo';
  data: ReadinessData | WeeklyData | ProgressPhotoData;
  submittedAt: string;
  reviewedAt: string | null;
  coachNotes: string | null;
}

export interface ReadinessData {
  sleepQuality: number;        // 1-5
  energyLevel: number;         // 1-5
  stressLevel: number;         // 1-5
  soreness: number;            // 1-5
  readinessScore: number;      // computed 1-100
  notes: string;
}

export interface WeeklyData {
  weight: number | null;
  bodyFat: number | null;
  measurements: Record<string, number>;
  wins: string;
  struggles: string;
  questions: string;
}

export interface ProgressPhotoData {
  photoUrls: string[];
  notes: string;
}

// ── VIDEO REVIEW ──────────────────────────────────────────────

export type VideoStatus = 'pending' | 'reviewed' | 'approved' | 'needs_redo';

export interface VideoReview {
  id: VideoId;
  clientId: ClientId;
  coachId: CoachId;
  exerciseName: string;
  videoUrl: string;
  thumbnailUrl: string;
  status: VideoStatus;
  coachFeedback: string | null;
  annotations: VideoAnnotation[];
  submittedAt: string;
  reviewedAt: string | null;
  expiresAt: string;           // 90-day rolling retention
}

export interface VideoAnnotation {
  timestampMs: number;
  text: string;
  type: 'correction' | 'praise' | 'note';
}

// ── MESSAGING ─────────────────────────────────────────────────

export interface Message {
  id: MessageId;
  senderId: UserId;
  recipientId: UserId;
  content: string;
  readAt: string | null;
  sentAt: string;
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'image' | 'video' | 'workout' | 'checkin';
  url: string;
  referenceId: string;
}

export interface Conversation {
  clientId: ClientId;
  lastMessage: Message;
  unreadCount: number;
}

// ── AUTOMATION ────────────────────────────────────────────────

export type AutomationTrigger =
  | { type: 'missed_workouts'; count: number }
  | { type: 'no_checkin'; days: number }
  | { type: 'low_readiness'; threshold: number }
  | { type: 'streak_milestone'; days: number };

export type AutomationAction =
  | { type: 'send_message'; templateId: string }
  | { type: 'flag_coach'; severity: 'low' | 'medium' | 'high' }
  | { type: 'assign_workout'; workoutId: WorkoutId }
  | { type: 'send_checkin'; checkinType: string };

export interface AutomationRule {
  id: string;
  coachId: CoachId;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  delayMinutes: number;
  enabled: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
  triggerCount: number;
}

// ── BILLING ───────────────────────────────────────────────────

export interface Subscription {
  id: string;
  coachId: CoachId;
  planTier: PlanTier;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd: string | null;
}

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  clientLimit: number;
  features: string[];
}

// ── API RESPONSES ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ── EVENTS (for automation engine) ────────────────────────────

export type DomainEvent =
  | { type: 'workout.completed'; clientId: ClientId; workoutId: WorkoutId }
  | { type: 'workout.missed'; clientId: ClientId; workoutId: WorkoutId }
  | { type: 'checkin.submitted'; clientId: ClientId; checkinId: CheckInId }
  | { type: 'checkin.missed'; clientId: ClientId }
  | { type: 'client.at_risk'; clientId: ClientId; reason: string }
  | { type: 'client.milestone'; clientId: ClientId; milestone: string }
  | { type: 'video.submitted'; clientId: ClientId; videoId: VideoId }
  | { type: 'video.reviewed'; videoId: VideoId; status: VideoStatus };
