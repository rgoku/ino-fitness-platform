# Supabase Setup — INO Fitness Platform

This guide explains how to bootstrap the INO Fitness backend on Supabase
(managed PostgreSQL + Auth + Storage). Use this path when you want
hosted Postgres without running Alembic against the production database.

For local development with Docker, keep using the Alembic migration
chain in `backend/alembic/versions/` — this doc covers the Supabase
deployment target only.

---

## 1. Create a Supabase project

1. Sign in to <https://supabase.com> and open the dashboard.
2. Click **New Project** and fill in:
   - **Name:** `ino-fitness` (or your preferred slug)
   - **Database password:** generate a strong password and store it in
     your secrets manager (1Password, Doppler, etc.) — you will need it
     for the `DATABASE_URL`.
   - **Region:** pick the region closest to your FastAPI deployment
     (e.g. `us-east-1` if deploying to Fly `iad`, or `eu-central-1` for
     Frankfurt).
   - **Pricing plan:** Free is fine for staging; Pro is recommended for
     production (daily backups, no pausing).
3. Wait ~2 minutes for the project to provision.

---

## 2. Get the connection string

Supabase exposes two connection strings — pick the right one for the
workload:

| Use case                              | Connection string                          |
|---------------------------------------|--------------------------------------------|
| FastAPI on Fly/Railway (long-lived)   | **Session pooler** (port 5432)             |
| Serverless / edge functions           | **Transaction pooler** (port 6543)         |
| Alembic migrations / `psql` one-shots | Direct connection (port 5432, no pooler)   |

Steps:

1. In the Supabase dashboard, open **Project Settings → Database**.
2. Scroll to **Connection string** and copy the **URI** value.
3. Replace `[YOUR-PASSWORD]` with the database password from step 1.
4. Set it as `DATABASE_URL` in your deployment environment:

```bash
# Example (session pooler)
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

SQLAlchemy tip: FastAPI uses `psycopg2` — swap the scheme to
`postgresql+psycopg2://...` only if the default driver isn't picked up.

---

## 3. Run the migration SQL

### Option A — Supabase SQL Editor (fastest)

1. Open the Supabase dashboard → **SQL Editor** → **New query**.
2. Paste the contents of `backend/migrations/001_initial_schema.sql`.
3. Click **Run**. You should see "Success. No rows returned".
4. Verify by running:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   You should see all 13 tables (users, coaches, workout_plans,
   exercises, workout_sessions, diet_plans, meals, food_entries,
   progress_entries, messages, reminders, achievements, subscriptions).

### Option B — psql from your machine

```bash
psql "$DATABASE_URL" -f backend/migrations/001_initial_schema.sql
```

### Option C — Alembic against Supabase (preferred for ongoing changes)

```bash
cd backend
export DATABASE_URL="postgresql://postgres.<project-ref>:<password>@..."
alembic upgrade head
```

Alembic will apply `000_initial_schema` → `001_add_reminders_and_supplements`
→ `002_add_query_indexes` in order. Use this going forward for every
schema change.

---

## 4. Set up Row Level Security (RLS)

Supabase turns RLS **off** by default on tables created via raw SQL. You
MUST enable it before exposing the database to the internet (for example
via the Supabase client SDK or PostgREST). The FastAPI backend connects
as the `postgres` superuser and bypasses RLS, but any client hitting
Supabase directly is subject to these policies.

### 4.1 Enable RLS on every table

Run this in the SQL Editor:

```sql
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;
```

### 4.2 User-scoped policies (owner-only access)

These policies assume the Supabase JWT `sub` claim matches the `user_id`
column (string UUID). The helper `auth.uid()::text` casts Supabase's
UUID to the text column type used by this schema.

```sql
-- users: a user can read/update only their own row
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid()::text = id);

-- Helper macro pattern: for every user-scoped table, restrict
-- SELECT/INSERT/UPDATE/DELETE to rows where user_id = auth.uid().
-- Apply the following block to each of:
--   workout_plans, workout_sessions, diet_plans, food_entries,
--   progress_entries, messages, reminders, achievements, subscriptions

-- Example for workout_plans (repeat for the other 8 tables):
CREATE POLICY "workout_plans_owner_select"
  ON workout_plans FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "workout_plans_owner_insert"
  ON workout_plans FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "workout_plans_owner_update"
  ON workout_plans FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "workout_plans_owner_delete"
  ON workout_plans FOR DELETE
  USING (auth.uid()::text = user_id);
```

### 4.3 Child-row policies (scoped through parent)

`exercises` and `meals` don't have a direct `user_id`; they inherit
ownership through `workout_plan_id` / `diet_plan_id`:

```sql
CREATE POLICY "exercises_owner_access"
  ON exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans wp
      WHERE wp.id = exercises.workout_plan_id
        AND wp.user_id = auth.uid()::text
    )
  );

CREATE POLICY "meals_owner_access"
  ON meals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM diet_plans dp
      WHERE dp.id = meals.diet_plan_id
        AND dp.user_id = auth.uid()::text
    )
  );
```

### 4.4 Coach access (read-only to assigned clients)

Coaches need to read their clients' plans, sessions, and progress. This
policy relies on the `coaches.clients` JSONB array containing the
client's `user_id`:

```sql
CREATE POLICY "workout_plans_coach_read"
  ON workout_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coaches c
      WHERE c.user_id = auth.uid()::text
        AND c.clients ? workout_plans.user_id
    )
  );
-- Repeat for workout_sessions, diet_plans, progress_entries, messages.
```

### 4.5 Service-role bypass

The FastAPI backend connects with the `service_role` key (or the
`postgres` superuser via `DATABASE_URL`). Both automatically bypass RLS,
so server-side code keeps working unchanged. Never expose the
`service_role` key to the browser — it is admin-tier.

---

## 5. Post-setup checklist

- [ ] `DATABASE_URL` set in Fly / Railway / Vercel env
- [ ] `alembic upgrade head` runs cleanly (or SQL migration applied)
- [ ] RLS enabled on all 13 tables
- [ ] At least one SELECT policy exists on every user-scoped table
- [ ] `/health` endpoint returns 200 after deploy
- [ ] Daily backups enabled (Supabase Pro plan)
- [ ] Connection pool size tuned to match uvicorn workers
      (`SQLALCHEMY_POOL_SIZE=5` per worker is a sane default)
