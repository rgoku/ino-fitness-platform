# Development Workflow Guide

This guide explains how to work effectively in the monorepo during development.

## Daily Development Flow

### 1. Start Your Day

```bash
# Navigate to monorepo root
cd trainer-app

# Pull latest changes
git pull

# Install any new dependencies
npm install

# Start development mode
npm run dev
```

This starts all apps in parallel:
- Web: http://localhost:3000
- Mobile: http://localhost:8081 (via Expo)

### 2. Making Changes

#### Modifying Shared Types (`packages/types`)

When you update types, they automatically propagate to all apps:

```typescript
// packages/types/src/index.ts
export interface User {
  id: string;
  email: string;
  // ... add new field
  newField?: string;
}
```

Apps using this type:
```typescript
import type { User } from '@trainer-app/types';

// Now has 'newField' in type checking
```

**Rebuild if needed:**
```bash
npm run build
```

#### Updating Component Interfaces (`packages/ui`)

Define new component prop types:

```typescript
// packages/ui/src/index.ts
export interface CustomInputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  error?: string;
}
```

**Usage in apps:**
```typescript
// apps/mobile/src/components/CustomInput.tsx
import type { CustomInputProps } from '@trainer-app/ui';

export function CustomInput(props: CustomInputProps) {
  // Implementation for React Native
}
```

```typescript
// apps/web/src/components/CustomInput.tsx
import type { CustomInputProps } from '@trainer-app/ui';

export function CustomInput(props: CustomInputProps) {
  // Implementation for React/DOM
}
```

#### Updating API Client (`packages/api`)

Extend the API client with new methods:

```typescript
// packages/api/src/index.ts
export class ApiClient {
  async createWorkout(data: CreateWorkoutRequest): Promise<Workout> {
    return this.post<Workout>('/workouts', data);
  }
}
```

**Usage:**
```typescript
import { createApiClient } from '@trainer-app/api';

const api = createApiClient(process.env.NEXT_PUBLIC_API_URL);
const workout = await api.createWorkout({ ... });
```

#### Adding Mobile Screens

1. **Create the screen file:**
   ```typescript
   // apps/mobile/src/app/(app)/(tabs)/workouts.tsx
   import React from 'react';
   import { View, Text } from 'react-native';
   
   export default function WorkoutsScreen() {
     return (
       <View>
         <Text>My Workouts</Text>
       </View>
     );
   }
   ```

2. **Add to navigation** (if not in tabs):
   ```typescript
   // apps/mobile/src/app/(app)/_layout.tsx
   <Stack.Screen 
     name="workouts/[id]" 
     options={{ title: 'Workout Details' }} 
   />
   ```

3. **Hot reload** automatically applies changes

#### Adding Web Pages

1. **Create the page:**
   ```typescript
   // apps/web/src/app/workouts/page.tsx
   'use client';
   
   export default function WorkoutsPage() {
     return <h1>My Workouts</h1>;
   }
   ```

2. **Next.js** automatically routes to `/workouts`

### 3. Testing Locally

#### Test Mobile

```bash
# Terminal 1: Start dev server
cd apps/mobile
npm run start

# Terminal 2: Run tests
npm run test
```

Install Expo Go on your phone/emulator and scan the QR code.

#### Test Web

```bash
# Terminal 1: Start web dev server
cd apps/web
npm run dev

# Terminal 2: Run tests
npm run test

# Open http://localhost:3000 in browser
```

#### Test Backend Integration

Ensure backend is running:
```bash
cd backend
python main.py
```

Test API endpoint:
```bash
curl http://localhost:8000/users/123
```

### 4. Debugging

#### TypeScript Errors

Check root config:
```bash
npm run build
```

If specific app fails:
```bash
cd apps/web
npm run build  # or npm run build:debug
```

#### Runtime Errors (Mobile)

Check Expo logs:
```bash
cd apps/mobile
npm run start
# Press 'j' in terminal for logs
```

#### Runtime Errors (Web)

Check browser DevTools (F12) and terminal output.

#### API Errors

Check backend logs:
```bash
cd backend
python main.py  # Look at console output
```

## Branching Workflow

### Feature Branch

```bash
# Create feature branch
git checkout -b feature/user-authentication

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: add user authentication to mobile app"

# Push to remote
git push origin feature/user-authentication

# Create Pull Request on GitHub
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code improvements
- `docs/` - Documentation
- `perf/` - Performance improvements

### Testing Before Push

```bash
# Build all packages
npm run build

# Run all tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Only then push
git push origin your-branch
```

## Publishing Changes

### Deploying Mobile

```bash
cd apps/mobile

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Use Expo development build for easier testing
```

### Deploying Web

```bash
cd apps/web

# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to vercel (if configured)
vercel deploy --prod
```

### Updating Backend

```bash
cd backend

# Test changes
python -m pytest tests/

# If all pass, deploy
```

## Workspace Commands Reference

### Dependency Management

```bash
# Install all
npm install

# Add to specific workspace
npm install --workspace=@trainer-app/types lodash
npm install --workspace=trainer-app-mobile react-native-gesture-handler

# Add to all apps
npm install --workspace=apps/* axios

# Remove dependency
npm uninstall --workspace=@trainer-app/ui unused-package
```

### Building

```bash
# Build everything
npm run build

# Build specific package
npm run build --filter=@trainer-app/types

# Watch mode (rebuild on change)
turbo run build --watch
```

### Testing

```bash
# Test all
npm run test

# Test specific workspace
npm run test --filter=trainer-app-web

# Test with coverage
npm run test -- --coverage
```

### Linting & Formatting

```bash
# Check all code
npm run lint

# Format all code
npm run format

# Format specific file
npx prettier --write apps/mobile/src/app/index.tsx
```

## Common Scenarios

### Adding a New Shared Hook

1. Create in appropriate package:
   ```typescript
   // packages/hooks/src/useApi.ts
   export function useApi() {
     // implementation
   }
   ```

2. Export from package:
   ```typescript
   // packages/hooks/src/index.ts
   export * from './useApi';
   ```

3. Add package.json if new:
   ```json
   {
     "name": "@trainer-app/hooks",
     "main": "./src/index.ts"
   }
   ```

4. Use in apps:
   ```typescript
   import { useApi } from '@trainer-app/hooks';
   ```

### Fixing a Bug

```bash
# 1. Create fix branch
git checkout -b fix/login-error

# 2. Find and fix bug
# Edit files...

# 3. Test locally
npm run dev  # Test in both apps

# 4. Run tests
npm run test

# 5. Commit and push
git add .
git commit -m "fix: resolve login validation issue"
git push origin fix/login-error

# 6. Create Pull Request
```

### Updating All Apps

If you need to update something in all apps:

```bash
# Update shared config (auto-propagates)
# packages/types/src/index.ts

# Or manually update each app with Turbo:
npm run build --filter=\*
npm run test --filter=\*
```

## Performance Tips

1. **Use `--filter`** to only rebuild what changed
   ```bash
   npm run build --filter=@trainer-app/types
   ```

2. **Enable caching** (automatic in Turbo)
   ```bash
   # Turbo caches builds automatically
   # Delete cache if needed:
   rm -rf .turbo
   ```

3. **Watch mode** for faster iteration
   ```bash
   npm run build -- --watch
   ```

4. **Parallel execution**
   ```bash
   npm run dev --parallel  # Already default
   ```

## Troubleshooting Development

### Everything works, then breaks randomly

```bash
# Clean everything
npm run clean

# Reinstall
npm install

# Rebuild
npm run build

# Start fresh
npm run dev
```

### Can't connect to backend from mobile

Check that:
1. Backend is running: `http://localhost:8000`
2. Mobile env var points to backend: `EXPO_PUBLIC_API_URL`
3. Both on same network (for device testing)

### Hot reload not working

```bash
# Restart dev server
# Mobile: Press 'r' in terminal
# Web: Press 'Ctrl+C' and restart

# Or full restart
npm run clean
npm run dev
```

## Resources

- [Turbo Documentation](https://turbo.build/repo/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native](https://reactnative.dev)
- [FastAPI](https://fastapi.tiangolo.com)
- [TypeScript](https://www.typescriptlang.org)

---

**Happy coding!** 🚀

Start your day with:
```bash
npm run dev
```
