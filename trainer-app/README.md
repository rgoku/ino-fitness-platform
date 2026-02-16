# AI Fitness App - Monorepo

This is a modern monorepo structure for the AI Fitness App using Turbo workspaces. The project separates concerns into mobile (Expo), web (Next.js), backend (FastAPI), and shared packages.

## Project Structure

```
trainer-app/
├── apps/
│   ├── mobile/           # React Native app (Expo)
│   └── web/              # Next.js trainer dashboard
├── packages/
│   ├── types/            # Shared TypeScript types (@trainer-app/types)
│   └── ui/               # Shared component interfaces (@trainer-app/ui)
├── backend/              # FastAPI backend (separate from monorepo)
├── package.json          # Root Turbo configuration
└── tsconfig.base.json    # Shared TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Expo CLI: `npm install -g expo-cli`

### Installation

1. **Install dependencies** in the monorepo root:
   ```bash
   npm install
   ```
   This will automatically install all dependencies for:
   - `apps/mobile`
   - `apps/web`
   - `packages/types`
   - `packages/ui`

2. **Verify installations**:
   ```bash
   npm run build
   ```

### Development

Start all apps in development mode (parallel):
```bash
npm run dev
```

Or start specific apps:
```bash
cd apps/mobile && npm run start
cd apps/web && npm run dev
```

### Building

```bash
npm run build
```

This builds all apps and packages in the correct order using Turbo.

## Packages

### `@trainer-app/types`
Shared TypeScript type definitions for the entire app:
- `User`, `AuthToken`
- `Reminder`, `DietPlan`, `Supplement`
- `WorkoutPlan`, `Exercise`
- `FormCheckRequest`, `FormCheckResult`
- `ProgressEntry`
- API response wrappers

**Usage:**
```typescript
import type { User, DietPlan } from '@trainer-app/types';
```

### `@trainer-app/ui`
Shared component interface types (no implementations):
- `ButtonProps`, `CardProps`, `TextInputProps`
- `BadgeProps`, `AlertProps`, `ModalProps`
- Component constants: `ComponentVariant`, `ComponentSize`

**Usage:**
```typescript
import type { ButtonProps } from '@trainer-app/ui';
```

## Apps

### Mobile (Expo + React Native)
Located in `apps/mobile/`

**Features:**
- Authentication (login, signup, onboarding)
- Home dashboard
- Reminders screen
- Diet plan viewing
- Progress tracking
- AI Coach chat
- Form check (exercise detection)
- User profile

**Commands:**
```bash
cd apps/mobile
npm run start           # Start Expo dev server
npm run dev            # Dev client mode
npm run build:ios      # Build for iOS
npm run build:android  # Build for Android
```

**Navigation Structure:**
- `(auth)` - Authentication screens
  - `login.tsx`
  - `signup.tsx`
  - `onboarding.tsx`
- `(app)` - Main app screens
  - `(tabs)` - Tab-based navigation
    - `index.tsx` (Home)
    - `reminders.tsx`
    - `diet.tsx`
    - `progress.tsx`
    - `chat.tsx`
    - `profile.tsx`
  - `form-check.tsx` (Modal)
  - `diet-plan/[id].tsx` (Dynamic)
  - `workout/[id].tsx` (Dynamic)

### Web (Next.js)
Located in `apps/web/`

**Features:**
- Trainer dashboard
- Client management
- Diet plan creation
- Workout program design
- Reminder scheduling
- Progress analytics

**Commands:**
```bash
cd apps/web
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Backend

The FastAPI backend is located in `backend/` (separate from the monorepo for now).

**Key Endpoints:**
- `POST /auth/login` - User authentication
- `GET /users/{user_id}` - Get user profile
- `POST /reminders` - Create reminder
- `GET /diet-plans/{plan_id}` - Get diet plan
- `POST /ai/coach` - Chat with AI coach
- `POST /ai/form-check` - Form recognition

**Setup:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## Environment Variables

### Mobile (`.env.local` in `apps/mobile/`)
```
EXPO_PUBLIC_API_URL=http://your-backend-url
```

### Web (`.env.local` in `apps/web/`)
```
NEXT_PUBLIC_API_URL=http://your-backend-url
```

### Backend (`.env` in `backend/`)
```
DATABASE_URL=sqlite:///./test.db
ANTHROPIC_API_KEY=your_key_here
JWT_SECRET=your_secret
```

## Scripts

### Root Level
- `npm run dev` - Start all apps in development
- `npm run build` - Build all apps
- `npm test` - Run tests across packages
- `npm run lint` - Lint all code
- `npm run format` - Format code with Prettier
- `npm run clean` - Clean all dist/build folders

### Workspace Management
Turbo automatically handles:
- Dependency resolution
- Parallel execution
- Caching of builds
- Incremental builds

## TypeScript Configuration

The monorepo uses a shared base config (`tsconfig.base.json`) with app-specific extensions:
- `apps/mobile/tsconfig.json` - React Native + Expo
- `apps/web/tsconfig.json` - Next.js + React
- `packages/types/tsconfig.json` - Pure types
- `packages/ui/tsconfig.json` - Pure types

## Workflow

### Adding a New Dependency

**Shared (available in all apps):**
```bash
npm install --workspace=@trainer-app/types your-package
```

**App-specific:**
```bash
npm install --workspace=trainer-app-mobile your-package
```

### Adding a New Screen (Mobile)

1. Create file in `apps/mobile/src/app/(app)/(tabs)/newscreen.tsx`
2. Add route in `apps/mobile/src/app/(app)/(tabs)/_layout.tsx`
3. Update navigation in the tab layout

### Adding a New Page (Web)

1. Create file in `apps/web/src/app/newpage/page.tsx`
2. Next.js automatically creates the route

## API Integration

Both apps import types from `@trainer-app/types` and communicate with the FastAPI backend:

**Example Usage (Mobile):**
```typescript
import type { User } from '@trainer-app/types';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getUser(userId: string): Promise<User> {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data;
}
```

**Example Usage (Web):**
```typescript
import type { DietPlan } from '@trainer-app/types';

async function createDietPlan(plan: Omit<DietPlan, 'id' | 'created_at' | 'updated_at'>) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diet-plans`, {
    method: 'POST',
    body: JSON.stringify(plan),
  });
  return response.json() as Promise<DietPlan>;
}
```

## Troubleshooting

### "Cannot find module 'react'"
Run `npm install` in the root to install peer dependencies for all packages.

### Expo build fails
Clear cache: `expo-cli@latest export --clear`

### Next.js TypeScript errors
Run `npm run build` to regenerate `.next` types.

### Turbo cache issues
Clear cache: `npm run clean && npm install && npm run build`

## Documentation

- **Backend**: See `backend/` for API documentation
- **Reminders**: See `docs/QUICK_START_RESEARCH_DIET.md` for reminder system details
- **AI Features**: See `docs/FORM_RECOGNITION.md` for form check details

## Next Steps

1. [ ] Install all dependencies: `npm install`
2. [ ] Set up environment variables
3. [ ] Connect backend API endpoints
4. [ ] Implement authentication
5. [ ] Build out dashboard features
6. [ ] Deploy to platforms

## Support

For issues or questions, refer to:
- Backend API: `backend/README.md`
- Mobile: Expo documentation (https://docs.expo.dev)
- Web: Next.js documentation (https://nextjs.org/docs)
