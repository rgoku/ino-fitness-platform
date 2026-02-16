import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, BarChart3, MessageSquare, Settings, TrendingUp,
  AlertTriangle, CheckSquare, Search, Flame, Clock, Send,
  Eye, ArrowRight, MoreHorizontal, Zap, ChevronRight, Activity,
  X, Check, Edit3, Calendar, ChevronLeft, Video,
  UserPlus, Bell, Dumbbell, ClipboardList, Target,
  Moon, Sun, Home, Plus, Copy, FileText, Weight,
  HeartPulse, BedDouble, Brain, Utensils, Flag,
  Sparkles, LayoutDashboard, PanelLeftClose, PanelLeft
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

// ═══════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════
const themes = {
  dark: {
    name: "dark",
    bg: "#080A12", bgAlt: "#0C0F1A", card: "rgba(14,17,30,0.75)", cardSolid: "#0E111E",
    cardHover: "rgba(14,17,30,0.92)", sidebar: "rgba(8,10,18,0.95)",
    border: "rgba(255,255,255,0.06)", borderHover: "rgba(129,140,248,0.25)",
    text: "#E8ECF4", textSoft: "#C8D0E0", textMuted: "#6B7A99", textDim: "#475569",
    hover: "rgba(255,255,255,0.035)", hoverStrong: "rgba(255,255,255,0.07)",
    inputBg: "rgba(255,255,255,0.04)", inputBorder: "rgba(255,255,255,0.07)",
    accent: "#818CF8", accentDark: "#6366F1", accentBg: "rgba(129,140,248,0.1)",
    success: "#34D399", successBg: "rgba(52,211,153,0.1)",
    warning: "#FBBF24", warningBg: "rgba(251,191,36,0.1)",
    danger: "#FB7185", dangerBg: "rgba(251,113,133,0.1)",
    shadow: "0 24px 64px -12px rgba(0,0,0,0.5)",
    overlay: "rgba(8,10,18,0.8)",
    navActive: "rgba(129,140,248,0.1)", navHover: "rgba(255,255,255,0.04)",
    chartGrid: "rgba(255,255,255,0.04)",
  },
  light: {
    name: "light",
    bg: "#F4F6FB", bgAlt: "#E9ECF5", card: "rgba(255,255,255,0.85)", cardSolid: "#FFFFFF",
    cardHover: "rgba(255,255,255,0.96)", sidebar: "rgba(255,255,255,0.92)",
    border: "rgba(0,0,0,0.07)", borderHover: "rgba(99,102,241,0.25)",
    text: "#1A202C", textSoft: "#334155", textMuted: "#6B7A99", textDim: "#94A3B8",
    hover: "rgba(0,0,0,0.03)", hoverStrong: "rgba(0,0,0,0.055)",
    inputBg: "rgba(0,0,0,0.03)", inputBorder: "rgba(0,0,0,0.08)",
    accent: "#6366F1", accentDark: "#4F46E5", accentBg: "rgba(99,102,241,0.08)",
    success: "#10B981", successBg: "rgba(16,185,129,0.08)",
    warning: "#F59E0B", warningBg: "rgba(245,158,11,0.08)",
    danger: "#EF4444", dangerBg: "rgba(239,68,68,0.08)",
    shadow: "0 24px 64px -12px rgba(0,0,0,0.06)",
    overlay: "rgba(244,246,251,0.8)",
    navActive: "rgba(99,102,241,0.08)", navHover: "rgba(0,0,0,0.03)",
    chartGrid: "rgba(0,0,0,0.06)",
  },
};

// ═══════════════════════════════════════════════════
// CLIENT DATA
// ═══════════════════════════════════════════════════
const clients = [
  {
    id: 1, name: "James Wilson", ini: "JW", c: "#818CF8",
    email: "james@mail.com", program: "Hypertrophy A", phase: "Week 6 of 12",
    compliance: 91, streak: 14, lastActive: "2h ago", status: "on-track",
    weight: [82.1, 81.8, 81.5, 81.3, 81.0, 80.7], weightUnit: "kg",
    lastCheckin: "Today, 8:14 AM",
    checkinData: { sleep: 7.5, stress: 3, energy: 8, soreness: 4, adherence: 95 },
    flags: [], notes: "Progressing well. Increase bench volume next week.",
    messages: [
      { from: "client", text: "Hit a PR on bench today! 100kg x 5 🔥", time: "2h ago" },
      { from: "coach", text: "Let's go! Adding 2.5kg next session.", time: "1h ago" },
    ],
  },
  {
    id: 2, name: "Emma Davis", ini: "ED", c: "#F59E0B",
    email: "emma@mail.com", program: "Fat Loss Phase 2", phase: "Week 4 of 8",
    compliance: 78, streak: 7, lastActive: "5h ago", status: "on-track",
    weight: [68.2, 67.8, 67.5, 67.9, 67.3, 67.0], weightUnit: "kg",
    lastCheckin: "Today, 6:30 AM",
    checkinData: { sleep: 6, stress: 6, energy: 5, soreness: 6, adherence: 75 },
    flags: ["High stress", "Low energy"],
    notes: "Adjust cardio volume — stress is creeping up. Check macros.",
    messages: [
      { from: "client", text: "Can we adjust my macros for this week? Feeling drained.", time: "5h ago" },
      { from: "client", text: "Also sleep has been rough lately 😔", time: "5h ago" },
    ],
  },
  {
    id: 3, name: "Mike Chen", ini: "MC", c: "#F43F5E",
    email: "mike@mail.com", program: "Strength Block", phase: "Week 3 of 6",
    compliance: 42, streak: 0, lastActive: "4 days ago", status: "at-risk",
    weight: [90.5, 90.8, 91.2, 91.0, 91.5, 91.8], weightUnit: "kg",
    lastCheckin: "4 days ago",
    checkinData: { sleep: 5, stress: 8, energy: 3, soreness: 7, adherence: 40 },
    flags: ["Missed 3 workouts", "Overdue check-in", "Weight trending up"],
    notes: "Hasn't logged in. Needs check-in call. Possible life stress.",
    messages: [
      { from: "coach", text: "Hey Mike — just checking in. Everything alright?", time: "2 days ago" },
    ],
  },
  {
    id: 4, name: "Lisa Park", ini: "LP", c: "#10B981",
    email: "lisa@mail.com", program: "Hypertrophy B", phase: "Week 8 of 12",
    compliance: 96, streak: 28, lastActive: "1h ago", status: "on-track",
    weight: [57.0, 57.2, 57.5, 57.3, 57.6, 57.8], weightUnit: "kg",
    lastCheckin: "Today, 7:00 AM",
    checkinData: { sleep: 8, stress: 2, energy: 9, soreness: 3, adherence: 100 },
    flags: [], notes: "Crushing it. Consider competition prep discussion.",
    messages: [
      { from: "client", text: "Thanks for the new program! Loving it 💪", time: "1h ago" },
      { from: "coach", text: "Glad to hear it — keep pushing! Let's review at week 10.", time: "45m ago" },
    ],
  },
  {
    id: 5, name: "Ryan Torres", ini: "RT", c: "#06B6D4",
    email: "ryan@mail.com", program: "Recomp Phase 1", phase: "Week 2 of 10",
    compliance: 65, streak: 3, lastActive: "1 day ago", status: "needs-monitoring",
    weight: [78.0, 78.2, 77.8, 77.5, 77.9, 77.6], weightUnit: "kg",
    lastCheckin: "Yesterday, 9:15 PM",
    checkinData: { sleep: 6.5, stress: 5, energy: 6, soreness: 5, adherence: 60 },
    flags: ["Nutrition adherence low"],
    notes: "New client. Still building habits. Weekly nudge on nutrition.",
    messages: [
      { from: "client", text: "Skipped meal prep Sunday... back on track today though", time: "1 day ago" },
      { from: "coach", text: "No worries — consistency > perfection. Let's simplify your prep.", time: "23h ago" },
    ],
  },
  {
    id: 6, name: "Sarah Kim", ini: "SK", c: "#8B5CF6",
    email: "sarah@mail.com", program: "Glute Focus", phase: "Week 5 of 8",
    compliance: 88, streak: 12, lastActive: "3h ago", status: "on-track",
    weight: [62.0, 62.1, 62.3, 62.2, 62.4, 62.5], weightUnit: "kg",
    lastCheckin: "Today, 7:45 AM",
    checkinData: { sleep: 7, stress: 4, energy: 7, soreness: 5, adherence: 85 },
    flags: [], notes: "Solid consistency. Hip mobility improving.",
    messages: [
      { from: "client", text: "Hip thrust felt so much better today!", time: "3h ago" },
    ],
  },
  {
    id: 7, name: "David Okafor", ini: "DO", c: "#F59E0B",
    email: "david@mail.com", program: "Strength Block", phase: "Week 1 of 6",
    compliance: 50, streak: 1, lastActive: "2 days ago", status: "needs-monitoring",
    weight: [95.0, 95.2, 94.8], weightUnit: "kg",
    lastCheckin: "2 days ago",
    checkinData: { sleep: 5.5, stress: 7, energy: 4, soreness: 8, adherence: 50 },
    flags: ["High soreness", "Overdue check-in"],
    notes: "Just started. May need to reduce volume. Monitor recovery.",
    messages: [
      { from: "client", text: "Legs are destroyed after Monday. Is this normal?", time: "2 days ago" },
    ],
  },
  {
    id: 8, name: "Anika Patel", ini: "AP", c: "#10B981",
    email: "anika@mail.com", program: "Fat Loss Phase 1", phase: "Week 10 of 12",
    compliance: 94, streak: 21, lastActive: "30m ago", status: "on-track",
    weight: [72.0, 71.5, 71.0, 70.4, 69.8, 69.2], weightUnit: "kg",
    lastCheckin: "Today, 8:30 AM",
    checkinData: { sleep: 7.5, stress: 3, energy: 8, soreness: 3, adherence: 95 },
    flags: [], notes: "Down 2.8kg in 10 weeks. Incredible. Plan transition phase.",
    messages: [
      { from: "client", text: "Checked the scale — 69.2! Can't believe it 🥹", time: "30m ago" },
      { from: "coach", text: "YOU did that. Let's plan the next phase this week.", time: "15m ago" },
    ],
  },
];

const complianceHistory = [
  { week: "W1", avg: 72 }, { week: "W2", avg: 75 }, { week: "W3", avg: 78 },
  { week: "W4", avg: 74 }, { week: "W5", avg: 80 }, { week: "W6", avg: 83 },
  { week: "W7", avg: 81 }, { week: "W8", avg: 85 },
];

const programs = [
  { id: 1, name: "Hypertrophy A", clients: 2, type: "Muscle Building", weeks: 12 },
  { id: 2, name: "Hypertrophy B", clients: 1, type: "Muscle Building", weeks: 12 },
  { id: 3, name: "Fat Loss Phase 1", clients: 1, type: "Fat Loss", weeks: 12 },
  { id: 4, name: "Fat Loss Phase 2", clients: 1, type: "Fat Loss", weeks: 8 },
  { id: 5, name: "Strength Block", clients: 2, type: "Strength", weeks: 6 },
  { id: 6, name: "Recomp Phase 1", clients: 1, type: "Recomposition", weeks: 10 },
  { id: 7, name: "Glute Focus", clients: 1, type: "Specialization", weeks: 8 },
];

// ═══════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════
const Avatar = ({ ini, c, sz = 40, glow, status }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <div style={{
      width: sz, height: sz, borderRadius: sz * 0.32,
      background: `linear-gradient(135deg, ${c}20, ${c}08)`,
      border: `1.5px solid ${c}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: sz * 0.34, fontWeight: 700, color: c, letterSpacing: 0.5,
      boxShadow: glow ? `0 0 20px ${c}20` : "none",
    }}>
      {ini}
    </div>
    {status && (
      <div style={{
        position: "absolute", bottom: -1, right: -1,
        width: sz * 0.28, height: sz * 0.28, borderRadius: "50%",
        background: status === "on-track" ? "#10B981" : status === "at-risk" ? "#F43F5E" : "#F59E0B",
        border: `2px solid var(--card-solid)`,
      }} />
    )}
  </div>
);

const Badge = ({ children, color, bg }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 8,
    color, background: bg, letterSpacing: 0.2,
  }}>
    {children}
  </span>
);

const ProgressRing = ({ value, size = 44, stroke = 4, color }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="currentColor" strokeWidth={stroke} opacity={0.08} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeDasharray={circ}
        strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.22,1,.36,1)" }} />
    </svg>
  );
};

const MiniBar = ({ value, max = 10, color, t }) => (
  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
    <div style={{
      flex: 1, height: 5, borderRadius: 3,
      background: t.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      overflow: "hidden",
    }}>
      <div style={{
        width: `${(value / max) * 100}%`, height: "100%", borderRadius: 3,
        background: color, transition: "width .6s ease",
      }} />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════
// CLIENT DETAIL PANEL
// ═══════════════════════════════════════════════════
const ClientPanel = ({ client, onClose, t }) => {
  const [tab, setTab] = useState("overview");
  const [msgInput, setMsgInput] = useState("");
  if (!client) return null;

  const statusColors = {
    "on-track": { color: t.success, label: "On Track" },
    "at-risk": { color: t.danger, label: "At Risk" },
    "needs-monitoring": { color: t.warning, label: "Needs Monitoring" },
  };
  const st = statusColors[client.status];

  const tabs = [
    { id: "overview", label: "Overview", icon: <Eye size={14} /> },
    { id: "program", label: "Program", icon: <Dumbbell size={14} /> },
    { id: "checkins", label: "Check-ins", icon: <ClipboardList size={14} /> },
    { id: "messages", label: "Messages", icon: <MessageSquare size={14} /> },
    { id: "notes", label: "Notes", icon: <Edit3 size={14} /> },
  ];

  const checkinItems = [
    { label: "Sleep", value: `${client.checkinData.sleep}h`, icon: <BedDouble size={14} />, bar: client.checkinData.sleep, max: 10, color: "#818CF8" },
    { label: "Stress", value: `${client.checkinData.stress}/10`, icon: <Brain size={14} />, bar: client.checkinData.stress, max: 10, color: client.checkinData.stress > 6 ? t.danger : client.checkinData.stress > 4 ? t.warning : t.success },
    { label: "Energy", value: `${client.checkinData.energy}/10`, icon: <Zap size={14} />, bar: client.checkinData.energy, max: 10, color: client.checkinData.energy > 6 ? t.success : client.checkinData.energy > 4 ? t.warning : t.danger },
    { label: "Soreness", value: `${client.checkinData.soreness}/10`, icon: <HeartPulse size={14} />, bar: client.checkinData.soreness, max: 10, color: client.checkinData.soreness > 6 ? t.danger : client.checkinData.soreness > 4 ? t.warning : t.success },
    { label: "Adherence", value: `${client.checkinData.adherence}%`, icon: <Target size={14} />, bar: client.checkinData.adherence, max: 100, color: client.checkinData.adherence > 80 ? t.success : client.checkinData.adherence > 60 ? t.warning : t.danger },
  ];

  const weightData = client.weight.map((w, i) => ({ week: `W${i + 1}`, weight: w }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      display: "flex", justifyContent: "flex-end",
    }} onClick={onClose}>
      <div style={{
        position: "fixed", inset: 0, background: t.overlay,
        backdropFilter: "blur(8px)",
      }} />
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, height: "100vh", background: t.cardSolid,
        borderLeft: `1px solid ${t.border}`, boxShadow: "-20px 0 60px rgba(0,0,0,0.25)",
        overflowY: "auto", position: "relative",
        animation: "slideInRight .25s ease-out",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 24px 0", position: "sticky", top: 0,
          background: t.cardSolid, zIndex: 2,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Avatar ini={client.ini} c={client.c} sz={52} glow status={client.status} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: t.text, letterSpacing: "-0.01em" }}>{client.name}</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{client.program} · {client.phase}</div>
                <Badge color={st.color} bg={st.color + "18"}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
                  {st.label}
                </Badge>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: t.hover, border: `1px solid ${t.border}`,
              borderRadius: 10, width: 34, height: 34, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textMuted,
            }}>
              <X size={15} />
            </button>
          </div>

          {/* Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { v: `${client.compliance}%`, l: "Compliance", c: client.compliance > 80 ? t.success : client.compliance > 60 ? t.warning : t.danger },
              { v: client.streak > 0 ? `🔥 ${client.streak}d` : "—", l: "Streak", c: t.warning },
              { v: `${client.weight[client.weight.length - 1]}`, l: client.weightUnit, c: t.accent },
              { v: client.lastActive, l: "Last Active", c: "#06B6D4" },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "10px 4px", borderRadius: 12,
                background: t.hover, border: `1px solid ${t.border}`,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, borderBottom: `1px solid ${t.border}`, paddingBottom: 0 }}>
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "9px 14px", fontSize: 12, fontWeight: 600,
                background: "none", border: "none", cursor: "pointer",
                color: tab === tb.id ? t.accent : t.textMuted,
                borderBottom: tab === tb.id ? `2px solid ${t.accent}` : "2px solid transparent",
                fontFamily: "inherit", transition: "all .15s",
                marginBottom: -1,
              }}>
                {tb.icon} {tb.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: "20px 24px 32px" }}>
          {tab === "overview" && (
            <>
              {/* Flags */}
              {client.flags.length > 0 && (
                <div style={{
                  padding: "14px 16px", borderRadius: 14, marginBottom: 16,
                  background: t.dangerBg, border: `1px solid ${t.danger}20`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.danger, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={13} /> Flags
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {client.flags.map((f, i) => (
                      <Badge key={i} color={t.danger} bg={t.danger + "15"}>
                        <Flag size={10} /> {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight Trend */}
              <div style={{
                padding: "16px", borderRadius: 14,
                background: t.hover, border: `1px solid ${t.border}`, marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 12 }}>Weight Trend</div>
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id={`wg-${client.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={t.accent} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={t.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: t.textDim }} axisLine={false} tickLine={false} />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
                    <Tooltip
                      contentStyle={{ background: t.cardSolid, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12, color: t.text }}
                      labelStyle={{ color: t.textMuted, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="weight" stroke={t.accent} strokeWidth={2}
                      fill={`url(#wg-${client.id})`} dot={{ r: 3, fill: t.accent, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Latest Check-in Snapshot */}
              <div style={{
                padding: "16px", borderRadius: 14,
                background: t.hover, border: `1px solid ${t.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Latest Check-in</div>
                  <div style={{ fontSize: 11, color: t.textDim }}>{client.lastCheckin}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {checkinItems.map((ci, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ color: t.textMuted, width: 20, display: "flex", justifyContent: "center" }}>{ci.icon}</div>
                      <div style={{ fontSize: 12, color: t.textMuted, width: 70 }}>{ci.label}</div>
                      <div style={{ flex: 1 }}>
                        <MiniBar value={ci.bar} max={ci.max} color={ci.color} t={t} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: ci.color, width: 40, textAlign: "right" }}>{ci.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "program" && (
            <div style={{
              padding: "20px", borderRadius: 14,
              background: t.hover, border: `1px solid ${t.border}`,
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>{client.program}</div>
              <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 16 }}>{client.phase}</div>
              <div style={{
                display: "flex", gap: 10, marginBottom: 20,
              }}>
                <button style={{
                  flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${t.accent}30`,
                  background: t.accentBg, color: t.accent, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  <Edit3 size={13} /> Adjust Program
                </button>
                <button style={{
                  flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${t.border}`,
                  background: t.hover, color: t.textSoft, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  <Copy size={13} /> Duplicate
                </button>
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>
                Full program editor coming in Phase 2. This panel will show the assigned workout split, progression rules, and deload schedule.
              </div>
            </div>
          )}

          {tab === "checkins" && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 12 }}>Check-in History</div>
              {["Today", "3 days ago", "1 week ago"].map((date, i) => (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: 14, marginBottom: 10,
                  background: t.hover, border: `1px solid ${t.border}`,
                  opacity: i === 0 ? 1 : 0.7,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{date}</span>
                    <span style={{ fontSize: 11, color: t.textDim }}>
                      Adherence: {Math.max(40, client.checkinData.adherence - i * 5)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>
                    Sleep {Math.max(4, client.checkinData.sleep - i * 0.5)}h · Stress {Math.min(10, client.checkinData.stress + i)} · Energy {Math.max(2, client.checkinData.energy - i)}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "messages" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, minHeight: 200 }}>
                {client.messages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: msg.from === "coach" ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "80%", padding: "10px 14px", borderRadius: 14,
                      background: msg.from === "coach"
                        ? `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`
                        : t.hover,
                      color: msg.from === "coach" ? "#fff" : t.text,
                      fontSize: 13, lineHeight: 1.5,
                      border: msg.from === "coach" ? "none" : `1px solid ${t.border}`,
                    }}>
                      <div>{msg.text}</div>
                      <div style={{
                        fontSize: 10, marginTop: 4,
                        color: msg.from === "coach" ? "rgba(255,255,255,0.6)" : t.textDim,
                        textAlign: "right",
                      }}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                display: "flex", gap: 8, padding: "12px",
                background: t.hover, borderRadius: 14, border: `1px solid ${t.border}`,
              }}>
                <input
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    outline: "none", color: t.text, fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
                <button style={{
                  background: t.accent, border: "none", borderRadius: 10,
                  width: 34, height: 34, display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", color: "#fff",
                }}>
                  <Send size={14} />
                </button>
              </div>
            </>
          )}

          {tab === "notes" && (
            <div style={{
              padding: "16px", borderRadius: 14,
              background: t.hover, border: `1px solid ${t.border}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 10 }}>Coach Notes</div>
              <div style={{
                fontSize: 13, color: t.textSoft, lineHeight: 1.7,
                padding: "12px", borderRadius: 10,
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                minHeight: 120,
              }}>
                {client.notes}
              </div>
              <button style={{
                marginTop: 12, padding: "9px 18px", borderRadius: 10,
                background: t.accentBg, border: `1px solid ${t.accent}25`,
                color: t.accent, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Edit3 size={13} /> Edit Notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
export default function INOCoachCommandCenter() {
  const [theme, setTheme] = useState("dark");
  const [page, setPage] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const t = themes[theme];

  const attentionQueue = clients
    .filter(c => c.flags.length > 0 || c.status === "at-risk" || c.status === "needs-monitoring")
    .sort((a, b) => {
      const priority = { "at-risk": 0, "needs-monitoring": 1, "on-track": 2 };
      return priority[a.status] - priority[b.status];
    });

  const totalClients = clients.length;
  const avgCompliance = Math.round(clients.reduce((a, c) => a + c.compliance, 0) / clients.length);
  const atRiskCount = clients.filter(c => c.status === "at-risk").length;
  const checkedInToday = clients.filter(c => c.lastCheckin.includes("Today")).length;

  const filteredClients = searchQuery
    ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : clients;

  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Today" },
    { id: "clients", icon: <Users size={18} />, label: "Clients" },
    { id: "programs", icon: <Dumbbell size={18} />, label: "Programs" },
    { id: "messages", icon: <MessageSquare size={18} />, label: "Messages" },
    { id: "analytics", icon: <BarChart3 size={18} />, label: "Analytics" },
  ];

  const unreadMessages = clients.reduce(
    (sum, c) => sum + c.messages.filter(m => m.from === "client").length, 0
  );

  return (
    <div style={{
      height: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      background: t.bg, color: t.text, overflow: "hidden",
      "--card-solid": t.cardSolid,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.18); border-radius: 10px; }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
      `}</style>

      {/* ═══ SIDEBAR ═══ */}
      <div style={{
        width: sidebarCollapsed ? 64 : 220, flexShrink: 0,
        background: t.sidebar, backdropFilter: "blur(20px)",
        borderRight: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column",
        padding: sidebarCollapsed ? "16px 8px" : "16px 12px",
        transition: "width .2s ease, padding .2s ease",
      }}>
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: sidebarCollapsed ? "4px" : "4px 6px", marginBottom: 28,
          justifyContent: sidebarCollapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #818CF8, #6366F1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 11, letterSpacing: "-0.02em",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}>
            INÖ
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ color: t.text, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Coach</div>
              <div style={{ color: t.textDim, fontSize: 10 }}>Command Center</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map(item => {
            const active = page === item.id;
            const hasNotif = item.id === "messages" && unreadMessages > 0;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: sidebarCollapsed ? "10px" : "10px 12px",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                background: active ? t.navActive : "transparent",
                border: active ? `1px solid ${t.accent}20` : "1px solid transparent",
                borderRadius: 10, cursor: "pointer",
                color: active ? t.accent : t.textMuted, fontFamily: "inherit",
                transition: "all .15s", fontSize: 13, fontWeight: active ? 600 : 500,
                position: "relative",
              }}>
                {item.icon}
                {!sidebarCollapsed && item.label}
                {hasNotif && (
                  <div style={{
                    position: sidebarCollapsed ? "absolute" : "relative",
                    top: sidebarCollapsed ? 4 : "auto", right: sidebarCollapsed ? 4 : "auto",
                    marginLeft: sidebarCollapsed ? 0 : "auto",
                    width: 18, height: 18, borderRadius: "50%",
                    background: t.danger, color: "#fff", fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {unreadMessages}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Collapse + Theme + Profile */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{
            display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "flex-start",
            gap: 10, padding: sidebarCollapsed ? "10px" : "10px 12px",
            background: "none", border: "none", borderRadius: 10,
            cursor: "pointer", color: t.textDim, fontSize: 12, fontWeight: 500, fontFamily: "inherit",
          }}>
            {sidebarCollapsed ? <PanelLeft size={16} /> : <><PanelLeftClose size={16} /> Collapse</>}
          </button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{
            display: "flex", alignItems: "center", justifyContent: sidebarCollapsed ? "center" : "flex-start",
            gap: 10, padding: sidebarCollapsed ? "10px" : "10px 12px",
            background: "none", border: "none", borderRadius: 10,
            cursor: "pointer", color: t.textDim, fontSize: 12, fontWeight: 500, fontFamily: "inherit",
          }}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {!sidebarCollapsed && (theme === "dark" ? "Light Mode" : "Dark Mode")}
          </button>
          <div style={{
            borderTop: `1px solid ${t.border}`, paddingTop: 12, marginTop: 4,
            display: "flex", alignItems: "center", gap: 10,
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            padding: sidebarCollapsed ? "12px 4px 0" : "12px 6px 0",
          }}>
            <Avatar ini="SM" c={t.accent} sz={32} />
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Sarah M.</div>
                <div style={{ fontSize: 10, color: t.textDim }}>Pro Plan · 8 clients</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

        {/* ─── DASHBOARD / TODAY VIEW ─── */}
        {page === "dashboard" && (
          <div className="fade-up">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>
                Good morning, Sarah
              </div>
              <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>
                {attentionQueue.length} client{attentionQueue.length !== 1 ? "s" : ""} need your attention today
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { icon: <Users size={18} />, label: "Active Clients", value: totalClients, color: t.accent },
                { icon: <Target size={18} />, label: "Avg Compliance", value: `${avgCompliance}%`, color: avgCompliance > 75 ? t.success : t.warning },
                { icon: <CheckSquare size={18} />, label: "Checked In Today", value: `${checkedInToday}/${totalClients}`, color: "#06B6D4" },
                { icon: <AlertTriangle size={18} />, label: "At Risk", value: atRiskCount, color: atRiskCount > 0 ? t.danger : t.success },
              ].map((s, i) => (
                <div key={i} style={{
                  background: t.card, backdropFilter: "blur(16px)",
                  borderRadius: 16, padding: "18px 20px",
                  border: `1px solid ${t.border}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: s.color + "15", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: s.color, marginBottom: 12,
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Attention Queue */}
            <div style={{
              background: t.card, backdropFilter: "blur(16px)",
              borderRadius: 16, border: `1px solid ${t.border}`,
              marginBottom: 24, overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: t.danger, boxShadow: `0 0 8px ${t.danger}50`,
                    animation: "pulse 2s infinite",
                  }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Needs Your Attention</span>
                  <Badge color={t.danger} bg={t.dangerBg}>{attentionQueue.length}</Badge>
                </div>
              </div>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

              {attentionQueue.map((client, i) => (
                <div key={client.id} onClick={() => setSelectedClient(client)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 20px",
                    borderBottom: i < attentionQueue.length - 1 ? `1px solid ${t.border}` : "none",
                    cursor: "pointer", transition: "background .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = t.hover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <Avatar ini={client.ini} c={client.c} sz={38} status={client.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{client.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      {client.flags.slice(0, 2).map((f, j) => (
                        <Badge key={j} color={t.danger} bg={t.danger + "12"}>
                          <Flag size={9} /> {f}
                        </Badge>
                      ))}
                      {client.status === "at-risk" && client.flags.length === 0 && (
                        <Badge color={t.danger} bg={t.danger + "12"}>At Risk</Badge>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: t.textDim }}>{client.lastActive}</div>
                    <div style={{
                      fontSize: 12, fontWeight: 600, marginTop: 2,
                      color: client.compliance > 70 ? t.success : client.compliance > 50 ? t.warning : t.danger,
                    }}>
                      {client.compliance}% compliance
                    </div>
                  </div>
                  <ChevronRight size={16} color={t.textDim} />
                </div>
              ))}
            </div>

            {/* Client Snapshot Grid */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 14 }}>All Clients</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                {clients.map(client => (
                  <div key={client.id} onClick={() => setSelectedClient(client)}
                    style={{
                      background: t.card, backdropFilter: "blur(16px)",
                      borderRadius: 14, padding: "16px",
                      border: `1px solid ${t.border}`, cursor: "pointer",
                      transition: "all .2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = t.borderHover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = t.border;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <Avatar ini={client.ini} c={client.c} sz={40} status={client.status} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{client.name}</div>
                        <div style={{ fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {client.program}
                        </div>
                      </div>
                      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ProgressRing
                          value={client.compliance}
                          size={42} stroke={3.5}
                          color={client.compliance > 80 ? t.success : client.compliance > 60 ? t.warning : t.danger}
                        />
                        <span style={{
                          position: "absolute", fontSize: 10, fontWeight: 700,
                          color: client.compliance > 80 ? t.success : client.compliance > 60 ? t.warning : t.danger,
                        }}>
                          {client.compliance}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ color: t.textDim }}>
                        {client.streak > 0 ? `🔥 ${client.streak}d streak` : "No streak"}
                      </span>
                      <span style={{ color: t.textDim }}>{client.lastActive}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Trend */}
            <div style={{
              background: t.card, backdropFilter: "blur(16px)",
              borderRadius: 16, padding: "20px", border: `1px solid ${t.border}`,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16 }}>
                Average Compliance Trend
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={complianceHistory}>
                  <defs>
                    <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.accent} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={t.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: t.textDim }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: t.textDim }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: t.cardSolid, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12, color: t.text }}
                  />
                  <Area type="monotone" dataKey="avg" stroke={t.accent} strokeWidth={2.5}
                    fill="url(#compGrad)" dot={{ r: 3, fill: t.accent, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ─── CLIENTS PAGE ─── */}
        {page === "clients" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>Clients</div>
                <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>{totalClients} active clients</div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: t.inputBg, borderRadius: 12, padding: "0 14px",
                border: `1px solid ${t.inputBorder}`, width: 280,
              }}>
                <Search size={16} color={t.textDim} />
                <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: t.text, fontSize: 13, fontFamily: "inherit", padding: "10px 0",
                  }}
                />
              </div>
            </div>

            {/* Client Table */}
            <div style={{
              background: t.card, backdropFilter: "blur(16px)",
              borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden",
            }}>
              {/* Header Row */}
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.8fr",
                padding: "12px 20px", borderBottom: `1px solid ${t.border}`,
                fontSize: 11, fontWeight: 700, color: t.textDim, textTransform: "uppercase", letterSpacing: 0.5,
              }}>
                <span>Client</span><span>Program</span><span>Compliance</span>
                <span>Streak</span><span>Last Active</span><span>Status</span>
              </div>

              {filteredClients.map((client, i) => {
                const statusMap = {
                  "on-track": { color: t.success, label: "On Track" },
                  "at-risk": { color: t.danger, label: "At Risk" },
                  "needs-monitoring": { color: t.warning, label: "Monitor" },
                };
                const st = statusMap[client.status];
                return (
                  <div key={client.id} onClick={() => setSelectedClient(client)}
                    style={{
                      display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.8fr",
                      alignItems: "center", padding: "14px 20px",
                      borderBottom: i < filteredClients.length - 1 ? `1px solid ${t.border}` : "none",
                      cursor: "pointer", transition: "background .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = t.hover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar ini={client.ini} c={client.c} sz={36} status={client.status} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{client.name}</div>
                        <div style={{ fontSize: 11, color: t.textDim }}>{client.email}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: t.textSoft }}>{client.program}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 50, height: 5, borderRadius: 3, overflow: "hidden",
                        background: t.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                      }}>
                        <div style={{
                          width: `${client.compliance}%`, height: "100%", borderRadius: 3,
                          background: client.compliance > 80 ? t.success : client.compliance > 60 ? t.warning : t.danger,
                        }} />
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: client.compliance > 80 ? t.success : client.compliance > 60 ? t.warning : t.danger,
                      }}>
                        {client.compliance}%
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: t.textSoft }}>
                      {client.streak > 0 ? `🔥 ${client.streak}d` : "—"}
                    </div>
                    <div style={{ fontSize: 12, color: t.textDim }}>{client.lastActive}</div>
                    <Badge color={st.color} bg={st.color + "15"}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: st.color }} />
                      {st.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── PROGRAMS PAGE ─── */}
        {page === "programs" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>Programs</div>
                <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>Your program templates</div>
              </div>
              <button style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 12,
                background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`,
                border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 4px 16px ${t.accent}30`,
              }}>
                <Plus size={16} /> New Program
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {programs.map(prog => (
                <div key={prog.id} style={{
                  background: t.card, backdropFilter: "blur(16px)",
                  borderRadius: 16, padding: "20px",
                  border: `1px solid ${t.border}`, cursor: "pointer",
                  transition: "all .2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.borderHover}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{prog.name}</div>
                      <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{prog.type} · {prog.weeks} weeks</div>
                    </div>
                    <Badge color={t.accent} bg={t.accentBg}>{prog.clients} clients</Badge>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{
                      flex: 1, padding: "8px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: t.hover, border: `1px solid ${t.border}`,
                      color: t.textSoft, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}>
                      <Edit3 size={12} /> Edit
                    </button>
                    <button style={{
                      flex: 1, padding: "8px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: t.hover, border: `1px solid ${t.border}`,
                      color: t.textSoft, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}>
                      <Copy size={12} /> Duplicate
                    </button>
                    <button style={{
                      flex: 1, padding: "8px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                      background: t.accentBg, border: `1px solid ${t.accent}20`,
                      color: t.accent, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    }}>
                      <UserPlus size={12} /> Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── MESSAGES PAGE ─── */}
        {page === "messages" && (
          <div className="fade-up">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>Messages</div>
              <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>Client conversations</div>
            </div>

            <div style={{
              background: t.card, backdropFilter: "blur(16px)",
              borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden",
            }}>
              {clients.filter(c => c.messages.length > 0).map((client, i, arr) => {
                const lastMsg = client.messages[client.messages.length - 1];
                const hasUnread = lastMsg.from === "client";
                return (
                  <div key={client.id} onClick={() => setSelectedClient(client)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 20px",
                      borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none",
                      cursor: "pointer", transition: "background .15s",
                      background: hasUnread ? (t.name === "dark" ? "rgba(129,140,248,0.03)" : "rgba(99,102,241,0.02)") : "transparent",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = t.hover}
                    onMouseLeave={e => e.currentTarget.style.background = hasUnread ? (t.name === "dark" ? "rgba(129,140,248,0.03)" : "rgba(99,102,241,0.02)") : "transparent"}
                  >
                    <div style={{ position: "relative" }}>
                      <Avatar ini={client.ini} c={client.c} sz={42} />
                      {hasUnread && (
                        <div style={{
                          position: "absolute", top: -2, right: -2,
                          width: 10, height: 10, borderRadius: "50%",
                          background: t.accent, border: `2px solid ${t.cardSolid}`,
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: hasUnread ? 700 : 500, color: t.text }}>{client.name}</span>
                        <span style={{ fontSize: 11, color: t.textDim }}>{lastMsg.time}</span>
                      </div>
                      <div style={{
                        fontSize: 13, color: hasUnread ? t.textSoft : t.textMuted,
                        marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {lastMsg.from === "coach" ? "You: " : ""}{lastMsg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── ANALYTICS PAGE ─── */}
        {page === "analytics" && (
          <div className="fade-up">
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>Analytics</div>
              <div style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>Coaching performance overview</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Avg Compliance", value: `${avgCompliance}%`, sub: "↑ 4% from last month", color: t.success },
                { label: "Client Retention", value: "100%", sub: "0 churned this month", color: t.accent },
                { label: "Avg Response Time", value: "2.4h", sub: "↓ 18% faster", color: "#06B6D4" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: t.card, backdropFilter: "blur(16px)",
                  borderRadius: 16, padding: "20px", border: `1px solid ${t.border}`,
                }}>
                  <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Compliance Trend */}
            <div style={{
              background: t.card, backdropFilter: "blur(16px)",
              borderRadius: 16, padding: "20px", border: `1px solid ${t.border}`, marginBottom: 24,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 16 }}>
                Compliance Over Time
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={complianceHistory}>
                  <defs>
                    <linearGradient id="compGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={t.accent} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={t.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: t.textDim }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: t.textDim }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: t.cardSolid, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 12, color: t.text }} />
                  <Area type="monotone" dataKey="avg" stroke={t.accent} strokeWidth={2.5}
                    fill="url(#compGrad2)" dot={{ r: 3, fill: t.accent, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Client Rankings */}
            <div style={{
              background: t.card, backdropFilter: "blur(16px)",
              borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
                fontSize: 15, fontWeight: 700, color: t.text,
              }}>
                Client Leaderboard
              </div>
              {[...clients].sort((a, b) => b.compliance - a.compliance).map((client, i) => (
                <div key={client.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 20px",
                  borderBottom: i < clients.length - 1 ? `1px solid ${t.border}` : "none",
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 8, fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < 3 ? t.accentBg : t.hover,
                    color: i < 3 ? t.accent : t.textDim,
                  }}>
                    {i + 1}
                  </span>
                  <Avatar ini={client.ini} c={client.c} sz={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{client.name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 60, height: 5, borderRadius: 3, overflow: "hidden",
                      background: t.name === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    }}>
                      <div style={{
                        width: `${client.compliance}%`, height: "100%", borderRadius: 3,
                        background: client.compliance > 80 ? t.success : client.compliance > 60 ? t.warning : t.danger,
                      }} />
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 700, width: 40,
                      color: client.compliance > 80 ? t.success : client.compliance > 60 ? t.warning : t.danger,
                    }}>
                      {client.compliance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ CLIENT DETAIL PANEL ═══ */}
      {selectedClient && (
        <ClientPanel
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          t={t}
        />
      )}
    </div>
  );
}
