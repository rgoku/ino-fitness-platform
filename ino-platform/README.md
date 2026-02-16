# INÖ Platform

Coaching platform that helps fitness coaches manage clients, track compliance, automate workflows, and review form videos.

## Prerequisites

Install these before starting:

- **Node.js 20+** → [nodejs.org](https://nodejs.org)
- **pnpm** → `npm install -g pnpm`
- **Docker Desktop** → [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Python 3.12+** (only needed if running API outside Docker)

## Quick Start

```bash
# 1. Install frontend dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env

# 3. Start backend services (Postgres, Redis, MinIO, API)
docker compose up -d

# 4. Wait ~10 seconds for Postgres to be ready, then seed demo data
docker compose exec api python -m scripts.seed

# 5. Start the frontend dev server (in a new terminal)
cd apps/coach-web
pnpm dev
```

Open **http://localhost:3000** and log in:
- **Coach:** `sarah@inocoach.com` / `demo1234`
- **Client:** `james@mail.com` / `demo1234`

API docs at **http://localhost:8000/docs**

## Project Structure

```
ino/
├── apps/
│   ├── coach-web/          React + Vite — Coach Command Center
│   ├── fit-mobile/         React Native/Expo — Client mobile app
│   ├── landing/            Landing page sections
│   └── demo/               Standalone demo artifacts
├── packages/
│   ├── types/              Shared TypeScript interfaces
│   ├── ui/                 Shared UI components + theme + data
│   └── utils/              Shared utility functions
├── services/
│   ├── api/                FastAPI backend
│   │   ├── app/
│   │   │   ├── core/       Config, database, auth, dependencies
│   │   │   ├── models/     SQLAlchemy models (14 tables)
│   │   │   └── routers/    9 API routers
│   │   ├── migrations/     Alembic migrations
│   │   └── scripts/        Seed script
│   ├── auth/               Password hashing, tokens
│   ├── billing/            Stripe integration
│   └── media/              S3 upload, video management
├── infra/
│   ├── docker/             Dockerfiles
│   └── terraform/          AWS infrastructure
├── docs/                   Architecture + API reference
├── docker-compose.yml      Local dev stack
├── Makefile                Dev commands
└── package.json            pnpm workspaces + turborepo
```

## Commands

| Command | What it does |
|---|---|
| `make start` | Docker up + seed (full reset) |
| `make frontend` | Start Vite dev server on :3000 |
| `make seed` | Re-seed demo data |
| `make logs` | Tail API logs |
| `make reset` | Drop everything + fresh start |
| `pnpm dev` | Start all frontend workspaces |
| `pnpm build` | Build all packages |

## Tech Stack

**Frontend:** React 18, Vite, Recharts, Lucide Icons, Plus Jakarta Sans

**Backend:** Python 3.12, FastAPI, SQLAlchemy (async), Alembic, JWT auth, Argon2 passwords

**Infrastructure:** PostgreSQL 16, Redis 7, MinIO (S3), Docker Compose

**Production:** AWS ECS Fargate, RDS, ElastiCache, S3, CloudFront (Terraform)

## API Endpoints

| Router | Prefix | Key endpoints |
|---|---|---|
| Auth | `/auth` | signup, login, refresh, me |
| Coaches | `/coaches` | profile, stats |
| Clients | `/clients` | CRUD, risk flags |
| Workouts | `/workouts` | CRUD, exercises, assign |
| Check-ins | `/checkins` | readiness, weekly, review |
| Videos | `/videos` | upload, pending, review |
| Messages | `/messages` | conversations, send, read |
| Automation | `/automation` | rules CRUD, toggle, logs |
| Billing | `/billing` | plans, checkout, subscription |

Full API reference: `docs/API.md`

## Environment Variables

Copy `.env.example` to `.env`. Docker Compose sets these automatically for local dev:

```
DATABASE_URL=postgresql+asyncpg://ino:ino@localhost:5432/ino
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=change-me-in-production
STRIPE_SECRET_KEY=sk_test_...
S3_BUCKET=ino-media
```
