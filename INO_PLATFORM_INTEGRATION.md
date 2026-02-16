# INO Platform — Integration Guide

The **ino-platform** folder is the full INÖ coaching stack added into this repo. It gives you a coach command center (web), client mobile app (Expo), landing page, shared packages, and a FastAPI backend with Postgres, Redis, and MinIO.

## What’s in this repo now

| Area | What you have |
|------|----------------|
| **Original app** | `backend/`, `mobile/`, `trainer-app/`, `coach-portal/`, `web-app/` — AI fitness, diet, form check, Supabase/SQLite |
| **ino-platform** | `ino-platform/` — Coach dashboard (React + Vite), fit-mobile (Expo), landing, shared TS packages, FastAPI API with Postgres/Redis/MinIO |

You can run either stack independently or use both (e.g. original mobile + ino coach web).

## Quick start — ino-platform only

From the repo root:

```bash
cd ino-platform
pnpm install
copy .env.example .env
docker compose up -d
# Wait ~10s for Postgres, then:
docker compose exec api python -m scripts.seed
```

Then start the coach web app:

```bash
cd apps/coach-web
pnpm dev
```

- **Coach UI:** http://localhost:3000  
- **API docs:** http://localhost:8000/docs  
- **Demo coach:** `sarah@inocoach.com` / `demo1234`  
- **Demo client:** `james@mail.com` / `demo1234`

**Windows:** Use `copy .env.example .env` instead of `cp`. If you don’t have `make`, run `docker compose up -d` and `docker compose exec api python -m scripts.seed` directly.

Full details: [ino-platform/README.md](ino-platform/README.md)

## Quick start — original INO Fitness App

- **Backend:** `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
- **Mobile:** `cd mobile && npm install && npx expo start`

See [README.md](README.md) and [START_HERE_FINAL.md](START_HERE_FINAL.md).

## Making it better — suggested next steps

1. **Single backend (optional)**  
   Merge the original `backend/` (auth, workouts, diet, AI) with `ino-platform/services/api` so one API serves both the existing mobile app and the ino coach web (e.g. same JWT, shared user/coach tables).

2. **Shared types**  
   Use `ino-platform/packages/types` from the original mobile or web-app so frontend and API stay in sync.

3. **One coach entry**  
   Use `ino-platform/apps/coach-web` as the main coach UI and retire or redirect `coach-portal/` and `trainer-app/` to it once feature parity is reached.

4. **Unified env**  
   Add a root `.env.example` that documents variables for both backends (e.g. `DATABASE_URL` for ino, `SUPABASE_URL` for original) so devs can run either or both.

5. **files (1).zip**  
   The contents of that zip match the ino API (same routers, models, `app.*` layout). They’re already represented in `ino-platform/services/api/app`. No extra merge is required unless you have a different version to pull in.

## Ports

| Service | Port |
|--------|------|
| ino coach-web (Vite) | 3000 |
| ino API | 8000 |
| Postgres (ino) | 5432 |
| Redis (ino) | 6379 |
| MinIO API / Console | 9000 / 9001 |

If the original backend also uses 8000, run one of them on a different port (e.g. `uvicorn main:app --port 8001`).
