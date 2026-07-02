# Deployment — INÖ Fitness Backend

**Render is the single supported production deploy target.** The config lives in
[`render.yaml`](./render.yaml). The other deploy files in this folder are kept
for reference only and are **not maintained**:

- `fly.toml` — deprecated (Fly.io)
- `railway.json` — deprecated (Railway)
- `docker-compose.yml` — **local development only** (full stack: api + Celery worker + beat + Postgres + Redis), not a production target.
- `Dockerfile`, `Dockerfile.worker`, `Dockerfile.beat` — used by `docker-compose` and as the build image; not a standalone deploy path.

## Deploy to Render

1. Create a **Render Postgres** instance (the `databases:` block in `render.yaml` provisions one named `ino-fitness-db`).
2. Create a **Web Service** from this repo. Render reads `render.yaml` (Blueprint). `rootDir` is `backend`.
   - **Build:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
   - **Health check:** `/health`
3. Set the secret env vars (marked `sync: false` in `render.yaml`):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Render Postgres internal connection string |
| `SECRET_KEY` | ✅ (auto) | Signs JWT access tokens |
| `JWT_SECRET` | ✅ (auto) | Read by the startup env validator |
| `ANTHROPIC_API_KEY` | ✅ for AI | Workout/diet/chat/food-vision features |
| `STRIPE_SECRET_KEY` | ✅ for billing | Subscriptions / checkout |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins (e.g. `https://app.yourdomain.com`) |
| `SENTRY_DSN` | optional | Error monitoring |
| `REDIS_URL` | optional | Rate limiting / Celery; degrades gracefully if unset |
| `JWT_EXPIRATION_HOURS` | optional | Access-token lifetime (default 24) |

4. Deploy. The build runs `alembic upgrade head`, which creates the full schema from the consolidated baseline migration (`000_initial_schema`).

## Background jobs (reminders / notifications)

For v1, the web service runs an **in-process reminder loop** (every 60s), so basic
reminders work without extra services. The full Celery system (AI queue,
notification/video workers — see `docker-compose.yml`) requires **Redis** plus
separate **worker** and **beat** services. To scale up, provision a Render Redis
instance, set `REDIS_URL`, and add `worker`/`beat` background services using
`Dockerfile.worker` / `Dockerfile.beat`.

## Database migrations

Alembic is the single migration system. History was squashed into a consolidated
baseline (`alembic/versions/000_initial_schema.py`) that builds the schema from
the models; `001`–`008` are linear no-op placeholders. To add a schema change:

```
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

> Destructive migrations (drops, type changes, data backfills) should be reviewed
> by a human before running against production.
