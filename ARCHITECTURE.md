# INO Fitness Platform — Full Architecture Document

## Overview

Three applications sharing one backend:

| App | Stack | URL (dev) | Purpose |
|-----|-------|-----------|---------|
| **Trainer Dashboard** | Next.js 14 | http://localhost:3001 | Coach command center |
| **Landing Page** | Next.js 14 | http://localhost:3000 | Marketing site |
| **Mobile App** | Expo (React Native) | Expo Go | Client fitness app |
| **Backend API** | FastAPI | http://localhost:8095/docs | REST API |

---

## 1. TRAINER DASHBOARD (`/trainer-app/apps/web/src/`)

### Pages

| Route | File | What it shows |
|-------|------|---------------|
| `/` | `app/page.tsx` | Dashboard: greeting, StatsGrid (4 cards), AttentionQueue, RecentActivity |
| `/clients` | `app/(dashboard)/clients/page.tsx` | Client roster: search, list/grid toggle, AddClientDialog |
| `/clients/[id]` | `app/(dashboard)/clients/[id]/page.tsx` | Client detail: 5 tabs (Overview, Workouts, Nutrition, Progress, Trophies) |
| `/programs` | `app/(dashboard)/programs/page.tsx` | Workout templates grid, CreateProgramDialog |
| `/programs/builder` | `app/(dashboard)/programs/builder/page.tsx` | AI Workout Builder: text input, live preview, exercise enrichment |
| `/programs/[id]` | `app/(dashboard)/programs/[id]/page.tsx` | Template editor: ExerciseRow table, AssignProgramDialog |
| `/nutrition` | `app/(dashboard)/nutrition/page.tsx` | Diet plans grid, detail panel, BloodWorkSection, GeneratePlanDialog |
| `/videos` | `app/(dashboard)/videos/page.tsx` | Video library grid, category filters, AddVideoDialog |
| `/check-ins` | `app/(dashboard)/check-ins/page.tsx` | Client check-in cards (pending workout logs) |
| `/messages` | `app/(dashboard)/messages/page.tsx` | ConversationList + MessageThread + MessageInput |
| `/analytics` | `app/(dashboard)/analytics/page.tsx` | ComplianceChart, ActivityChart, ClientStatusChart, TopPerformers |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Profile, Theme, Account sections |

### Layout Structure

```
app/layout.tsx          — Root: QueryProvider > ThemeProvider > children
  app/page.tsx          — Dashboard (Sidebar + TopBar + main content)
  app/(dashboard)/
    layout.tsx          — Dashboard wrapper (Sidebar + TopBar)
    page.tsx            — Home dashboard
    clients/
    programs/
    nutrition/
    ...
```

### Components

#### Layout (`components/layout/`)

| Component | What it does |
|-----------|-------------|
| `sidebar.tsx` | Responsive sidebar with nav items (Dashboard, Clients, Programs, Videos, Nutrition, Check-ins, Messages, Analytics, Settings). User profile at bottom. Collapse toggle. Mobile overlay. |
| `top-bar.tsx` | Sticky header with search bar (Cmd+K shortcut), theme toggle (sun/moon), notification bell with count. |
| `notification-panel.tsx` | Dropdown showing notifications by type (check-in, message, milestone, alert). Mark as read. |

#### Dashboard (`components/dashboard/`)

| Component | Props | What it renders |
|-----------|-------|-----------------|
| `stats-grid.tsx` | — | 4-column grid: Total Clients, Active, At Risk, Avg Compliance |
| `stat-card.tsx` | label, value, icon, trend, iconColor, loading | Single stat card with trend arrow |
| `attention-queue.tsx` | — | Clients sorted by lowest compliance. Shows flags, compliance bar. |
| `recent-activity.tsx` | — | Last 8 logged sets with client name, exercise, weight/reps. |

#### Clients (`components/clients/`)

| Component | Props | What it does |
|-----------|-------|-------------|
| `client-list.tsx` | clients[] | Table: Client, Status, Compliance, Streak, Last Active |
| `client-card.tsx` | client | Grid card with avatar, stats, compliance bar |
| `client-header.tsx` | client | Detail page header with avatar, name, status, actions |
| `client-overview-tab.tsx` | client | Quick stats, weekly compliance, flags, details |
| `client-workouts-tab.tsx` | clientId | Expandable workout cards with exercise tables |
| `client-progress-tab.tsx` | clientId | MuscleHeatmap + recent workout logs |
| `client-trophies-tab.tsx` | clientId | Trophy cards (First Workout, Streak, PR, etc.) |
| `client-toolbar.tsx` | search, view, callbacks | Search input + list/grid view toggle |
| `add-client-dialog.tsx` | open, onClose | Form: name, email. Uses useCreateClient mutation. |

#### Programs (`components/programs/`)

| Component | Props | What it does |
|-----------|-------|-------------|
| `program-card.tsx` | template, onDelete | Card: name, description, weeks x days, exercise count, delete |
| `exercise-row.tsx` | exercise, index, onUpdate, onDelete | Editable row: name, sets, reps, rest. Drag handle. |
| `create-program-dialog.tsx` | open, onClose | Form: name, description, weeks, days/week |
| `assign-program-dialog.tsx` | open, onClose, templateName | Select client(s) to assign program |

#### Nutrition (`components/nutrition/`)

| Component | Props |
|-----------|-------|
| `diet-plan-card.tsx` | plan, selected, onClick — Shows macros, evidence level |
| `diet-plan-detail.tsx` | plan, onClose, onSave — Full detail: macros ring, meals, evidence |
| `nutrition-toolbar.tsx` | search, filters, callbacks — Search + evidence/source filters |
| `generate-plan-dialog.tsx` | open, onClose, callbacks — 6-step wizard for AI diet plan |
| `blood-work-section.tsx` | records, callbacks — Blood marker input |
| `macro-ring.tsx` | — Circular P/C/F visualization |
| `pubmed-research-panel.tsx` | — PubMed research links |

#### Analytics (`components/analytics/`)

| Component | Data |
|-----------|------|
| `compliance-chart.tsx` | Line chart — weekly compliance % (Recharts) |
| `activity-chart.tsx` | Bar chart — weekly workouts logged |
| `client-status-chart.tsx` | Donut — Active/At-Risk/Inactive distribution |
| `daily-compliance-chart.tsx` | Daily compliance trend |
| `retention-chart.tsx` | Client retention over time |

#### UI Primitives (`components/ui/`)

| Component | Variants/Props |
|-----------|---------------|
| `button.tsx` | Variants: primary, secondary, ghost, danger, outline, accent. Sizes: sm, md, lg, xl. Props: loading, icon. |
| `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardInteractive (hover lift) |
| `badge.tsx` | Variants: default, success, warning, danger, info, brand, outline. Prop: dot (indicator) |
| `input.tsx` | Input + Textarea. Props: label, error, hint, icon |
| `dialog.tsx` | Modal dialog with overlay |
| `dropdown.tsx` | Click-outside dropdown. Props: trigger, align |
| `tabs.tsx` | Horizontal tabs with count badge |
| `empty-state.tsx` | Icon + title + description + CTA |
| `avatar.tsx` | Initials or image. Sizes: sm, md, lg, xl |
| `progress-bar.tsx` | Horizontal bar. Variants: brand, warning, error |
| `skeleton.tsx` | Animated shimmer loader |
| `ai-insight.tsx` | AIInsight card + AIInsightInline. Types: suggestion, alert, trend, insight |
| `motion.tsx` | Framer Motion wrappers: PageTransition, FadeIn, SlideUp |
| `status-dot.tsx` | Small active/inactive dot |

### Hooks (`hooks/`)

| Hook | Returns | Data Source |
|------|---------|-------------|
| `use-clients.ts` | useClients(), useClient(id), useCreateClient(), useDeleteClient() | Mock data |
| `use-dashboard-stats.ts` | useDashboardStats() | Derived from mockClients |
| `use-workouts.ts` | useClientWorkouts(id), useRecentLoggedSets(limit), useClientLoggedSets(id) | Mock data |
| `use-templates.ts` | useTemplates(), useTemplate(id), useCreateTemplate(), useDeleteTemplate() | Mock data |
| `use-diet-plans.ts` | useDietPlans(), useGenerateDietPlan(), useUpdateDietPlan(), useDeleteDietPlan() | Mock data |
| `use-messages.ts` | useConversations(), useMessages(id), useSendMessage() | Mock data |
| `use-check-ins.ts` | useCheckIns() | Grouped logged sets |
| `use-analytics.ts` | useAnalytics() | Mock weekly data |
| `use-pubmed.ts` | usePubmed(term) | PubMed API |

### Stores (Zustand, `stores/`)

| Store | State | Persistence |
|-------|-------|-------------|
| `auth-store.ts` | user (mock: Sarah Mitchell), isAuthenticated | None |
| `theme-store.ts` | theme ('light'/'dark'/'system'), resolvedTheme | localStorage |
| `sidebar-store.ts` | isCollapsed, isMobileOpen | localStorage |
| `notification-store.ts` | notifications[], unreadCount | None (mock) |

### Lib (`lib/`)

| File | Exports |
|------|---------|
| `api.ts` | ApiClient class — REST client with Bearer token |
| `utils.ts` | cn() (clsx+twMerge), formatRelativeTime, formatDate, formatNumber, getInitials |
| `exercise-parser.ts` | parseExercises(), enrichExercises() — NLP exercise text parser |
| `mock-data.ts` | mockClients, mockWorkouts, mockDietPlans, mockTemplates, mockMessages, etc. |
| `mock-generation.ts` | generateMockPlan() — fake diet plan generator |
| `design-tokens.ts` | Design system constants |
| `blood-work-types.ts` | BloodWorkRecord type definition |

### Design System (`globals.css`)

**Colors (CSS variables):**
```
--color-surface:            #FFFFFF (light) / #0F0F12 (dark)
--color-surface-secondary:  #FAFAFA / #17171C
--color-surface-hover:      #F0F0F2 / #1E1E26
--color-border:             #E4E4E7 / #2A2A35
--color-border-light:       #F0F0F2 / #222230
--color-text-primary:       #09090B / #FAFAFA
--color-text-secondary:     #52525B / #A1A1AA
--color-text-tertiary:      #A0A0AB / #6B7280
--color-accent:             Indigo/brand-500
```

**Typography:** Inter font, heading-1/2/3, body-sm/md/lg/xs, sub-md classes

**Spacing:** 8px grid (p-2=8px, p-3=12px, p-4=16px, p-5=20px, p-6=24px)

**Border Radius:** rounded-lg=12px, rounded-xl=16px, rounded-2xl=20px

---

## 2. LANDING PAGE (`/web-app/`)

### Pages

| Route | File | Sections |
|-------|------|----------|
| `/` | `app/page.tsx` → `app/platform/page.tsx` | Full landing page |
| `/platform` | `app/platform/page.tsx` | Same landing page |
| `/demo` | `app/demo/page.tsx` | Interactive demo preview |

### Landing Page Sections (`platform/page.tsx`, ~620 lines)

| Section | Content |
|---------|---------|
| **Navbar** | Logo (INO), "See Demo" link, "Get Started" CTA button |
| **Hero** | "Built for coaches who **care about their clients** — and their time." Stats: 2,400+ Coaches, 94% Retention, 50,000+ Programs |
| **Features** | 6 cards: Workout Builder, Form Video Review, Nutrition Engine, Client Dashboard, AI Coach, Check-in Automation |
| **Two Apps** | INO Coach (web dashboard) + INO Fit (mobile client app) |
| **Testimonials** | 3 coach quotes with retention/revenue metrics |
| **ROI Strip** | "$249/mo / 50 clients = $4.98/client", "247x ROI" |
| **Pricing** | Monthly/Yearly toggle. 3 plans: Starter ($129), Pro ($249), Scale ($399) |
| **Comparison** | Feature grid across all plans |
| **FAQ** | 8 questions with accordion |
| **Bottom CTA** | "Stop coaching like 2019" |

### Tailwind Config (`tailwind.config.js`)

```js
colors: {
  brand: { 50-900 green scale (#10B981 primary) },
  surface: { DEFAULT: '#FFF', secondary: '#FAFAFA', tertiary: '#F4F4F5', hover: '#F0F0F2' },
  border: { DEFAULT: '#E4E4E7', light: '#F0F0F2' },
  text: { primary: '#09090B', secondary: '#52525B', tertiary: '#A0A0AB' },
  success/warning/error with 50/500/600 shades,
}
backgroundImage: {
  'platform-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
}
```

---

## 3. BACKEND API (`/backend/app/`)

### All Routes

| Prefix | Tag | Endpoints |
|--------|-----|-----------|
| `/api/v1/auth` | Authentication | POST `/signup`, POST `/login`, POST `/refresh`, GET `/me`, POST `/logout` |
| `/api/v1/users` | Users | GET `/me`, POST `/onboarding` |
| `/api/v1/workouts` | Workouts | GET `/plans`, POST `/plans/generate`, GET `/sessions`, POST `/plans/{id}/sessions`, GET `/exercise-catalog` |
| `/api/v1/workouts` | Workouts (training) | POST `/start`, POST `/log-set`, GET `/today`, POST `/complete`, GET `/history`, GET `/prs`, GET `/muscle-volume`, GET `/last-sets` |
| `/api/v1/builder` | Workout Builder | POST `/parse`, POST `/build`, POST `/exercise/describe`, POST `/exercise/video`, GET `/catalog` |
| `/api/v1/diet` | Diet | POST `/generate`, GET `/plan`, POST `/log-meal`, GET `/macros?date=`, GET `/plans`, POST `/plans/generate`, POST `/analyze-food`, GET `/research/{topic}` |
| `/api/v1/progress` | Progress | POST `/{user_id}`, GET (history), GET `/{user_id}/streak`, GET `/{user_id}/achievements`, GET `/{user_id}/stats`, POST `/{user_id}/weight`, POST `/{user_id}/measurements` |
| `/api/v1/coach` | Coach Portal | GET `/clients`, POST `/add-client` |
| `/api/v1/checkins` | Check-ins | GET `/`, POST `/`, PATCH `/{id}` |
| `/api/v1/ai` | AI | POST `/chat`, GET `/motivation`, GET `/tips`, POST `/nutrition-advice`, POST `/ask`, POST `/plan-guidance`, POST `/form-check`, POST `/meal-scan`, POST `/workout-feedback` |
| `/api/v1/billing` | Billing | GET `/status`, POST `/create-checkout`, POST `/webhook` |
| `/api/v1/upload` | Upload | POST `/image` (25MB max), POST `/video` (50MB max) |
| `/api/v1/reminders` | Reminders | POST `/reminders`, GET `/reminders`, POST `/reminders/{id}/send`, DELETE `/reminders/{id}` |
| `/api/v1/coaching` | Coaching (legacy) | GET `/coaches`, POST `/messages`, GET `/conversations/{id}` |

### Database Models

| Model | Key Fields |
|-------|-----------|
| `User` | id, email, hashed_password, name, role, is_active, age, gender, weight, height, fitness_goal, experience_level, subscription_tier, has_onboarded |
| `WorkoutPlan` | id, user_id, name, description, difficulty, duration, focus_areas(JSON), generated_by, coach_id |
| `Exercise` | id, workout_plan_id, name, muscle_groups(JSON), equipment(JSON), instructions(JSON), sets, reps, rest_seconds |
| `WorkoutSession` | id, workout_plan_id, user_id, date, duration, calories_burned, is_completed, session_data(JSON) |
| `TrainingWorkout` | id, user_id, date, plan_id, completed |
| `ExerciseDefinition` | id, catalog_id, name, muscle_group, secondary_muscles(JSON), description, cues(JSON), common_mistakes(JSON), equipment, video_url, thumbnail_url, difficulty |
| `ExerciseSet` | id, workout_id, exercise_id, weight, reps, rpe, is_drop_set, is_superset, notes |
| `PersonalRecord` | id, user_id, exercise_id, max_weight, reps (unique per user+exercise) |
| `DietPlan` | id, user_id, name, calorie/protein/carb/fat targets, scientific_basis, evidence_level, research_citations(JSON), supplement_recommendations(JSON) |
| `Meal` | id, diet_plan_id, name, meal_type, calories, protein, carbs, fat, ingredients(JSON), instructions(JSON) |
| `MealLog` | id, user_id, meal_name, calories, protein, carbs, fat |
| `FoodEntry` | id, user_id, food_name, meal_type, calories, protein, carbs, fat, quantity, unit |
| `WorkoutTemplate` | id, trainer_id, name, description, weeks, days_per_week, is_public |
| `TemplateExercise` | id, template_id, exercise_name, sets, reps, rest_seconds, notes, order_index |
| `Workout` | id, client_id, trainer_id, name, week, day, notes |
| `WorkoutExercise` | id, workout_id, exercise_name, sets, reps, rpe, rest, video_url, notes, order_index |
| `Coach` | id, user_id, name, bio, specialties(JSON), rating, hourly_rate |
| `CoachClient` | id, coach_id, client_id, status |
| `CheckIn` | id, client_id, coach_id, weight, notes, status |
| `Message` | id, user_id, coach_id, sender_type, content, message_type, read, attachments(JSON) |
| `ProgressEntry` | id, user_id, date, weight, body_fat, muscle_mass, measurements(JSON), photos(JSON), mood, notes |
| `UserStreak` | user_id, current_streak, longest_streak, last_activity_date |
| `UserTrophy` | id, user_id, trophy_type, achieved_at |
| `Achievement` | id, user_id, title, description, icon, progress, target, unlocked_at |
| `Subscription` | id, user_id, plan_type, status, stripe_subscription_id, current_period_end |
| `Reminder` | id, user_id, title, message, remind_at, repeat, channel, sent |
| `RefreshToken` | id, user_id, token_hash, expires_at, revoked |

### AI Services (`domain/ai/service.py`)

| Method | What it does |
|--------|-------------|
| `generate_workout_plan()` | Claude generates personalized workout from biometrics |
| `generate_diet_plan()` | Evidence-based diet with PubMed research + supplement recommendations |
| `analyze_exercise_form()` | MediaPipe pose detection + Claude evaluation (score, cues, safety) |
| `analyze_food_photo()` | Claude vision extracts calories/macros from food image |
| `chat_with_ai_coach()` | Conversational fitness coaching |
| `generate_workout_modification()` | Suggest alternatives based on constraints |
| `analyze_progress()` | Insights on user progress data |
| `get_motivation()` | Motivational quotes |

### Workout Builder Service (`services/workout_builder.py`)

| Function | What it does |
|----------|-------------|
| `parse_workout_text()` | NLP: "Bench Press 4x8, Squats 5x5 @RPE8" → structured JSON |
| `build_workout_from_text()` | Full pipeline: parse + create template + enrich descriptions + match videos |
| `generate_exercise_description_fallback()` | Hardcoded descriptions for common exercises |
| `generate_exercise_description_ai()` | Claude generates description, cues, mistakes |
| `match_video()` | Match exercise to YouTube demo from curated library (21 exercises) |
| `_detect_natural_language()` | Detect "Generate a push day" → use preset workout |

**Preset Workouts:** push, pull, leg, upper, lower, full body, chest, back, shoulder, arm, hiit, strength, hypertrophy

**Video Library (YouTube IDs):** Bench Press, Squat, Deadlift, OHP, Barbell Row, Pull Up, Lat Pulldown, Dumbbell Curl, Tricep Pushdown, Leg Press, RDL, Hip Thrust, Lateral Raise, Cable Fly, Leg Curl, Leg Extension, Plank, Calf Raise, Face Pull, Dip, Lunge

---

## 4. MOBILE APP (`/mobile/src/`)

### Screens

| Screen | What it shows |
|--------|-------------|
| `LoginScreen.tsx` | Email + password login |
| `SignupScreen.tsx` | Registration form |
| `HomeScreen.tsx` | Dashboard: greeting, streak, quick actions, recent workout |
| `WorkoutSessionScreen.tsx` | Active workout: exercise cards, log sets, PR badges |
| `WorkoutPlanScreen.tsx` | Browse/view workout plans |
| `DietPlanScreen.tsx` | Macros, meal plan, food logging |
| `ProgressScreen.tsx` | Weight chart, streak, achievements |
| `ProfileScreen.tsx` | User info, settings, logout |
| `FormCheckScreen.tsx` | Video upload for AI form analysis |

### Services (`services/`)

| Service | API calls |
|---------|-----------|
| `apiService.ts` | Base HTTP client with JWT token handling |
| `authService.ts` | login, signup, refresh, logout |
| `workoutService.ts` | start, logSet, complete, today, history, prs |
| `dietService.ts` | logMeal, getMacros, getPlans |
| `progressService.ts` | logWeight, getStreak, getAchievements |
| `coachingService.ts` | getCoaches, sendMessage |
| `offlineCache.ts` | AsyncStorage cache layer |

### Theme (`theme/index.ts`)

```
Background: #0B0B0F
Surface:    #121218
Elevated:   #1A1A22
Primary:    gradient (blue → purple)
Success:    #22C55E
Warning:    #FACC15
Error:      #EF4444
Text:       #FFFFFF / #A1A1AA / #6B7280
```

### Components (`components/ui/`)

Button, Card, Input, Badge, StatCard, StatRing, SectionHeader, ScreenWrapper, LoadingSkeleton, EmptyState

---

## 5. KNOWN ISSUES

| Area | Issue |
|------|-------|
| Trainer Dashboard | All hooks use **mock data** with setTimeout, not real API calls |
| Landing Page | `bg-platform-gradient` was missing from Tailwind config (fixed) |
| Backend | AI services require `ANTHROPIC_API_KEY` env var for Claude features |
| Backend | Form analysis requires MediaPipe + OpenCV (heavy dependencies) |
| Mobile | Web preview doesn't work (Expo SDK 51 web bundle error) |
| All | SQLite in dev — PostgreSQL required for production |

---

## 6. ENVIRONMENT VARIABLES

```env
# Backend
DATABASE_URL=postgresql://ino:ino@localhost:5432/ino_fitness
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
PUBLIC_BASE_URL=http://localhost:8095
UPLOAD_DIR=./uploads
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
REDIS_URL=redis://localhost:6379/0

# Mobile
EXPO_PUBLIC_API_URL=http://192.168.1.234:8095
EXPO_PUBLIC_API_VERSION=v1

# Trainer App (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:8095
```
