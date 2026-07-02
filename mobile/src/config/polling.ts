// Centralized polling intervals (ms) for the mobile client app.
// Used with usePolling(), which pauses automatically when the app is
// backgrounded to save battery and data.
export const POLL_INTERVALS = {
  messages: 5000,
  workout: 30000,
  progress: 60000,
} as const;
