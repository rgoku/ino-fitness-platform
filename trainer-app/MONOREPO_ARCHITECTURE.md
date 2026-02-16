# Monorepo Architecture Summary

This document provides a comprehensive overview of the monorepo structure and how all pieces fit together.

## Tree Structure

```
trainer-app/
├── apps/
│   ├── mobile/
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── _layout.tsx              # Root navigation
│   │   │       ├── (auth)/
│   │   │       │   ├── _layout.tsx
│   │   │       │   ├── login.tsx
│   │   │       │   ├── signup.tsx
│   │   │       │   └── onboarding.tsx
│   │   │       └── (app)/
│   │   │           ├── _layout.tsx          # Main app navigation
│   │   │           ├── (tabs)/
│   │   │           │   ├── _layout.tsx      # Bottom tab navigation
│   │   │           │   ├── index.tsx        # Home screen
│   │   │           │   ├── reminders.tsx    # Reminders list
│   │   │           │   ├── diet.tsx         # Diet plans
│   │   │           │   ├── progress.tsx     # Progress tracking
│   │   │           │   ├── chat.tsx         # AI Coach
│   │   │           │   └── profile.tsx      # User profile
│   │   │           ├── form-check.tsx       # Modal for form recognition
│   │   │           ├── diet-plan/[id].tsx   # Dynamic diet plan details
│   │   │           └── workout/[id].tsx     # Dynamic workout session
│   │   ├── app.json                         # Expo configuration
│   │   ├── package.json                     # Mobile dependencies
│   │   ├── tsconfig.json                    # Mobile TypeScript config
│   │   ├── .env.example                     # Environment template
│   │   └── .env.local                       # Local environment (git ignored)
│   │
│   └── web/
│       ├── src/
│       │   └── app/
│       │       ├── layout.tsx                # Root layout
│       │       ├── page.tsx                  # Home/dashboard
│       │       ├── clients/                  # Client management
│       │       ├── diet-plans/               # Diet plan creation
│       │       ├── workouts/                 # Workout programs
│       │       ├── reminders/                # Reminder scheduling
│       │       └── analytics/                # Progress analytics
│       ├── package.json                     # Web dependencies
│       ├── tsconfig.json                    # Web TypeScript config
│       ├── next.config.js                   # Next.js configuration
│       ├── .env.example                     # Environment template
│       └── .env.local                       # Local environment (git ignored)
│
├── packages/
│   ├── types/                               # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts                     # All type definitions
│   │   ├── package.json                     # Package metadata (@trainer-app/types)
│   │   └── tsconfig.json                    # Types config
│   │
│   ├── ui/                                  # Component interface types
│   │   ├── src/
│   │   │   └── index.ts                     # Component prop types
│   │   ├── package.json                     # Package metadata (@trainer-app/ui)
│   │   └── tsconfig.json                    # UI config
│   │
│   └── api/                                 # Shared API client
│       ├── src/
│       │   └── index.ts                     # ApiClient class
│       ├── package.json                     # Package metadata (@trainer-app/api)
│       └── tsconfig.json                    # API config
│
├── backend/                                 # FastAPI (outside monorepo)
│   ├── main.py                              # FastAPI entry point
│   ├── requirements.txt                     # Python dependencies
│   ├── app/
│   │   ├── models.py                        # SQLAlchemy models
│   │   ├── schemas.py                       # Pydantic schemas
│   │   ├── database.py                      # Database setup
│   │   ├── auth.py                          # Authentication logic
│   │   ├── ai_service.py                    # Claude/AI service
│   │   ├── notification_service.py          # Multi-channel notifications
│   │   └── routes/
│   │       ├── auth.py                      # Auth endpoints
│   │       ├── users.py                     # User endpoints
│   │       ├── diet.py                      # Diet plan endpoints
│   │       ├── workouts.py                  # Workout endpoints
│   │       ├── reminders.py                 # Reminder endpoints
│   │       ├── progress.py                  # Progress endpoints
│   │       ├── coaching.py                  # AI coaching endpoints
│   │       └── ai_coach.py                  # AI coach endpoints
│   ├── tests/
│   │   ├── test_notifications.py
│   │   ├── test_reminders.py
│   │   └── test_supplements.py
│   ├── alembic/                             # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   └── alembic.ini
│
├── docs/                                    # Documentation
│   ├── EVIDENCE_BASED_NUTRITION_GUIDELINES.md
│   ├── FORM_RECOGNITION.md
│   ├── RESEARCH_BACKED_DIET_PLANS.md
│   └── QUICK_START_RESEARCH_DIET.md
│
├── coach-portal/                            # Legacy trainer HTML (can move to web)
│   └── trainers.html
│
├── package.json                             # Root workspace config (Turbo)
├── tsconfig.base.json                       # Shared TypeScript base config
├── .gitignore                               # Git ignore rules
│
├── README.md                                # Main documentation
├── SETUP_GUIDE.md                           # Setup instructions
├── DEVELOPMENT_WORKFLOW.md                  # Development guide
│
└── .turbo/                                  # Turbo cache (git ignored)
```

## Component Hierarchy

### Monorepo Root (trainer-app/)

**Purpose**: Orchestrate all packages and apps using Turbo workspaces

**Key Files**:
- `package.json` - Defines workspaces, shared scripts, dev dependencies
- `tsconfig.base.json` - Base TypeScript configuration for all packages
- `.gitignore` - Ignores node_modules, build artifacts, env files
- `README.md` - Main documentation
- `SETUP_GUIDE.md` - How to get started
- `DEVELOPMENT_WORKFLOW.md` - How to develop

**Commands**:
```bash
npm install         # Install all dependencies
npm run dev         # Start all apps in parallel
npm run build       # Build all packages and apps
npm run test        # Run all tests
npm run lint        # Lint all code
npm run format      # Format all code
```

---

### Packages (trainer-app/packages/)

Shared code used by both mobile and web apps.

#### @trainer-app/types
**Purpose**: Single source of truth for TypeScript types across the app

**Exports**:
```typescript
// Domain models
User, AuthToken
Reminder, DietPlan, Meal, Supplement
WorkoutPlan, Exercise
FormCheckRequest, FormCheckResult
ProgressEntry

// API wrappers
ApiResponse<T>, PaginatedResponse<T>

// Notifications
NotificationPayload

// Statistics
ClientStats
```

**Usage**:
```typescript
import type { User, DietPlan } from '@trainer-app/types';
```

#### @trainer-app/ui
**Purpose**: Shared component interface definitions

**Exports**:
```typescript
// Component props
ButtonProps, CardProps, TextInputProps
BadgeProps, AlertProps, ModalProps, LoadingProps, EmptyStateProps

// Type utilities
ComponentVariant, ComponentSize, AlertType
```

**Implementation Pattern**:
- Types are defined here (no implementation)
- Each app (mobile/web) implements platform-specific versions
- Mobile uses React Native components
- Web uses HTML elements

**Usage**:
```typescript
// Mobile implementation
import type { ButtonProps } from '@trainer-app/ui';
import { TouchableOpacity, Text } from 'react-native';

export function Button(props: ButtonProps) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <Text>{props.label}</Text>
    </TouchableOpacity>
  );
}

// Web implementation
import type { ButtonProps } from '@trainer-app/ui';

export function Button(props: ButtonProps) {
  return (
    <button onClick={props.onPress}>
      {props.label}
    </button>
  );
}
```

#### @trainer-app/api
**Purpose**: Shared API client for communicating with FastAPI backend

**Exports**:
```typescript
class ApiClient {
  get<T>(endpoint: string): Promise<T>
  post<T>(endpoint: string, data: unknown): Promise<T>
  put<T>(endpoint: string, data: unknown): Promise<T>
  delete<T>(endpoint: string): Promise<T>
  setToken(token: string): void
  clearToken(): void
}

function createApiClient(baseURL: string): ApiClient
```

**Usage**:
```typescript
import { createApiClient } from '@trainer-app/api';
import type { User } from '@trainer-app/types';

const api = createApiClient(process.env.API_URL);

// Set auth token
api.setToken(token);

// Make requests
const user = await api.get<User>('/users/123');
const newPlan = await api.post<DietPlan>('/diet-plans', planData);
```

---

### Apps (trainer-app/apps/)

Consumer applications using shared packages.

#### Mobile App (trainer-app/apps/mobile/)
**Platform**: React Native (Expo)
**Node**: 18+
**Package Manager**: npm

**Structure** (Expo Router - file-based routing):
```
src/app/
├── _layout.tsx              # Root navigator
├── (auth)/                  # Auth group
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   └── onboarding.tsx
└── (app)/                   # Main app group
    ├── _layout.tsx          # Stack navigator
    ├── (tabs)/              # Tab group
    │   ├── _layout.tsx      # Tab navigator
    │   ├── index.tsx        # Home
    │   ├── reminders.tsx
    │   ├── diet.tsx
    │   ├── progress.tsx
    │   ├── chat.tsx
    │   └── profile.tsx
    ├── form-check.tsx       # Modal
    ├── diet-plan/[id].tsx
    └── workout/[id].tsx
```

**Dependencies**:
- `@trainer-app/types` - Type definitions
- `@trainer-app/ui` - Component interfaces
- `@trainer-app/api` - API client
- `expo-router` - File-based routing
- `react-native` - UI framework
- `@react-native-async-storage/async-storage` - Local storage
- `axios` - HTTP (fallback to fetch)
- `zustand` - State management

**Dev Setup**:
```bash
cd apps/mobile
npm run start           # Start Expo dev server
npm run build:ios      # Build for iOS
npm run build:android  # Build for Android
```

#### Web App (trainer-app/apps/web/)
**Platform**: React (Next.js 14+)
**Node**: 18+
**Package Manager**: npm

**Structure** (Next.js App Router - file-based routing):
```
src/app/
├── layout.tsx           # Root layout
├── page.tsx             # Home/dashboard
├── clients/
│   ├── layout.tsx
│   ├── page.tsx         # Clients list
│   └── [id]/
│       └── page.tsx     # Client details
├── diet-plans/
│   ├── page.tsx         # Diet plans list
│   ├── create/
│   │   └── page.tsx     # Create diet plan
│   └── [id]/
│       └── page.tsx     # Plan details
├── workouts/
│   ├── page.tsx         # Workouts list
│   ├── create/
│   │   └── page.tsx     # Create workout
│   └── [id]/
│       └── page.tsx     # Workout details
├── reminders/
│   ├── page.tsx         # Reminders list
│   └── create/
│       └── page.tsx     # Schedule reminder
└── analytics/
    └── page.tsx         # Progress analytics
```

**Dependencies**:
- `@trainer-app/types` - Type definitions
- `@trainer-app/ui` - Component interfaces
- `@trainer-app/api` - API client
- `next` - Framework
- `react` - UI library
- `date-fns` - Date utilities

**Dev Setup**:
```bash
cd apps/web
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run start    # Run production server
```

---

### Backend (trainer-app/backend/)
**Platform**: Python FastAPI
**Location**: Outside monorepo (separate ecosystem)

**Key Modules**:
- `main.py` - FastAPI app entry point
- `app/models.py` - SQLAlchemy ORM models
- `app/schemas.py` - Pydantic request/response schemas
- `app/auth.py` - JWT authentication
- `app/ai_service.py` - Anthropic Claude integration
- `app/notification_service.py` - Multi-channel notifications
- `app/routes/` - API endpoints

**Core Features**:
1. User authentication (JWT)
2. AI coaching (Claude API)
3. Form recognition (MediaPipe)
4. Diet plan recommendations (PubMed research)
5. Reminders (scheduled notifications)
6. Progress tracking

**Setup**:
```bash
cd backend
pip install -r requirements.txt
python main.py  # Runs on port 8000
```

---

## Data Flow

### Authentication Flow
```
Mobile/Web App
    ↓ (POST /auth/login)
Backend (FastAPI)
    ↓ (validates credentials)
Generates JWT Token
    ↓ (returns token)
Mobile/Web App
    ↓ (stores token in AsyncStorage/localStorage)
Sets Authorization header for future requests
```

### API Communication
```
Mobile/Web App
    ↓ (imports ApiClient from @trainer-app/api)
Creates client: createApiClient(baseURL)
    ↓ (setToken for auth)
Makes request: api.get<T>(endpoint)
    ↓ (fetch with JSON)
Backend (FastAPI)
    ↓ (validates token from Authorization header)
Executes endpoint logic
    ↓ (queries database, calls AI services)
Returns JSON response
    ↓ (fetch resolves)
App receives typed data: T
    ↓ (updates state, renders UI)
```

### Type Safety Flow
```
Backend Implementation
    ↓ (defines model)
app/models.py (SQLAlchemy)
    ↓ (describes structure)
app/schemas.py (Pydantic)
    ↓ (mirrors structure)
packages/types/src/index.ts (TypeScript)
    ↓ (shared with all apps)
Mobile App (React Native)
    ↓ (imports type)
import type { DietPlan } from '@trainer-app/types'
    ↓
Web App (Next.js)
    ↓ (imports same type)
import type { DietPlan } from '@trainer-app/types'
    ↓
Both receive same typed data from API
Full type safety across stack
```

---

## Technology Stack

### Frontend (Shared)
- **TypeScript** - Type safety across all code
- **Turbo** - Monorepo orchestration and caching
- **npm workspaces** - Dependency management

### Mobile
- **React Native** - Cross-platform UI
- **Expo** - Managed React Native platform
- **Expo Router** - File-based routing (like Next.js)
- **React Navigation** - Screen transitions
- **Zustand** - State management

### Web
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **Alembic** - Database migrations
- **Anthropic SDK** - Claude API
- **MediaPipe** - Pose detection
- **SQLite/PostgreSQL** - Database

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **pytest** - Python testing

---

## Key Design Decisions

### 1. Monorepo with Turbo
**Why**: Share types, utilities, and config across frontend apps without duplicating code

**Benefit**: Single source of truth for data models, consistent interfaces

### 2. Separate Packages Pattern
**Why**: Clear separation of concerns
- `@trainer-app/types` - Domain models
- `@trainer-app/ui` - Component contracts
- `@trainer-app/api` - Backend communication

**Benefit**: Each package has single responsibility, easy to test and maintain

### 3. Backend Outside Monorepo
**Why**: Different technology stack (Python vs Node.js), different deployment model

**Benefit**: Can develop/deploy independently, clear API boundary

### 4. Expo Router for Mobile
**Why**: Familiar file-based routing like Next.js, matches web developer experience

**Benefit**: Consistent mental model across mobile and web development

### 5. Shared Types Over Duplication
**Why**: Database → Python models → TypeScript types could go out of sync

**Benefit**: Backend API contracts validated by TypeScript, catch errors at compile time

---

## Development Workflow

1. **Feature Development**
   ```bash
   npm run dev  # Start all apps
   # Edit code
   # Hot reload applies changes
   ```

2. **Type Additions**
   ```typescript
   // Add to packages/types/src/index.ts
   export interface NewFeature { ... }
   // Automatically available in all apps after import
   ```

3. **Backend Integration**
   ```typescript
   // Add to packages/api/src/index.ts
   async newEndpoint() { ... }
   // Use in apps
   ```

4. **Testing**
   ```bash
   npm run test   # All tests
   npm run build  # Verify types
   npm run lint   # Check code
   ```

---

## File Size Summary

- **packages/types**: ~200 lines (15+ core types)
- **packages/ui**: ~150 lines (8+ component interfaces)
- **packages/api**: ~100 lines (API client)
- **apps/mobile**: ~50 lines each screen (12 screens total)
- **apps/web**: ~80 lines home, per-feature pages
- **backend**: 2000+ lines (models, routes, services)
- **docs**: 5000+ lines (comprehensive guides)

**Total**: ~15,000 lines of production code + documentation

---

## Next Steps

1. ✅ Monorepo structure complete
2. ✅ Packages created (@trainer-app/types, @trainer-app/ui, @trainer-app/api)
3. ✅ Mobile app scaffolded (Expo Router structure)
4. ✅ Web app scaffolded (Next.js App Router)
5. 🔄 **Install dependencies**: `npm install`
6. 🔄 **Connect backend APIs**
7. 🔄 **Implement authentication flows**
8. 🔄 **Build feature screens**
9. 🔄 **Deploy to platforms**

---

## Commands Reference

```bash
# Root level
npm install                    # Install all
npm run dev                    # Start all apps
npm run build                  # Build all
npm run test                   # Test all
npm run lint                   # Lint all
npm run format                 # Format all
npm run clean                  # Clean all

# Mobile
cd apps/mobile && npm run start
cd apps/mobile && npm run build:ios
cd apps/mobile && npm run build:android

# Web
cd apps/web && npm run dev
cd apps/web && npm run build
cd apps/web && npm run start

# Backend
cd backend && python main.py
cd backend && python -m pytest tests/

# Workspaces
npm install --workspace=@trainer-app/types package-name
npm run build --filter=@trainer-app/types
npm run test --filter=trainer-app-web
```

---

**Ready to build!** 🚀 Run `npm install` to get started.
