-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Clients table: Trainer's clients
create table clients (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid references auth.users not null,
  name text not null,
  email text,
  avatar_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Workouts table: Assigned workout plans
create table workouts (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients on delete cascade not null,
  trainer_id uuid references auth.users not null,
  name text not null,
  week int,
  day int,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Workout exercises table: Individual exercises within a workout
create table workout_exercises (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid references workouts on delete cascade not null,
  exercise_name text not null,
  sets int,
  reps text,
  rpe text,
  rest text,
  video_url text,
  notes text,
  order_index int,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Logged sets table: Client's workout history (PRs, performance tracking)
create table logged_sets (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients on delete cascade not null,
  workout_exercise_id uuid references workout_exercises on delete cascade not null,
  reps int,
  weight decimal,
  completed_at timestamp default now(),
  created_at timestamp default now()
);

-- Trophies table: Achievement definitions (system & custom)
create table trophies (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  icon text default 'trophy',
  type text check (type in ('workout_count', 'pr', 'streak', 'bodyweight', 'custom')) not null,
  threshold int,
  created_by_trainer boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Client trophies table: Awarded trophies (prevents duplicates with unique constraint)
create table client_trophies (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients on delete cascade not null,
  trophy_id uuid references trophies on delete cascade not null,
  awarded_at timestamp default now(),
  created_at timestamp default now(),
  unique(client_id, trophy_id)
);

-- Workout Templates table: For copy/paste programs
create table workout_templates (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid references auth.users not null,
  name text not null,
  description text,
  weeks int,
  days_per_week int,
  thumbnail_url text,
  is_public boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Template Exercises table: Exercises inside templates
create table template_exercises (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references workout_templates on delete cascade not null,
  exercise_name text not null,
  sets int,
  reps text,
  rest_seconds int,
  notes text,
  order_index int,
  created_at timestamp default now()
);

-- Form Videos table: User-uploaded form check videos
create table form_videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  video_url text not null,
  exercise_name text not null,
  processed boolean default false,
  rep_count int,
  form_score float,
  feedback jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- ============================================================================
-- INDEXES (for performance)
-- ============================================================================

create index idx_clients_trainer_id on clients(trainer_id);
create index idx_workouts_client_id on workouts(client_id);
create index idx_workouts_trainer_id on workouts(trainer_id);
create index idx_workout_exercises_workout_id on workout_exercises(workout_id);
create index idx_logged_sets_client_id on logged_sets(client_id);
create index idx_logged_sets_exercise_id on logged_sets(workout_exercise_id);
create index idx_client_trophies_client_id on client_trophies(client_id);
create index idx_workout_templates_trainer_id on workout_templates(trainer_id);
create index idx_template_exercises_template_id on template_exercises(template_id);
create index idx_form_videos_user_id on form_videos(user_id);
create index idx_form_videos_processed on form_videos(processed);

-- ============================================================================
-- ROW LEVEL SECURITY (authorization)
-- ============================================================================

-- Enable RLS on all tables
alter table clients enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table logged_sets enable row level security;
alter table trophies enable row level security;
alter table client_trophies enable row level security;

-- Clients: Trainers can only see their own clients
create policy "trainers_see_own_clients"
  on clients
  for select
  using (auth.uid() = trainer_id);

create policy "trainers_create_clients"
  on clients
  for insert
  with check (auth.uid() = trainer_id);

create policy "trainers_update_own_clients"
  on clients
  for update
  using (auth.uid() = trainer_id);

create policy "trainers_delete_own_clients"
  on clients
  for delete
  using (auth.uid() = trainer_id);

-- Workouts: Trainers see their own workouts; clients see assigned workouts
create policy "trainers_see_own_workouts"
  on workouts
  for select
  using (auth.uid() = trainer_id);

create policy "clients_see_assigned_workouts"
  on workouts
  for select
  using (auth.uid() = client_id);

create policy "trainers_create_workouts"
  on workouts
  for insert
  with check (auth.uid() = trainer_id);

create policy "trainers_update_workouts"
  on workouts
  for update
  using (auth.uid() = trainer_id);

create policy "trainers_delete_workouts"
  on workouts
  for delete
  using (auth.uid() = trainer_id);

-- Workout exercises: Public read (anyone can see), owner can modify
create policy "anyone_see_exercises"
  on workout_exercises
  for select
  using (true);

create policy "trainers_manage_exercises"
  on workout_exercises
  for all
  using (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
      and workouts.trainer_id = auth.uid()
    )
  );

-- Logged sets: Clients see own, trainers see their clients'
create policy "clients_see_own_logged_sets"
  on logged_sets
  for select
  using (auth.uid() = client_id);

create policy "trainers_see_client_logged_sets"
  on logged_sets
  for select
  using (
    exists (
      select 1 from clients
      where clients.id = logged_sets.client_id
      and clients.trainer_id = auth.uid()
    )
  );

create policy "clients_log_own_sets"
  on logged_sets
  for insert
  with check (auth.uid() = client_id);

-- Trophies: Everyone can read, system only (no direct insert/update)
create policy "anyone_read_trophies"
  on trophies
  for select
  using (true);

-- Client trophies: Clients see own, trainers can award to clients
create policy "clients_see_own_trophies"
  on client_trophies
  for select
  using (auth.uid() = client_id);

create policy "trainers_see_client_trophies"
  on client_trophies
  for select
  using (
    exists (
      select 1 from clients
      where clients.id = client_trophies.client_id
      and clients.trainer_id = auth.uid()
    )
  );

create policy "trainers_award_trophies"
  on client_trophies
  for insert
  with check (
    exists (
      select 1 from clients
      where clients.id = client_trophies.client_id
      and clients.trainer_id = auth.uid()
    )
  );

-- Workout Templates: Trainers manage their own, public templates visible to all
alter table workout_templates enable row level security;

create policy "trainers_see_own_templates"
  on workout_templates
  for select
  using (auth.uid() = trainer_id or is_public = true);

create policy "trainers_create_templates"
  on workout_templates
  for insert
  with check (auth.uid() = trainer_id);

create policy "trainers_update_own_templates"
  on workout_templates
  for update
  using (auth.uid() = trainer_id);

create policy "trainers_delete_own_templates"
  on workout_templates
  for delete
  using (auth.uid() = trainer_id);

-- Template Exercises: Visible if template is visible
alter table template_exercises enable row level security;

create policy "anyone_see_template_exercises"
  on template_exercises
  for select
  using (
    exists (
      select 1 from workout_templates
      where workout_templates.id = template_exercises.template_id
      and (workout_templates.is_public = true or workout_templates.trainer_id = auth.uid())
    )
  );

create policy "trainers_manage_template_exercises"
  on template_exercises
  for all
  using (
    exists (
      select 1 from workout_templates
      where workout_templates.id = template_exercises.template_id
      and workout_templates.trainer_id = auth.uid()
    )
  );

-- Form Videos: Users manage their own, trainers can view clients'
alter table form_videos enable row level security;

create policy "users_see_own_form_videos"
  on form_videos
  for select
  using (auth.uid() = user_id);

create policy "trainers_see_client_form_videos"
  on form_videos
  for select
  using (
    exists (
      select 1 from clients
      where clients.id = form_videos.user_id
      and clients.trainer_id = auth.uid()
    )
  );

create policy "users_upload_form_videos"
  on form_videos
  for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA (optional - system trophies)
-- ============================================================================

insert into trophies (title, description, icon, type, threshold, created_by_trainer)
values
  ('🏋️ First Workout', 'Complete your first workout', '🏋️', 'workout_count', 1, false),
  ('💪 Gym Rat', 'Complete 10 workouts', '💪', 'workout_count', 10, false),
  ('🔥 Consistency', 'Complete 50 workouts', '🔥', 'workout_count', 50, false),
  ('🎯 Personal Record', 'Set your first personal record', '🎯', 'pr', 1, false),
  ('⭐ 5 PRs', 'Set 5 personal records', '⭐', 'pr', 5, false),
  ('🌟 Bodyweight Master', 'Complete a bodyweight milestone', '🌟', 'bodyweight', 1, false);

-- ============================================================================
-- COMMENTS (documentation)
-- ============================================================================

comment on table clients is 'Trainer''s clients - base relationship';
comment on table workouts is 'Assigned workout plans for clients';
comment on table workout_exercises is 'Individual exercises within a workout';
comment on table logged_sets is 'Client workout history and performance tracking';
comment on table trophies is 'Achievement definitions for gamification';
comment on table client_trophies is 'Awarded achievements to clients';

comment on column workouts.week is 'Training week number (1-based)';
comment on column workouts.day is 'Day of week (1=Monday, 7=Sunday)';
comment on column workout_exercises.rpe is 'Rate of Perceived Exertion (1-10)';
comment on column logged_sets.weight is 'Weight in lbs (or kg - document unit)';
comment on column trophies.type is 'Achievement category for filtering/display';
comment on column client_trophies.unique is 'Prevents duplicate trophy awards';
