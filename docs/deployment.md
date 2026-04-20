# INÖ Deployment Runbook

End-to-end guide for deploying the INO Fitness platform to production.

## Architecture

```
Vercel (Next.js)    →    Railway/Fly (FastAPI)    →    Supabase (Postgres)
     ↓                          ↓                              ↓
User Browser             Redis (Upstash)              Celery Worker (Railway)
                                ↓
                       Sentry (monitoring)
```

## 1. Database — Supabase

1. Create project at [supabase.com](https://supabase.com/dashboard) → new project
2. Copy connection string from Settings → Database → Connection String (URI format)
3. Run the migration:
   ```bash
   cd backend
   export DATABASE_URL="postgresql://postgres.xxx:[password]@aws-0-region.pooler.supabase.com:6543/postgres"
   alembic upgrade head
   ```
4. (Optional) Enable RLS in Supabase SQL editor — `docs/rls-policies.sql` if you need it later

## 2. Redis — Upstash

1. Create database at [upstash.com](https://upstash.com) → Create Database (Regional, same region as backend)
2. Copy the Redis URL (rediss://...)
3. Use as `REDIS_URL` env var in backend

## 3. Backend — Railway

1. Push the repo to GitHub (already done)
2. Go to [railway.app/new](https://railway.app/new) → Deploy from GitHub repo
3. Select `rgoku/ino-fitness-platform`, root directory: `backend`
4. Railway auto-detects `railway.json` + `Dockerfile`
5. Add env vars in Railway dashboard:
   ```
   DATABASE_URL=postgresql://... (from Supabase)
   REDIS_URL=rediss://... (from Upstash)
   ANTHROPIC_API_KEY=sk-ant-...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_STARTER=price_...
   STRIPE_PRICE_PRO=price_...
   STRIPE_PRICE_SCALE=price_...
   SENTRY_DSN=https://...@sentry.io/...
   JWT_SECRET=<32+ random chars>
   ENVIRONMENT=production
   ```
6. Add a second Railway service for the Celery worker using `Dockerfile.worker`
7. Add a third service for Celery beat using `Dockerfile.beat`
8. Note the public URL (e.g., `ino-api.up.railway.app`)

### Alternative: Fly.io
```bash
cd backend
fly launch --copy-config --no-deploy  # uses fly.toml
fly secrets set ANTHROPIC_API_KEY=... STRIPE_SECRET_KEY=... etc.
fly deploy
```

## 4. Frontend — Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → Import `rgoku/ino-fitness-platform`
2. Set root directory: `trainer-app/apps/web`
3. Framework preset: Next.js (auto-detected via `vercel.json`)
4. Add env vars:
   ```
   NEXT_PUBLIC_API_URL=https://ino-api.up.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   SENTRY_DSN=https://...@sentry.io/...
   ```
5. Click Deploy
6. Custom domain: Settings → Domains → add `coach.ino.fit`

## 5. Monitoring — Sentry

1. Create org at [sentry.io](https://sentry.io)
2. Create two projects: `ino-backend` (Python) and `ino-coach-web` (Next.js)
3. Copy DSN from each project
4. Add to env vars (backend `SENTRY_DSN`, frontend both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`)
5. Sentry is already wired in the code:
   - Backend: `backend/app/main.py` auto-initializes if `SENTRY_DSN` is set
   - Frontend: `sentry.client.config.ts` / `sentry.server.config.ts` / `sentry.edge.config.ts`

## 6. Stripe Webhook

After backend is deployed:
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://ino-api.up.railway.app/api/v1/subscriptions/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in Railway

## 7. Post-Deploy Verification

```bash
# Backend health
curl https://ino-api.up.railway.app/health

# Frontend loads
curl -I https://coach.ino.fit

# Stripe webhook responds
curl -X POST https://ino-api.up.railway.app/api/v1/subscriptions/webhook
# Should return 400 (invalid signature) — that's correct
```

## Rollback

- **Vercel:** Dashboard → Deployments → promote previous build
- **Railway:** Dashboard → service → Deployments → redeploy previous
- **Supabase:** Restore from automatic daily backup

## Costs (monthly estimates)

| Service | Tier | Cost |
|---------|------|------|
| Vercel Pro | 1 project | $20 |
| Railway | 3 services (API + worker + beat) | $20-50 |
| Supabase | Pro | $25 |
| Upstash Redis | Pay-as-you-go | $5-10 |
| Sentry | Team | $26 |
| **Total** | | **~$100/mo** |
