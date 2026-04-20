# INÖ Active Tasks

> Last updated: 2026-04-20 (Session 2)

## Current Sprint

### High Priority
- [x] Build Settings page (profile, notifications, subscription, security)
- [x] Build Check-ins page (weekly photos, measurements, coach review)
- [x] Wire frontend hooks to real backend API (dual-mode: mock + real)
- [x] Add auth flow (login page → dashboard, token management)
- [x] Stripe checkout integration (create session, status, cancel)
- [x] Page transition animations (6 pages + card hover effects)
- [x] Mobile push notifications (Expo registration, scheduling, listeners)

### Medium Priority
- [ ] Route protection middleware (redirect unauthenticated to /login)
- [ ] Error boundaries on all pages
- [ ] Stripe webhook handler in backend
- [ ] Real Claude API integration for workout generation
- [ ] Food photo → macro estimation (YOLOv8)

### Low Priority
- [ ] Form correction video analysis (MediaPipe)
- [ ] Offline data caching (React Query persistence)
- [ ] Dark mode toggle persistence in localStorage
- [ ] Keyboard shortcuts (Cmd+K search)
- [ ] Mobile biometric auth

## Completed (Session 2)
- [x] Settings page: Profile, Appearance, Notifications (6 toggles), Subscription, Security, Sign Out
- [x] Check-ins page: Pending/Reviewed/All tabs, weekly check-in cards (weight, body fat, adherence, sleep, photos, measurements, notes), send feedback + mark reviewed actions
- [x] API wiring: All 6 hooks dual-mode (use-clients, use-dashboard-stats, use-workouts, use-messages, use-diet-plans, use-analytics)
- [x] api.ts: ApiError/NetworkError, auto 401 refresh, localStorage tokens
- [x] Login page: Email/password form, brand logo, error handling
- [x] auth-store: login/logout, isAuthenticated, localStorage persistence
- [x] stripe.ts: createCheckoutSession, getSubscriptionStatus, cancelSubscription
- [x] Animations: animate-slide-up on 6 pages, hover-limitless on cards
- [x] Mobile push: pushNotificationService.ts, notificationTypes.ts
- [x] Persistence docs: system_state.md, roadmap.md, tasks.md

## Completed (Session 1)
- [x] Premium design system overhaul (44 files)
- [x] Interactive muscle heatmap (SVG, front/back)
- [x] AI Workout Builder (NLP exercise parser)
- [x] PubMed research backing system
- [x] Video library + upload system
- [x] Gojo-inspired anime UI effects
- [x] Landing page polish (SVG icons, green brand)
- [x] E2E test suite (9/9 passing)
- [x] n8n automation workflows
- [x] Design system tools integration

## Next Session
1. Route protection middleware
2. Error boundaries
3. Stripe webhook handler
4. Real AI integration
5. Deploy to Vercel
