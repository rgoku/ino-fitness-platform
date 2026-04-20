-- =====================================================================
-- INO Fitness Platform — Initial Schema (Supabase / raw PostgreSQL)
-- =====================================================================
-- This file mirrors backend/alembic/versions/000_initial_schema.py and
-- is suitable for running directly on Supabase (or any PostgreSQL 15+
-- instance) when Alembic is not available.
--
-- Creates all 14 core models:
--   1.  users
--   2.  coaches
--   3.  workout_plans
--   4.  exercises
--   5.  workout_sessions
--   6.  diet_plans
--   7.  meals
--   8.  food_entries
--   9.  progress_entries
--   10. messages
--   11. reminders
--   12. achievements
--   13. subscriptions
--
-- Notes:
--   * Primary keys are UUIDs stored as TEXT to match the SQLAlchemy
--     `Column(String, default=lambda: str(uuid.uuid4()))` convention.
--   * JSON columns use JSONB for Postgres performance.
--   * After running this file, apply RLS policies — see supabase_setup.md.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                   TEXT PRIMARY KEY,
    email                TEXT UNIQUE,
    hashed_password      TEXT,
    name                 TEXT,
    profile_picture_url  TEXT,
    age                  INTEGER,
    gender               TEXT,
    weight               DOUBLE PRECISION,
    height               DOUBLE PRECISION,
    fitness_goal         TEXT,
    experience_level     TEXT DEFAULT 'beginner',
    subscription_tier    TEXT DEFAULT 'free',
    has_onboarded        BOOLEAN DEFAULT FALSE,
    biometrics_enabled   BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- ---------------------------------------------------------------------
-- coaches
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coaches (
    id           TEXT PRIMARY KEY,
    user_id      TEXT REFERENCES users(id),
    name         TEXT,
    bio          TEXT,
    specialties  JSONB,
    photo_url    TEXT,
    clients      JSONB DEFAULT '[]'::jsonb,
    rating       DOUBLE PRECISION DEFAULT 0,
    hourly_rate  DOUBLE PRECISION,
    created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_coaches_user_id ON coaches (user_id);

-- ---------------------------------------------------------------------
-- workout_plans
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_plans (
    id           TEXT PRIMARY KEY,
    user_id      TEXT REFERENCES users(id),
    name         TEXT,
    description  TEXT,
    difficulty   TEXT,
    duration     INTEGER,
    focus_areas  JSONB,
    generated_by TEXT DEFAULT 'ai',
    coach_id     TEXT,
    created_at   TIMESTAMP DEFAULT NOW(),
    updated_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_workout_plans_user_id ON workout_plans (user_id);

-- ---------------------------------------------------------------------
-- exercises
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
    id              TEXT PRIMARY KEY,
    workout_plan_id TEXT REFERENCES workout_plans(id),
    name            TEXT,
    description     TEXT,
    muscle_groups   JSONB,
    equipment       JSONB,
    instructions    JSONB,
    video_url       TEXT,
    image_url       TEXT,
    sets            INTEGER DEFAULT 3,
    reps            INTEGER DEFAULT 10,
    rest_seconds    INTEGER DEFAULT 60,
    created_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_exercises_name ON exercises (name);
CREATE INDEX IF NOT EXISTS ix_exercises_workout_plan_id ON exercises (workout_plan_id);

-- ---------------------------------------------------------------------
-- workout_sessions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_sessions (
    id               TEXT PRIMARY KEY,
    workout_plan_id  TEXT REFERENCES workout_plans(id),
    user_id          TEXT REFERENCES users(id),
    date             TIMESTAMP DEFAULT NOW(),
    duration         INTEGER,
    calories_burned  DOUBLE PRECISION DEFAULT 0,
    is_completed     BOOLEAN DEFAULT FALSE,
    session_data     JSONB,
    created_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_workout_sessions_workout_plan_id ON workout_sessions (workout_plan_id);
CREATE INDEX IF NOT EXISTS ix_workout_sessions_user_id ON workout_sessions (user_id);
CREATE INDEX IF NOT EXISTS ix_workout_sessions_date ON workout_sessions (date);
CREATE INDEX IF NOT EXISTS ix_workout_sessions_user_date ON workout_sessions (user_id, date);

-- ---------------------------------------------------------------------
-- diet_plans
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diet_plans (
    id                          TEXT PRIMARY KEY,
    user_id                     TEXT REFERENCES users(id),
    name                        TEXT,
    description                 TEXT,
    calorie_target              DOUBLE PRECISION,
    protein_target              DOUBLE PRECISION,
    carb_target                 DOUBLE PRECISION,
    fat_target                  DOUBLE PRECISION,
    generated_by                TEXT DEFAULT 'ai',
    coach_id                    TEXT,
    scientific_basis            TEXT,
    evidence_level              TEXT DEFAULT 'moderate',
    research_citations          JSONB,
    research_verified           BOOLEAN DEFAULT TRUE,
    supplement_recommendations  JSONB,
    created_at                  TIMESTAMP DEFAULT NOW(),
    updated_at                  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_diet_plans_user_id ON diet_plans (user_id);

-- ---------------------------------------------------------------------
-- meals
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meals (
    id                    TEXT PRIMARY KEY,
    diet_plan_id          TEXT REFERENCES diet_plans(id),
    name                  TEXT,
    meal_type             TEXT,
    calories              DOUBLE PRECISION,
    protein               DOUBLE PRECISION,
    carbs                 DOUBLE PRECISION,
    fat                   DOUBLE PRECISION,
    ingredients           JSONB,
    instructions          JSONB,
    image_url             TEXT,
    nutritional_benefits  TEXT,
    research_backed       BOOLEAN DEFAULT TRUE,
    created_at            TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_meals_diet_plan_id ON meals (diet_plan_id);

-- ---------------------------------------------------------------------
-- food_entries
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_entries (
    id         TEXT PRIMARY KEY,
    user_id    TEXT REFERENCES users(id),
    food_name  TEXT,
    meal_type  TEXT,
    calories   DOUBLE PRECISION,
    protein    DOUBLE PRECISION,
    carbs      DOUBLE PRECISION,
    fat        DOUBLE PRECISION,
    quantity   DOUBLE PRECISION,
    unit       TEXT,
    image_url  TEXT,
    confidence DOUBLE PRECISION,
    date       TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_food_entries_user_id ON food_entries (user_id);
CREATE INDEX IF NOT EXISTS ix_food_entries_date ON food_entries (date);

-- ---------------------------------------------------------------------
-- progress_entries
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS progress_entries (
    id           TEXT PRIMARY KEY,
    user_id      TEXT REFERENCES users(id),
    date         TIMESTAMP DEFAULT NOW(),
    weight       DOUBLE PRECISION,
    body_fat     DOUBLE PRECISION,
    muscle_mass  DOUBLE PRECISION,
    measurements JSONB,
    photos       JSONB,
    mood         TEXT,
    notes        TEXT,
    created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_progress_entries_user_id ON progress_entries (user_id);

-- ---------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id           TEXT PRIMARY KEY,
    user_id      TEXT REFERENCES users(id),
    coach_id     TEXT,
    sender_type  TEXT,
    content      TEXT,
    message_type TEXT DEFAULT 'text',
    read         BOOLEAN DEFAULT FALSE,
    attachments  JSONB,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reminders (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id),
    title      TEXT NOT NULL,
    message    TEXT NOT NULL,
    remind_at  TIMESTAMP NOT NULL,
    repeat     TEXT,
    channel    TEXT DEFAULT 'in-app',
    sent       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_reminders_user_id ON reminders (user_id);

-- ---------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
    id           TEXT PRIMARY KEY,
    user_id      TEXT REFERENCES users(id),
    title        TEXT,
    description  TEXT,
    icon         TEXT,
    progress     INTEGER DEFAULT 0,
    target       INTEGER DEFAULT 100,
    unlocked_at  TIMESTAMP,
    created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_achievements_user_id ON achievements (user_id);

-- ---------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id                       TEXT PRIMARY KEY,
    user_id                  TEXT UNIQUE REFERENCES users(id),
    plan_type                TEXT,
    status                   TEXT DEFAULT 'active',
    stripe_subscription_id   TEXT,
    current_period_end       TIMESTAMP,
    cancel_at_period_end     BOOLEAN DEFAULT FALSE,
    created_at               TIMESTAMP DEFAULT NOW(),
    updated_at               TIMESTAMP DEFAULT NOW()
);

COMMIT;
