# INÖ Fitness Platform — Claude Code Configuration

## Project Overview
AI-powered fitness coaching platform helping coaches scale to 100+ clients.
Three apps sharing one backend: Trainer Dashboard (Next.js), Landing/Client App (Next.js), Mobile (Expo).

## Tech Stack
- **Web:** Next.js 14 + Tailwind CSS + React Query + Zustand
- **Mobile:** React Native (Expo 51) + React Navigation
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL + Redis + Celery
- **AI:** Anthropic Claude API + MediaPipe (pose detection)
- **Payments:** Stripe

## Development Servers
| App | Command | Port |
|-----|---------|------|
| Trainer Dashboard | `cd trainer-app/apps/web && npx next dev` | 3000 |
| Landing/Client App | `cd web-app && npx next dev --port 3001` | 3001 |
| Backend API | `cd backend && uvicorn app.main:app --port 8095` | 8095 |

## Key Directories
```
trainer-app/apps/web/src/     — Coach dashboard (Next.js)
web-app/                      — Landing page + client web app
mobile/src/                   — Client mobile app (Expo)
backend/app/                  — FastAPI backend
design-system/                — UI/UX reference data + tools
```

## Design System
- **Accent:** Electric green (#10B981)
- **Typography:** Inter (sans), 3-level hierarchy (heading/subheading/body)
- **Spacing:** 8px grid
- **Components:** Card, Button (6 variants), Badge (7 variants), Input, ProgressBar, AIInsight, MuscleHeatmap, Tabs
- **Dark mode:** Full CSS variable system
- **Reference:** `design-system/MASTER.md` for complete specs

## Testing
```bash
# Backend
cd backend && pytest

# Trainer Dashboard (type check)
cd trainer-app/apps/web && npx next build
```

## Code Conventions
- Use existing UI components from `components/ui/` — don't create new primitives
- All hooks return React Query objects (`{ data, isLoading, error }`)
- Mock data in `lib/mock-data.ts` — swap to real API calls for production
- Use `text-body-sm`, `text-heading-1`, etc. from Tailwind config (not raw sizes)
- Use `var(--color-text-primary)` CSS variables (not hardcoded colors)
- Lucide icons only (no emojis as icons)
- `tabular-nums` class on all number displays

## Recommended Plugins
- **superpowers** — Structured planning + TDD + subagent development
- **everything-claude-code** — Agents, skills, hooks, security scanning
- **claude-mem** — Persistent memory across sessions

## Automations (n8n)
See `automation/` for n8n workflow configs:
- Client inactivity alerts
- Weekly progress reports
- Diet plan reminders
- Coach notification digests
