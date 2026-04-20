# INÖ Active Tasks

> Last updated: 2026-04-20 (Session 3)

## Production Readiness — COMPLETE

### Session 3 Work (Complete)
- [x] Route protection middleware (Next.js middleware.ts)
  - Auth cookie check on all non-public routes
  - Redirect to /login with ?redirect= param
  - Dev mode bypass when no NEXT_PUBLIC_API_URL
- [x] Error boundaries (5 files)
  - Global error boundary component (class-based)
  - Dashboard error.tsx + not-found.tsx
  - App-level error.tsx + not-found.tsx
  - All with premium styling (AlertTriangle, retry, go home buttons)
- [x] Stripe webhook handler (backend/app/routes/subscriptions.py)
  - POST /api/v1/subscriptions/checkout
  - GET /api/v1/subscriptions/status
  - POST /api/v1/subscriptions/cancel
  - POST /api/v1/subscriptions/webhook (signed)
  - 4 lifecycle events handled
- [x] Real Claude API integration (claude-sonnet-4-6)
  - Evidence-based workout generation
  - Prompt caching (cache_control ephemeral)
  - Graceful mock fallback
- [x] Vercel deployment config
  - vercel.json with security headers
  - .env.example templates (frontend + backend)
  - README.md with deployment instructions

## Remaining (for Session 4)

### High Priority
- [ ] Deploy coach dashboard to Vercel (needs user Vercel account)
- [ ] Deploy backend to Railway/Fly.io
- [ ] PostgreSQL migration (Supabase/Railway)
- [ ] Redis cloud (Upstash)
- [ ] Monitoring setup (Sentry)

### Medium Priority
- [ ] Food photo → macro estimation (YOLOv8)
- [ ] Form correction video analysis (MediaPipe)
- [ ] Stripe customer_id field on User model
- [ ] Admin dashboard for platform management

### Low Priority
- [ ] Offline data caching (React Query persistence)
- [ ] Mobile biometric auth
- [ ] Keyboard shortcuts (Cmd+K search)
- [ ] App Store submission

## All Completed Work

### Session 1 (Design System Overhaul)
- Premium design system (44 files), muscle heatmap, AI Workout Builder,
  PubMed research, Video library, Gojo-inspired effects, landing page,
  E2E tests (9/9), n8n workflows, design system tools

### Session 2 (Pages + Integration)
- Settings page, Check-ins page, API wiring (6 hooks dual-mode),
  Login page + auth store, Stripe helpers, Page animations,
  Mobile push notifications, Persistence docs

### Session 3 (Production Hardening)
- Route protection, Error boundaries, Stripe webhook backend,
  Real Claude API, Vercel deployment config
