# INÖ Fitness — Production Readiness Roadmap

_Generated from a full repository audit (backend, mobile, web/trainer dashboards, infra & docs). This is the execution plan to take the platform from its current "demo-grade" state to a launchable SaaS. Findings are tagged P0 (launch-blocker) → P3 (polish)._

---

## TL;DR — where the project actually stands

The architecture is real and well-organized. A lot of the hard scaffolding exists (16-table data model, 90+ backend endpoints, 40 dashboard pages, 22 mobile screens, real MediaPipe pose analysis, real Anthropic wiring). **But it is not a working product yet** — it currently runs as a polished demo:

- The **coach dashboard defaults to fake data and auto-logs-in as a mock coach**; it only talks to the backend if an env var is set, which it isn't by default.
- The dashboard **won't production-build** due to a duplicate-React bug (the known 404/500 prerender crash).
- Several **written backend routers are never mounted**, so ~20 endpoints are unreachable — including the workout builder save path.
- The **mobile app's TypeScript doesn't compile** (a missing dependency + type errors).
- Key "AI" surfaces are **stubs returning canned data** (food-photo macros, the mobile AI assistant, Apple Sign-In).
- **No role enforcement** separating coaches from clients on the web.
- "**Real-time sync**" is actually polling; there are **two competing backends**, **two migration systems**, and **four deploy targets**.

None of this is fatal — it's a finishing job, not a rebuild. Below is the order to do it in.

---

## Decisions needed from you (these gate everything else)

These are genuine forks I should not pick for you, because they change a lot of downstream work:

1. **Canonical backend** — `backend/` (FastAPI, clearly the primary app) vs `ino-platform/` (a second, parallel platform with its own docker-compose/Postgres/MinIO). Evidence strongly favors `backend/`; I'd archive `ino-platform/` unless you want its async/MinIO stack. **Recommendation: keep `backend/`.**
2. **Database for production** — the repo mixes SQLite (dev), Alembic migrations, **and** raw-SQL Supabase migrations. Pick one prod DB. **Recommendation: Postgres via `render.yaml` (already the most complete), Alembic as the single migration system.**
3. **Real-time strategy** — your spec says "no refresh needed, real-time." Today everything polls. Options: (a) keep polling for v1 launch (cheapest, already works), (b) add WebSockets/SSE properly. **Recommendation: ship v1 on tuned polling, add WebSockets in a fast-follow.**
4. **Deploy target** — collapse Fly + Railway + Render + raw Docker to one. **Recommendation: Render.**

I can proceed on the four recommendations unless you say otherwise.

---

## Phase 0 — Architecture cleanup (1–2 sessions)

- [ ] Confirm `backend/` canonical; move `ino-platform/` to `/archive` (don't delete yet). **[P1]**
- [ ] Pick prod DB (Postgres) + single migration system (Alembic); delete/merge the duplicate Supabase migration trees (`supabase/migrations` vs `trainer-app/supabase/migrations`). **[P1]**
- [ ] Quarantine stale docs (the "AI Fitness Empire / $20k MRR / production-ready-today" set: `START_HERE_FINAL.md`, `EXECUTIVE_SUMMARY.md`, `COMPLETE_CODEBASE_GUIDE.md`, `MONETIZATION_STRATEGY.md`). Keep `ARCHITECTURE.md` + `CLAUDE.md` + `README.md` as source of truth. Delete empty `BACKEND_ANALYSIS_AND_IMPROVEMENTS.md`; dedupe `CLAUDE.md`/`AGENTS.md`. **[P2]**
- [ ] Remove committed dev artifact `backend/ino_fitness.db` from the working tree. **[P2]**

## Phase 1 — Make it boot & make it real (P0 — the launch-blockers)

- [ ] **Fix duplicate React** in `trainer-app` (apps/web has 18.3.1 nested while root hoists 18.2.0). Pin react/react-dom to an exact version across root + apps/web, `npm dedupe`, remove the nested copy. This resolves the styled-jsx 404/500 prerender crash. **[P0]**
- [ ] **Turn off mock-first defaults** in the dashboard: wire `NEXT_PUBLIC_API_URL`, make `USE_API` real, remove `MOCK_COACH` auto-login and the dev creds printed on the login page. **[P0]**
- [ ] **Mount the orphaned routers** in `backend/app/main.py`: `workout_builder`, `templates`, `habits` (~20 endpoints currently unreachable). **[P0]**
- [ ] **Add `POST /programs` save endpoint** (backend) and wire the dashboard builder + builder-dnd save (currently a TODO) and mobile. **[P0]**
- [ ] **Fix the `anthropic==0.7.0` pin** — code uses modern SDK features (system lists / cache_control) that 0.7.0 doesn't have; bump to a compatible version and smoke-test a real AI call. **[P0]**
- [ ] **Fix mobile build**: add missing `expo-device` (or delete the dead `pushNotificationService.ts` that imports it), fix the `tsc --noEmit` errors (`ExerciseCamera` camera option, AsyncStorage typings). Get a green typecheck. **[P0]**

## Phase 2 — Security & correctness (P1)

- [ ] **Role enforcement (web)**: `middleware.ts` only checks token presence and fully bypasses auth when no API URL is set; there is no coach/client role gate anywhere. Add real role guards so clients can never reach coach tools. **[P1]**
- [ ] **IDOR (backend)**: `ensure_own_or_coach` lets any coach read any client ("for now" comment). Enforce coach↔client assignment. **[P1]**
- [ ] **Refresh tokens**: a real rotating system exists in `core/jwt.py` but is orphaned — `/login` issues none and `/refresh` bypasses it; the store is in-memory (breaks multi-worker). Wire it properly + persist (Redis/DB). Mobile stores a refresh token but never uses it. **[P1]**
- [ ] **Replace stubs with real logic**: food-photo macro analysis (`domain/ai/service.py` returns hardcoded Chicken/Rice/Broccoli), mobile `AIAssistantScreen` (canned setTimeout replies — a real `aiCoachService` path already exists), Apple Sign-In (throws but the button is shown). **[P1]**
- [ ] **CORS**: defaults to `*` with `allow_credentials=True` (invalid combo). Lock to known origins. **[P1]**
- [ ] **File-upload validation**: body-analysis & form endpoints accept uploads with no size/type checks and write to a predictable `/tmp/exercise_{name}.mp4` (path-injection). Validate + sanitize + clean up. **[P1]**
- [ ] Run `scripts/security-audit.sh` and clear its findings (default JWT secret check, etc.). **[P1]**

## Phase 3 — Sync, data, and deploy consolidation (P1/P2)

- [ ] **Real-time**: tune polling for v1 (or implement WebSocket/SSE if chosen). Make coach↔client changes propagate (workout edits, food logs, feedback, progress photos). **[P1]**
- [ ] **Migrations**: one system, generate a clean baseline, add rollback steps, seed production-safe demo data. _(Destructive migration steps are a human checkpoint.)_ **[P1]**
- [ ] **Deploy**: keep one target (Render), move the others to `/deploy/archive`. Reconcile `uvicorn app.main:app` vs `main:app` mismatches. **[P2]**
- [ ] **Shared packages**: `@trainer-app/ui` exports RN-only interface types but is depended on by the web app; `@trainer-app/api` is unused by web. Fix or drop these to remove build-noise/risk. **[P1]**
- [ ] **Mobile native deps**: Firebase + Stripe RN are declared but effectively unused — either wire them or remove to cut build burden (Firebase will demand `google-services.json` at build). **[P1]**

## Phase 4 — Fill the product (P2)

- [ ] **Replace fully-mock mobile screens** with real API data: `Bookings`, `Challenges`, `Habits`, `Leaderboard`, `GroceryList`. **[P2]**
- [ ] Wire the remaining dead UI: progress-photo upload (service exists, no screen), exercise "Watch Demo" button (no player), FoodPhoto "Add to Daily Log" (no-op alert), hardcoded muscle-heatmap volumes → real data. **[P2]**
- [ ] **Wire dashboard hooks to the backend** end-to-end (every `use-*` hook currently has a mock branch). **[P2]**
- [ ] **EAS / mobile release config**: add `eas.json`, replace placeholder `projectId`, set a real prod API URL. **[P2]**
- [ ] **CI/CD**: add `.github/workflows` (lint, typecheck, pytest, next build, expo prebuild check). **[P2]**
- [ ] **Tests**: backend tests cover only reminders/notifications/supplements/rate-limit — add auth, JWT, workouts, AI, body-analysis, and route-integration tests. Populate the empty `e2e/`. **[P2]**

## Phase 5 — Polish (P3)

- [ ] ProfileScreen dead buttons + "coming soon"; dark-mode/theme toggle (app currently forced light); remaining `subscriptions.py` TODO; doc consolidation finish. **[P3]**

---

## Human-checkpoint items (I will not do these silently)

- Taking **payments live** (Stripe production keys / real checkout).
- **Production deploys** to Render/hosting.
- **Destructive database migrations** (drops, type changes, data backfills).
- Adding/rotating **secrets** or changing security-sensitive config.

## What's already in good shape (don't touch)

- Secrets hygiene: no real credentials committed; `.env` files are gitignored and untracked.
- JWT (HS256 + bcrypt), per-route + Redis rate limiting, security-headers/IP-blocking/input-sanitization middleware.
- Real MediaPipe + OpenCV pose/form analysis; real PubMed integration; real Anthropic wiring (pending the version-pin fix).
- Mobile offline queue (genuine store-and-replay), push-notification handling, biometric login, role redirect.
- Clean 16-table data model.

---

_Next: with your go-ahead on the four decisions above, I'll start Phase 1 (all P0 items are safe and decision-independent) and verify each fix compiles/builds before moving on._
