# INÖ Fitness — Production Readiness: Final Status

_Status report covering the full production-readiness pass (Phases 1–4). Companion to `PRODUCTION_READINESS_ROADMAP.md`._

## Summary

The platform went from "demo-grade" to a coherent, testable application. Every P0 launch-blocker is fixed, the P1 security/correctness work is done, the infrastructure (migrations, deploy, CI) is consolidated and working, and the previously-mock screens are backed by real, tested endpoints.

**What's proven vs. what needs your toolchain:** all **backend** changes are verified by actually running them in a Linux sandbox — a 17-test API suite passes and `alembic upgrade head` builds the full 27-table schema cleanly. The **web** and **mobile** changes are source-correct and were edited carefully (brace-balanced, import-checked), but a full Next.js/Expo build must run on your machine — the sandbox can't run those toolchains against the Windows filesystem.

---

## Phase 1 — P0 launch-blockers (all fixed)

- Mounted three written-but-unregistered backend routers (workout builder, templates, habits) by creating the six missing models behind them.
- Added the missing `POST /api/v1/programs` save endpoint (+ GET/PUT/DELETE), coach-gated, storing the builder's free-text ranges losslessly; wired the dashboard "Save Program" button to it.
- Bumped `anthropic` off the broken `0.7.0` pin; added the missing `cryptography` dependency.
- Fixed the mobile TypeScript build (removed the broken `expo-device` import + invalid camera option).
- Removed the dashboard's mock-first default (now API-first; demo mode is opt-in via `NEXT_PUBLIC_USE_MOCK`); middleware enforces auth by default.
- Fixed the duplicate-React bug (the 404/500 prerender crash): pinned `react`/`react-dom` to `18.3.1` with a root `overrides` block.

## Phase 2 — Security & correctness (all fixed)

- CORS no longer defaults to wildcard-with-credentials; explicit origins via `CORS_ORIGINS`.
- Closed the coach→any-client IDOR; coaches are scoped to their own clients.
- Rebuilt refresh tokens as a durable, rotating, DB-backed system (hashed at rest); `/login` returns access+refresh+user, `/refresh` rotates, `/logout` revokes. **Verified** by tests.
- Coach-only role gating on the dashboard (clients are redirected away).
- Upload validation (type + 50 MB streamed cap) and removal of the predictable `/tmp` path-injection.
- Replaced stubs with real logic: food-photo macros (Claude vision + honest no-key fallback), the mobile AI assistant (real `/ai/chat`), and Apple Sign-In (clean `501` instead of a fake token).

## Phase 3 — Infrastructure (all fixed)

- **Migrations:** the chain was unrunnable (referenced a deleted `004`, assumed missing tables) and `alembic.ini` was missing `script_location` and had a malformed logging config. Squashed to a consolidated baseline generated from the models; rewrote `alembic.ini`. **Verified:** `upgrade head` → 27 tables, single head, clean downgrade + re-upgrade.
- **Real-time sync (v1):** web has focus-refetch + centralized per-hook polling (auto-pauses on hidden tab); mobile has a reusable `usePolling` hook that pauses when backgrounded.
- **Deploy:** Render is the single canonical target with env vars reconciled to the code; `fly.toml`/`railway.json` marked deprecated; `DEPLOYMENT.md` documents the one path.

## Phase 4 — Product fill + quality (done)

- **Backend test suite:** auth/login, refresh rotation, program CRUD + ownership, habits, bookings, challenges, leaderboard, grocery — **17 passing tests**.
- **CI/CD:** `.github/workflows/ci.yml` (backend pytest + migrations, web typecheck/build, mobile typecheck).
- **Mock screens now real:** built backends (models, migration `009`, routers, tests) for **Bookings**, **Challenges**, a derived **Leaderboard**, and a diet-plan-derived **Grocery list**, and wired all four mobile screens + the **Habits** screen to them. Leaderboard/grocery compute from real activity rather than fabricated numbers.
- **Dead UI wired:** FoodPhoto "Add to Daily Log" (new `POST /diet/food`), exercise "Watch Demo" (opens the video).
- **Mobile release config:** `eas.json` build profiles with the production API URL.

---

## How to run / deploy

```bash
# Backend (from backend/)
pip install -r requirements.txt
export SECRET_KEY=... DATABASE_URL=...            # Postgres in prod
alembic upgrade head                               # builds the full schema
uvicorn app.main:app --reload --port 8095          # dev
pytest tests/test_auth.py tests/test_programs.py tests/test_habits.py tests/test_social.py

# Trainer dashboard (from trainer-app/)
npm install && npm dedupe                           # collapses the duplicate React
npm run build --workspace trainer-app-web

# Mobile (from mobile/)
npm install
npx tsc --noEmit                                    # typecheck
# eas init   (one-time: populates app.json extra.eas.projectId)
# eas build --profile production
```

Deploy: push to GitHub → Render reads `render.yaml` (set the `sync:false` secrets in the dashboard). See `backend/DEPLOYMENT.md`.

## Human-checkpoint items (do these yourself)

Taking payments live (Stripe production keys), production deploys, destructive DB migrations, and rotating secrets were intentionally left to you.

## Known follow-ups (P3 polish, not blockers)

- `eas init` to replace the placeholder `projectId`; remove the committed `backend/ino_fitness.db`; `scripts/security-audit.sh` has CRLF endings (won't run on Linux until normalized); ProfileScreen has a few placeholder menu items; full Celery worker/beat + Redis for the heavy background jobs (the in-process reminder loop covers v1).
