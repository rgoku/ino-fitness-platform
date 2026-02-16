/**
 * INÖ API Client
 * Typed fetch wrapper with automatic token refresh and error handling.
 * Every router endpoint has a corresponding method.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Token Storage ─────────────────────────────────────────────

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokens = {
  get: () => ({ accessToken, refreshToken }),
  set: (access: string, refresh: string) => {
    accessToken = access;
    refreshToken = refresh;
    localStorage.setItem("ino_access", access);
    localStorage.setItem("ino_refresh", refresh);
  },
  load: () => {
    accessToken = localStorage.getItem("ino_access");
    refreshToken = localStorage.getItem("ino_refresh");
  },
  clear: () => {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem("ino_access");
    localStorage.removeItem("ino_refresh");
  },
};

// ── Core Fetch ────────────────────────────────────────────────

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiError {
  code: string;
  message: string;
  status: number;
}

class ApiRequestError extends Error {
  code: string;
  status: number;
  constructor(err: ApiError) {
    super(err.message);
    this.code = err.code;
    this.status = err.status;
  }
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    tokens.clear();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  const data = await res.json();
  tokens.set(data.access_token, data.refresh_token);
  return data.access_token;
}

async function request<T>(method: Method, path: string, body?: unknown, retry = true): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Token expired → refresh and retry once
  if (res.status === 401 && retry && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        refreshQueue.forEach(cb => cb(newToken));
        refreshQueue = [];
        isRefreshing = false;
        return request<T>(method, path, body, false);
      } catch {
        isRefreshing = false;
        throw new ApiRequestError({ code: "UNAUTHORIZED", message: "Session expired", status: 401 });
      }
    } else {
      // Queue this request until refresh completes
      return new Promise<T>((resolve) => {
        refreshQueue.push(() => resolve(request<T>(method, path, body, false)));
      });
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ code: "UNKNOWN", message: res.statusText }));
    throw new ApiRequestError({ code: err.code || err.detail || "ERROR", message: err.message || err.detail || res.statusText, status: res.status });
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────

export const auth = {
  signup: (email: string, password: string, name: string) =>
    request<{ access_token: string; refresh_token: string }>("POST", "/auth/signup", { email, password, name, role: "coach" }),

  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>("POST", "/auth/login", { email, password }),

  me: () => request<{ id: string; email: string; name: string; role: string; avatar_url: string | null }>("GET", "/auth/me"),
};

// ── Coaches ───────────────────────────────────────────────────

export const coaches = {
  profile: () => request<any>("GET", "/coaches/me"),

  update: (data: { business_name?: string; brand_color?: string }) =>
    request<any>("PATCH", "/coaches/me", data),

  stats: () => request<{
    active_clients: number; avg_adherence: number; retention_rate: number;
    at_risk_count: number; pending_video_reviews: number;
    monthly_revenue: number; revenue_change: number;
  }>("GET", "/coaches/me/stats"),
};

// ── Clients ───────────────────────────────────────────────────

interface ClientListParams { status?: string; page?: number; page_size?: number }

export const clients = {
  list: (params?: ClientListParams) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    const qs = q.toString();
    return request<{ data: any[]; meta: any }>("GET", `/clients/${qs ? "?" + qs : ""}`);
  },

  get: (id: string) => request<any>("GET", `/clients/${id}`),

  create: (data: { email: string; name: string; goals?: string[]; notes?: string }) =>
    request<{ id: string; status: string; coach_code: string }>("POST", "/clients/", data),

  update: (id: string, data: { status?: string; goals?: string[]; notes?: string }) =>
    request<any>("PATCH", `/clients/${id}`, data),

  riskFlags: (id: string) => request<{ data: any[] }>("GET", `/clients/${id}/risk-flags`),

  resolveFlag: (clientId: string, flagId: string) =>
    request<any>("POST", `/clients/${clientId}/risk-flags/${flagId}/resolve`),
};

// ── Workouts ──────────────────────────────────────────────────

interface ExerciseInput { name: string; sets: number; reps: string; weight?: number; rest_seconds?: number; notes?: string }
interface WorkoutInput { title: string; description?: string; exercises: ExerciseInput[]; is_template?: boolean; tags?: string[] }

export const workouts = {
  list: (templateOnly = false) =>
    request<{ data: any[] }>("GET", `/workouts/?template_only=${templateOnly}`),

  get: (id: string) => request<any>("GET", `/workouts/${id}`),

  create: (data: WorkoutInput) => request<{ id: string }>("POST", "/workouts/", data),

  update: (id: string, data: WorkoutInput) => request<any>("PUT", `/workouts/${id}`, data),

  delete: (id: string) => request<void>("DELETE", `/workouts/${id}`),

  assign: (workoutId: string, clientId: string, scheduledDate: string) =>
    request<any>("POST", `/workouts/${workoutId}/assign`, { client_id: clientId, scheduled_date: scheduledDate }),
};

// ── Check-ins ─────────────────────────────────────────────────

export const checkins = {
  clientHistory: (clientId: string, type?: string) => {
    const q = type ? `?type=${type}` : "";
    return request<{ data: any[] }>("GET", `/checkins/client/${clientId}${q}`);
  },

  review: (checkinId: string, notes: string) =>
    request<any>("POST", `/checkins/${checkinId}/review`, { notes }),
};

// ── Videos ────────────────────────────────────────────────────

export const videos = {
  pending: () => request<{ data: any[] }>("GET", "/videos/pending"),

  get: (id: string) => request<any>("GET", `/videos/${id}`),

  review: (id: string, data: { status: string; feedback?: string; annotations?: any[] }) =>
    request<any>("POST", `/videos/${id}/review`, data),
};

// ── Messages ──────────────────────────────────────────────────

export const messages = {
  conversations: () => request<{ data: any[] }>("GET", "/messages/conversations"),

  history: (userId: string, before?: string) => {
    const q = before ? `?before=${before}` : "";
    return request<{ data: any[]; has_more: boolean }>("GET", `/messages/conversations/${userId}${q}`);
  },

  send: (recipientId: string, content: string, attachmentType?: string, attachmentUrl?: string) =>
    request<{ id: string; sent_at: string }>("POST", "/messages/send", {
      recipient_id: recipientId, content, attachment_type: attachmentType, attachment_url: attachmentUrl,
    }),

  markRead: (userId: string) => request<any>("POST", `/messages/conversations/${userId}/read`),
};

// ── Automation ────────────────────────────────────────────────

interface RuleInput {
  name: string;
  trigger: { type: string; value: number };
  actions: { type: string; config?: Record<string, any> }[];
  delay_minutes?: number;
  enabled?: boolean;
}

export const automation = {
  list: () => request<{ data: any[] }>("GET", "/automation/rules"),

  create: (data: RuleInput) => request<{ id: string }>("POST", "/automation/rules", data),

  update: (id: string, data: RuleInput) => request<any>("PUT", `/automation/rules/${id}`, data),

  delete: (id: string) => request<void>("DELETE", `/automation/rules/${id}`),

  toggle: (id: string) => request<{ enabled: boolean }>("POST", `/automation/rules/${id}/toggle`),

  log: (id: string) => request<{ data: any[] }>("GET", `/automation/rules/${id}/log`),
};

// ── Billing ───────────────────────────────────────────────────

export const billing = {
  plans: () => request<{ data: any[] }>("GET", "/billing/plans"),

  subscription: () => request<any>("GET", "/billing/subscription"),

  checkout: (planTier: string, billingCycle = "monthly") =>
    request<{ checkout_url: string }>("POST", "/billing/checkout", { plan_tier: planTier, billing_cycle: billingCycle }),

  updatePlan: (planTier: string) => request<any>("POST", "/billing/subscription/update", { plan_tier: planTier }),

  cancel: () => request<any>("POST", "/billing/subscription/cancel"),
};

// ── Default export ────────────────────────────────────────────

const api = { auth, coaches, clients, workouts, checkins, videos, messages, automation, billing, tokens };
export default api;
