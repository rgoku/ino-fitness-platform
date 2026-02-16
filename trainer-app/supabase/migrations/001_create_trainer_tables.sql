-- Enable extensions
create extension if not exists "uuid-ossp";

-- Clients table
create table clients (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid references auth.users not null,
  name text not null,
  email text,
  avatar_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Workouts table
create table workouts (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients on delete cascade,
  trainer_id uuid references auth.users not null,
  name text not null,
  week int,
  day int,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Workout exercises table
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

-- Logged sets table (client workout history)
create table logged_sets (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients on delete cascade not null,
  workout_exercise_id uuid references workout_exercises on delete cascade,
  reps int,
  weight decimal(10, 2),
  completed_at timestamp default now(),
  created_at timestamp default now()
);

-- Trophies and milestones
create table trophies (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  icon text default 'trophy',
  type text not null check (type in ('workout_count', 'pr', 'streak', 'bodyweight', 'custom')),
  threshold int,
  created_by_trainer boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Client trophies (awarded achievements)
create table client_trophies (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients on delete cascade not null,
  trophy_id uuid references trophies on delete cascade not null,
  awarded_at timestamp default now(),
  unique(client_id, trophy_id)
);

-- Enable Row Level Security (RLS)
alter table clients enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table logged_sets enable row level security;
alter table trophies enable row level security;
alter table client_trophies enable row level security;

-- RLS Policies for clients table
create policy "Trainers can view their own clients"
  on clients for select
  using (auth.uid() = trainer_id);

create policy "Trainers can insert clients"
  on clients for insert
  with check (auth.uid() = trainer_id);

create policy "Trainers can update their own clients"
  on clients for update
  using (auth.uid() = trainer_id);

create policy "Trainers can delete their own clients"
  on clients for delete
  using (auth.uid() = trainer_id);

-- RLS Policies for workouts table
create policy "Trainers can view their workouts"
  on workouts for select
  using (auth.uid() = trainer_id);

create policy "Trainers can create workouts"
  on workouts for insert
  with check (auth.uid() = trainer_id);

create policy "Trainers can update their workouts"
  on workouts for update
  using (auth.uid() = trainer_id);

create policy "Trainers can delete their workouts"
  on workouts for delete
  using (auth.uid() = trainer_id);

-- RLS Policies for workout_exercises
create policy "Anyone can view workout exercises"
  on workout_exercises for select
  using (true);

create policy "Trainers can manage workout exercises"
  on workout_exercises for all
  using (
    exists (
      select 1 from workouts w
      where w.id = workout_id and w.trainer_id = auth.uid()
    )
  );

-- RLS Policies for logged_sets
create policy "Clients can view their logged sets"
  on logged_sets for select
  using (auth.uid() = client_id);

create policy "Trainers can view client logged sets"
  on logged_sets for select
  using (
    exists (
      select 1 from clients c
      where c.id = client_id and c.trainer_id = auth.uid()
    )
  );

create policy "Clients can log sets"
  on logged_sets for insert
  with check (auth.uid() = client_id);

-- RLS Policies for trophies
create policy "Anyone can view trophies"
  on trophies for select
  using (true);

create policy "Only admins/trainers can create trophies"
  on trophies for insert
  with check (auth.role() = 'authenticated');

-- RLS Policies for client_trophies
create policy "Clients can view their trophies"
  on client_trophies for select
  using (auth.uid() = client_id);

create policy "Trainers can award trophies to clients"
  on client_trophies for insert
  with check (
    exists (
      select 1 from clients c
      where c.id = client_id and c.trainer_id = auth.uid()
    )
  );

-- Create indexes for performance
create index idx_clients_trainer_id on clients(trainer_id);
create index idx_workouts_client_id on workouts(client_id);
create index idx_workouts_trainer_id on workouts(trainer_id);
create index idx_workout_exercises_workout_id on workout_exercises(workout_id);
create index idx_logged_sets_client_id on logged_sets(client_id);
create index idx_logged_sets_workout_exercise_id on logged_sets(workout_exercise_id);
create index idx_client_trophies_client_id on client_trophies(client_id);
