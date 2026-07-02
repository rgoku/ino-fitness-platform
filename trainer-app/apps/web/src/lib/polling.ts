// Centralized polling intervals (ms) for the coach dashboard's live data.
// TanStack Query automatically pauses these intervals while the browser tab is
// hidden (refetchIntervalInBackground defaults to false), so this is
// battery/network-friendly. Tune here in one place.
export const POLL_INTERVALS = {
  messages: 10_000,
  conversations: 15_000,
  clients: 45_000,
  alerts: 30_000,
  dashboard: 60_000,
} as const;
