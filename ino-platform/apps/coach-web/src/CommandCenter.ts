/**
 * CommandCenter Bridge
 * 
 * Loads real data from the API when available and maps it to the shape
 * the Command Center UI expects. Falls back to demo data on error.
 * 
 * This is the adapter layer between the API and the existing UI component.
 * Once the Command Center is fully migrated, this becomes unnecessary.
 */
import { useState, useEffect } from "react";
import api from "./lib/api";
import { useAuth } from "./lib/auth";

// Re-export the actual Command Center UI
// In production this would import from a refactored component.
// For now it uses the monolith which has its own hardcoded data.
// The bridge replaces that data when API is available.

// ── Types matching the Command Center's expected shape ────────

interface CCClient {
  id: number;
  name: string;
  ini: string;
  c: string;
  email: string;
  program: string;
  phase: string;
  compliance: number;
  streak: number;
  lastActive: string;
  status: "on-track" | "at-risk" | "needs-monitoring";
  weight: number[];
  weightUnit: string;
  lastCheckin: string;
  checkinData: { sleep: number; stress: number; energy: number; soreness: number; adherence: number };
  flags: string[];
  notes: string;
  messages: { from: string; text: string; time: string }[];
}

// ── Color palette for client avatars ──────────────────────────

const COLORS = ["#818CF8", "#F59E0B", "#F43F5E", "#10B981", "#06B6D4", "#8B5CF6", "#EC4899", "#14B8A6"];

function statusToCC(status: string): "on-track" | "at-risk" | "needs-monitoring" {
  if (status === "at_risk") return "at-risk";
  if (status === "active") return "on-track";
  return "needs-monitoring";
}

function initials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ── Data loader ───────────────────────────────────────────────

export async function loadDashboardData(): Promise<{
  clients: CCClient[];
  stats: any;
  coachProfile: any;
} | null> {
  try {
    const [clientsRes, stats, profile] = await Promise.all([
      api.clients.list({ page_size: 50 }),
      api.coaches.stats(),
      api.coaches.profile(),
    ]);

    const clients: CCClient[] = clientsRes.data.map((c: any, i: number) => ({
      id: i + 1,
      name: c.name,
      ini: initials(c.name),
      c: COLORS[i % COLORS.length],
      email: c.email,
      program: "Program",           // populated when workout assignments are loaded
      phase: "",
      compliance: Math.round(c.adherence || 0),
      streak: c.streak || 0,
      lastActive: c.last_active_at ? formatRelative(c.last_active_at) : "—",
      status: statusToCC(c.status),
      weight: [],                    // populated from check-in history
      weightUnit: "kg",
      lastCheckin: "—",
      checkinData: { sleep: 7, stress: 3, energy: 7, soreness: 3, adherence: c.adherence || 0 },
      flags: (c.risk_flags || []).map((f: any) => f.message),
      notes: c.notes || "",
      messages: [],                  // populated from messages API
      _apiId: c.id,                  // preserve API ID for actions
    }));

    // Load messages for each client (batch)
    const conversationsRes = await api.messages.conversations();
    // TODO: match conversations to clients by user ID

    return { clients, stats, coachProfile: profile };
  } catch (e) {
    console.warn("Failed to load dashboard data, using demo mode:", e);
    return null;
  }
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Hook for the Command Center ───────────────────────────────

export function useDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof loadDashboardData>>>(null);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadDashboardData()
      .then(result => {
        if (result && result.clients.length > 0) {
          setData(result);
          setUsingDemo(false);
        } else {
          setUsingDemo(true);
        }
      })
      .catch(() => setUsingDemo(true))
      .finally(() => setLoading(false));
  }, [user]);

  return { data, loading, usingDemo };
}

// ── Actions (mutations the UI can call) ───────────────────────

export const actions = {
  sendMessage: async (recipientId: string, content: string) => {
    return api.messages.send(recipientId, content);
  },

  updateClientNotes: async (clientId: string, notes: string) => {
    return api.clients.update(clientId, { notes });
  },

  resolveFlag: async (clientId: string, flagId: string) => {
    return api.clients.resolveFlag(clientId, flagId);
  },

  inviteClient: async (email: string, name: string) => {
    return api.clients.create({ email, name });
  },

  reviewVideo: async (videoId: string, status: string, feedback: string) => {
    return api.videos.review(videoId, { status, feedback });
  },
};
