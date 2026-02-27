# INO Demo — Standalone JSX Apps

This folder contains **standalone React/JSX** demos that can be run in environments that support React (e.g. Cursor, Codeium, or a small React host).

## Files

| File | Description |
|------|-------------|
| **ino-fitness.jsx** | Client-facing fitness app: themes (Obsidian, Arctic, Ember, Sakura), today/plan/progress/chat/profile, workout tracker, habits, PRs, muscle map, coach connect. Uses `window.storage` when available for persistence. |
| **ino-coach-command-center.jsx** | Coach dashboard: clients, stats, messages, check-ins, video reviews, dark theme, Lucide + Recharts. |
| **ino-platform-unified.jsx** | Unified platform demo (coach + client flows). |

## Running

These are **single-file JSX** components. They are not wired into the ino-platform Vite/Expo build by default. To run them:

- Use an environment that can render React/JSX (e.g. a playground that provides `React`, `window.storage`, and a root DOM node), or
- Copy the component into a small React app (e.g. `create-react-app` or Vite + React) and render it as the root component.

**ino-fitness.jsx** expects an optional `window.storage` API (`get`, `set`, `list`, `delete` with `key` and `shared`). If not present, persistence will no-op and the app still runs with in-memory state.

## Relation to the rest of the repo

- The **coach web app** (Vite) lives in `../coach-web/` and uses TypeScript + the same API.
- **ino-fitness.jsx** is a standalone client UI that mirrors concepts from the main **mobile** app and **ino-platform** (workouts, habits, coach connection).
