# INÖ Platform — Architecture

## Design Principle

> Every feature must reduce coach cognitive load OR increase client adherence.
> If it does neither, it doesn't ship.

INÖ separates **coach mental load** from **client mental load**. This is the moat. Most competitors build for clients first and duct-tape coach tools on top. We do the opposite.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Coach Web   │  │  Fit Mobile  │  │   Landing / Marketing │   │
│  │  (React)     │  │  (Expo/RN)   │  │   (Next.js)           │   │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────────┘   │
│         │                  │                                      │
│         └────────┬─────────┘                                      │
│                  │ HTTPS                                          │
│         ┌────────▼────────┐                                      │
│         │   API Gateway   │  (ALB / CloudFront)                  │
│         └────────┬────────┘                                      │
├──────────────────┼──────────────────────────────────────────────┤
│                  │                    SERVICES                    │
│         ┌────────▼────────┐                                      │
│         │   FastAPI        │  ← Main API server                  │
│         │   (ECS Fargate)  │                                     │
│         └──┬────┬────┬────┘                                      │
│            │    │    │                                            │
│    ┌───────┘    │    └───────┐                                    │
│    ▼            ▼            ▼                                    │
│  ┌────┐   ┌─────────┐   ┌────────┐                              │
│  │Auth│   │Automation│   │ Media  │                              │
│  │    │   │ Engine   │   │Service │                              │
│  └──┬─┘   └────┬────┘   └───┬────┘                              │
│     │          │             │                                    │
├─────┼──────────┼─────────────┼──────────────────────────────────┤
│     │          │             │          DATA                     │
│  ┌──▼──────────▼──┐    ┌────▼────┐   ┌──────┐                   │
│  │   PostgreSQL   │    │   S3    │   │Redis │                    │
│  │   (RDS)        │    │ (Media) │   │(Cache│                    │
│  └────────────────┘    └─────────┘   │Queue)│                    │
│                                      └──────┘                    │
├──────────────────────────────────────────────────────────────────┤
│  EXTERNAL: Stripe (billing) · SendGrid (email) · FCM/APNs (push)│
└──────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
/apps
  /coach-web         React SPA — coach dashboard
  /fit-mobile        Expo/RN — client mobile app
  /landing           Next.js — marketing site

/services
  /api               FastAPI — all business logic
  /auth              Password hashing, JWT, coach codes
  /billing           Stripe integration
  /media             S3 uploads, video processing, retention

/packages
  /ui                Shared React components + design tokens
  /types             TypeScript domain models (single source of truth)
  /utils             Shared helpers (date formatting, validation, etc.)

/infra
  /terraform         AWS infrastructure (VPC, RDS, ECS, S3, CloudFront)
  /docker            Container definitions

/docs
  ARCHITECTURE.md    This file
  API.md             API endpoint reference
```

---

## Data Model

### Core Entities

| Entity | Description | Key Relationships |
|--------|-------------|-------------------|
| **User** | Base identity (email, role) | → Coach or Client profile |
| **Coach** | Business profile, plan tier | → many Clients, Workouts, Rules |
| **Client** | Adherence, streak, status | → one Coach, many Assignments |
| **Workout** | Exercise list, can be template | → many Exercises, Assignments |
| **CheckIn** | Readiness, weekly, photos | → one Client, one Coach |
| **VideoReview** | Form check with annotations | → one Client, 90-day expiry |
| **Message** | Direct message with attachments | → sender, recipient |
| **AutomationRule** | Trigger → Action pipeline | → one Coach, many executions |
| **Subscription** | Stripe billing state | → one Coach |

### Status Machine: Client

```
invited → active → at_risk → churned
              ↑        │
              └─ paused ┘
```

A client becomes `at_risk` when automation flags trigger (missed workouts, low adherence, no check-in). The coach resolves the flag to return them to `active`.

---

## Authentication Flow

1. **Coach signup** → email/password → JWT access + refresh tokens
2. **Client onboarding** → coach shares 6-char code → client enters in Fit app → auto-linked
3. **Token refresh** → access tokens expire in 30min, refresh tokens in 30 days
4. **Role-based access** → `coach`, `assistant`, `admin`, `client` roles enforced at route level

---

## Automation Engine

The automation engine is the core differentiator at scale. It runs as a background worker (Celery + Redis).

### Event Flow

```
Client action/inaction
    → DomainEvent emitted
        → Celery worker picks up
            → Matches against coach's AutomationRules
                → Executes Actions (with configured delay)
```

### Example Rule

```
TRIGGER: Client misses 2 workouts in 7 days
DELAY:   0 minutes
ACTION:  Send check-in message (template: "missing_you")

TRIGGER: Same client still no activity after 48 hours
DELAY:   48 hours
ACTION:  Flag coach (severity: high)
```

### Built-in Triggers

| Trigger | Config | Description |
|---------|--------|-------------|
| `missed_workouts` | count: N | Client misses N scheduled workouts |
| `no_checkin` | days: N | No check-in submitted in N days |
| `low_readiness` | threshold: N | Readiness score drops below N |
| `streak_milestone` | days: N | Client hits N-day streak |

---

## Video Retention Policy

- Videos stored in S3 with per-object expiry metadata
- **Pro plan**: 90-day rolling retention
- **Scale plan**: 90-day rolling (same — not a cost differentiator)
- Nightly cron deletes expired objects
- S3 lifecycle rule at 120 days as safety net
- Framed to users as "workspace organization" not storage limits

---

## Billing Architecture

```
Coach clicks "Start Trial"
    → Stripe Checkout session created (14-day trial, no CC)
    → On trial end: Stripe collects payment
    → Webhook → API updates subscription status
    → Plan tier gates feature access at API level
```

### Plan Enforcement

Features are gated at the **API route level**, not the frontend. The frontend hides UI for unavailable features, but the API is the source of truth.

```python
# Example: automation requires Pro or Scale
@router.post("/automation/rules")
async def create_rule(coach = Depends(require_plan("pro"))):
    ...
```

---

## Scaling Strategy

### Phase 1: 0–100 coaches (Current)
- Single ECS task, single RDS instance
- MinIO locally, S3 in production
- No CDN needed yet for media

### Phase 2: 100–1,000 coaches
- ECS auto-scaling (2-4 tasks)
- RDS read replica for analytics queries
- CloudFront CDN for media
- Redis for caching hot data (client dashboards)

### Phase 3: 1,000+ coaches
- Multi-AZ RDS
- Dedicated analytics DB (read replica)
- SQS for async video processing
- Consider edge functions for client app API

---

## Security

- All passwords hashed with Argon2id
- JWT tokens with short expiry (30 min access, 30 day refresh)
- HTTPS everywhere (ALB terminates TLS)
- S3 objects are private, accessed via presigned URLs or CloudFront
- Stripe webhooks verified with signature
- CORS restricted to known origins
- SQL injection prevented by SQLAlchemy ORM (parameterized queries)
- File uploads validated by type and size before S3 put

---

## What We Don't Build

- ❌ Courses / content library
- ❌ Community / social features
- ❌ Habit tracking
- ❌ Meal photo AI
- ❌ Wearable integrations
- ❌ "All-in-one" anything

The wedge is **leverage for professional coaches**. Win that first.

---

## North Star Metric

**Check-in completion rate** — the single number that correlates with client retention, coach satisfaction, and revenue growth.

If check-in completion is high, everything else follows:
- Coaches have data → better programs → better results
- Clients feel accountable → higher adherence → longer retention
- Longer retention → higher LTV → sustainable business
