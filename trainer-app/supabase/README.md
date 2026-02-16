-- Supabase Setup Instructions

-- 1. Run migrations in order:
--    supabase/migrations/001_create_trainer_tables.sql

-- 2. Enable Auth in Supabase:
--    - Go to Authentication → Providers
--    - Enable Email Provider
--    - Configure SMTP if using custom emails

-- 3. Set up Supabase connection in your app:
--    - Install: npm install @supabase/supabase-js
--    - Create client in apps/mobile and apps/web
--    - Use environment variables for URL and key

-- 4. Test RLS policies:
--    - Login as a trainer
--    - Verify can see only their clients/workouts
--    - Verify cannot see other trainers' data

-- 5. Deploy to production:
--    - Test all RLS policies with real data
--    - Monitor performance with database indexes
--    - Set up automated backups

-- Connection details needed:
-- SUPABASE_URL=https://your-project.supabase.co
-- SUPABASE_ANON_KEY=your-anon-key
-- SUPABASE_SERVICE_KEY=your-service-key (server-side only)

-- Tables created:
-- - clients (trainer's clients)
-- - workouts (assigned to clients)
-- - workout_exercises (exercises in workouts)
-- - logged_sets (client workout history)
-- - trophies (achievements)
-- - client_trophies (awarded achievements)

-- All tables have RLS enabled with policies for:
-- - Trainers can manage their own clients
-- - Clients can view their data
-- - Trophies are public (read-only)
