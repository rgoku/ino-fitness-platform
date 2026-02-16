# Supabase Integration Guide

Supabase is a PostgreSQL database with built-in auth, real-time capabilities, and a clean API. This guide explains how to set up and use Supabase with the trainer app.

## What's Included

### Database Schema
- **clients** - Trainer's clients
- **workouts** - Assigned workouts with exercises
- **workout_exercises** - Individual exercises in a workout
- **logged_sets** - Client workout history (sets completed)
- **trophies** - Achievement definitions
- **client_trophies** - Awarded achievements

### Security (RLS Policies)
- Trainers can only see their own clients and workouts
- Clients can only see their own data
- Trophies are read-only for all users

### Real-time Subscriptions
Ready for live updates (e.g., new trophy awarded, workout logged)

---

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization or use existing
4. Create new project:
   - **Name**: ai-fitness-trainer (or your choice)
   - **Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing**: Free tier is fine for development

5. Wait for project to initialize (1-2 minutes)

### Step 2: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_create_trainer_tables.sql`
4. Paste into SQL editor
5. Click **Run**
6. Verify tables are created:
   - Go to **Table Editor**
   - Should see: clients, workouts, workout_exercises, logged_sets, trophies, client_trophies

### Step 3: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** (keep secret) → `SUPABASE_SERVICE_KEY`

3. Save these in your environment variables

### Step 4: Enable Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure **Email Templates** (optional)
4. Go to **URL Configuration** → Add redirect URLs:
   - For local dev: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

### Step 5: Install Supabase in Your Apps

```bash
# Root or in each app
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs  # For Next.js
npm install @react-native-async-storage/async-storage  # For mobile
```

### Step 6: Configure Environment Variables

**Mobile** (`apps/mobile/.env.local`):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Web** (`apps/web/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Usage Examples

### Mobile (React Native with Expo)

```typescript
import { supabase, clientService } from '@trainer-app/api/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'trainer@example.com',
  password: 'secure-password',
});

// Get clients
const { data: clients } = await clientService.getClients(trainerId);

// Create client
const { data: newClient } = await clientService.createClient(trainerId, {
  name: 'John Doe',
  email: 'client@example.com',
});

// Create workout
const { data: workout } = await workoutService.createWorkout(
  trainerId,
  clientId,
  {
    name: 'Monday Chest',
    week: 1,
    day: 1,
    notes: 'Focus on compound movements',
  }
);

// Add exercises to workout
const { data: exercise } = await exerciseService.createExercise({
  workout_id: workout.id,
  exercise_name: 'Bench Press',
  sets: 4,
  reps: '6-8',
  rpe: '7-8',
  rest: '90-120s',
});

// Log workout set
const { data: logged } = await loggingService.logSet({
  client_id: clientId,
  workout_exercise_id: exercise.id,
  reps: 8,
  weight: 225,
});

// Award trophy
const { data: trophy } = await trophyService.awardTrophy(
  clientId,
  trophyId
);
```

### Web (Next.js)

```typescript
'use client';

import { clientService, workoutService } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import type { Client, TrainerWorkout } from '@trainer-app/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [trainerId, setTrainerId] = useState('');

  useEffect(() => {
    async function loadClients() {
      if (!trainerId) return;

      const { data, error } = await clientService.getClients(trainerId);
      if (error) console.error(error);
      else setClients(data || []);
    }

    loadClients();
  }, [trainerId]);

  return (
    <div>
      <h1>My Clients</h1>
      <ul>
        {clients.map((client) => (
          <li key={client.id}>
            <h3>{client.name}</h3>
            <p>{client.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Database Schema Details

### Clients Table
```sql
id              UUID (primary key)
trainer_id      UUID (references auth.users)
name            text (required)
email           text (optional)
avatar_url      text (optional)
created_at      timestamp
updated_at      timestamp
```

### Workouts Table
```sql
id              UUID (primary key)
client_id       UUID (references clients)
trainer_id      UUID (references auth.users)
name            text (required)
week            int (optional)
day             int (optional)
notes           text (optional)
created_at      timestamp
updated_at      timestamp
```

### Workout Exercises Table
```sql
id              UUID (primary key)
workout_id      UUID (references workouts) - required
exercise_name   text (required)
sets            int (optional)
reps            text (optional, e.g., "6-8")
rpe             text (optional, e.g., "7-8")
rest            text (optional, e.g., "90-120s")
video_url       text (optional)
notes           text (optional)
order_index     int (optional)
created_at      timestamp
updated_at      timestamp
```

### Logged Sets Table (Workout History)
```sql
id                      UUID (primary key)
client_id               UUID (references clients) - required
workout_exercise_id     UUID (references workout_exercises)
reps                    int (required)
weight                  decimal (optional)
completed_at            timestamp
created_at              timestamp
```

### Trophies Table
```sql
id                  UUID (primary key)
title               text (required)
description         text (optional)
icon                text (default: 'trophy')
type                text (one of: 'workout_count', 'pr', 'streak', 'bodyweight', 'custom')
threshold           int (optional, e.g., 100 for 100 workouts)
created_by_trainer  boolean (default: false)
created_at          timestamp
updated_at          timestamp
```

### Client Trophies Table
```sql
id          UUID (primary key)
client_id   UUID (references clients) - required
trophy_id   UUID (references trophies) - required
awarded_at  timestamp
unique(client_id, trophy_id)  -- prevent duplicate awards
```

---

## Row Level Security (RLS) Policies

### Clients
- **Select**: Trainers can see only their own clients
- **Insert**: Trainers can create clients for their account
- **Update**: Trainers can update their own clients
- **Delete**: Trainers can delete their own clients

### Workouts
- **Select**: Trainers can see only their workouts
- **Insert**: Trainers can create workouts
- **Update**: Trainers can update their workouts
- **Delete**: Trainers can delete their workouts

### Workout Exercises
- **Select**: Anyone can view exercises (public)
- **All**: Only trainer who owns the parent workout can manage

### Logged Sets
- **Select**: 
  - Clients can see their own sets
  - Trainers can see their clients' sets
- **Insert**: Clients can log their own sets

### Trophies
- **Select**: Anyone can view trophies (public read-only)
- **Insert**: Only authenticated users (trainers) can create

### Client Trophies
- **Select**:
  - Clients can see their own trophies
  - Trainers can see their clients' trophies
- **Insert**: Trainers can award trophies to their clients

---

## Common Patterns

### Get Client with All Workouts

```typescript
const { data: client, error } = await supabase
  .from('clients')
  .select('*, workouts(*, workout_exercises(*))')
  .eq('id', clientId)
  .single();
```

### Get Exercise History for a Client

```typescript
const { data: history } = await supabase
  .from('logged_sets')
  .select('*')
  .eq('client_id', clientId)
  .eq('workout_exercise_id', exerciseId)
  .order('completed_at', { ascending: false });
```

### Subscribe to Real-time Updates

```typescript
const subscription = supabase
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'logged_sets',
      filter: `client_id=eq.${clientId}`,
    },
    (payload) => {
      console.log('New set logged:', payload.new);
      // Update UI with new set
    }
  )
  .subscribe();

// Clean up
subscription.unsubscribe();
```

---

## Troubleshooting

### "Relation does not exist" error
- Check that you ran the migration SQL
- Verify table names are correct (use lowercase with underscores)

### "Permission denied" error
- Verify RLS policies are set up correctly
- Check that user is authenticated
- Ensure user ID matches the policy conditions

### "Invalid JWT" error
- Verify `SUPABASE_ANON_KEY` is correct
- Check that key is for the correct project

### Slow queries
- Check that indexes were created (they should be auto-created by migration)
- Consider adding more indexes if needed
- Use Supabase monitoring to identify slow queries

---

## Best Practices

1. **Always use types** - Import types from `@trainer-app/types`
2. **Handle errors** - Check `error` object in responses
3. **Use environment variables** - Never hardcode API keys
4. **Enable RLS** - Always restrict data access with policies
5. **Add indexes** - Already included in migration for performance
6. **Test policies** - Verify each user can only see their data
7. **Use transactions** - For complex multi-table operations
8. **Monitor usage** - Use Supabase dashboard to track usage

---

## Deployment Considerations

### Before Production:
1. ✅ Test all RLS policies thoroughly
2. ✅ Set up backup strategy
3. ✅ Configure custom domain (optional)
4. ✅ Enable HTTPS (automatic with Supabase)
5. ✅ Review security settings
6. ✅ Load test with expected user count

### Environment-specific URLs:
```
Development: https://your-project.supabase.co
Production: https://your-project.supabase.co (same project or separate)
```

### Upgrading Plan:
- Free tier: Perfect for development
- Pro tier: $25/month for production use
- Team: Custom pricing for enterprise

---

## Migration Path

If migrating from existing database:

1. Create new Supabase project
2. Run migration to create schema
3. Copy data from old database
4. Test thoroughly
5. Switch production traffic
6. Retire old database

---

## Useful Links

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Supabase Client**: https://supabase.com/docs/reference/javascript
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

**Next Steps**: 
1. Create Supabase project
2. Run migration
3. Get API keys
4. Update environment variables
5. Start using the service clients in your app!
