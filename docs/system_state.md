# INÖ System State

> Auto-updated after each development session.
> Last updated: 2026-04-20

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INÖ Platform                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Landing     │  Coach       │  Client      │  Mobile        │
│  (Next.js)   │  Dashboard   │  Web App     │  (Expo RN)     │
│  :3001/      │  (Next.js)   │  :3001/fit   │  Expo Go       │
│              │  :3000       │              │                │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                    FastAPI Backend (:8095)                   │
│  Routes: auth, users, workouts, diet, progress, coaching,   │
│          ai_coach, reminders, templates                     │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL │ Redis │ Celery │ Firebase Auth │ Stripe       │
├─────────────────────────────────────────────────────────────┤
│  AI: Anthropic Claude │ MediaPipe │ PubMed │ ML Generator   │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Coach Dashboard | Next.js 14 + Tailwind | Working |
| Client Web App | Next.js 14 + Tailwind | Working |
| Mobile App | React Native (Expo 51) | Screens built, needs backend wiring |
| Backend API | FastAPI + SQLAlchemy | 9 route modules, 14 models |
| Database | PostgreSQL | Schema defined |
| Cache/Queue | Redis + Celery | Configured |
| Auth | Firebase Auth | Backend ready, frontend partial |
| Payments | Stripe | Model defined, routes pending |
| AI | Anthropic Claude API | Service built |
| Form Analysis | MediaPipe | Service built |

## Database Models (14)

User, Coach, WorkoutPlan, Exercise, WorkoutSession, DietPlan, Meal, FoodEntry, ProgressEntry, Message, Reminder, Achievement, Subscription, Base

## API Routes (9 modules)

| Route | Prefix | Status |
|-------|--------|--------|
| auth | /api/v1/auth | Implemented |
| users | /api/v1/users | Implemented |
| workouts | /api/v1/workouts | Implemented |
| diet | /api/v1/diet | Implemented |
| progress | /api/v1/progress | Implemented |
| coaching | /api/v1/coaching | Implemented |
| ai_coach | /api/v1/ai | Implemented |
| reminders | /api/v1/ | Implemented |
| templates | /api/v1/templates | Implemented |

## Coach Dashboard Pages (13)

| Page | Route | Status |
|------|-------|--------|
| Dashboard | / | Complete |
| Clients | /clients | Complete |
| Client Detail | /clients/[id] | Complete (5 tabs + heatmap) |
| Programs | /programs | Complete |
| Program Editor | /programs/[id] | Complete |
| AI Builder | /programs/builder | Complete |
| Videos | /videos | Complete |
| Nutrition | /nutrition | Complete (PubMed) |
| Messages | /messages | Complete |
| Analytics | /analytics | Complete |
| Check-ins | /check-ins | Needs build |
| Settings | /settings | Needs build |

## Mobile Screens (12)

HomeScreen, LoginScreen, SignupScreen, OnboardingScreen, WorkoutPlanScreen, WorkoutSessionScreen, FoodPhotoScreen, FormCheckScreen, DietPlanScreen, ChatScreen, ProgressScreen, ProfileScreen

## Design System

- Accent: Electric green (#10B981)
- Dark mode: Full CSS variable system
- Effects: Gojo-inspired glows, Domain Expansion cards, gradient text
- Components: 15+ reusable (Button, Card, Input, Badge, Tabs, ProgressBar, MetricRing, AIInsight, MuscleHeatmap, StatusDot, etc.)
- Icons: Lucide only (no emojis)

## External Integrations

| Service | Purpose | Status |
|---------|---------|--------|
| PubMed | Diet plan research backing | Built |
| n8n | Workflow automation | Configured |
| Stripe | Subscriptions | Model only |
| Firebase | Auth | Backend ready |
| Anthropic | AI coaching | Service built |

## Dev Tooling

- E2E Tests: 9/9 passing (Playwright)
- Design System Generator: Python CLI tool
- CLAUDE.md: Project context for AI sessions
- Plugins: superpowers, ecc, claude-mem recommended
