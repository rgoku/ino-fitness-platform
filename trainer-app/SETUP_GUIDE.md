# Monorepo Setup Guide

This guide walks you through setting up the entire AI Fitness App monorepo.

## Prerequisites

- **Node.js**: 18.17.0 or later (LTS)
- **npm**: 9.6.7 or later
- **Expo CLI**: `npm install -g expo-cli`
- **Git**: For version control

## Step 1: Install Dependencies

From the monorepo root:

```bash
npm install
```

This installs all dependencies for:
- Root workspace
- `apps/mobile` (Expo + React Native)
- `apps/web` (Next.js)
- `packages/types` (TypeScript types)
- `packages/ui` (Component interfaces)
- `packages/api` (Shared API client)

**Expected output:**
```
added XXX packages in Xs
```

## Step 2: Configure Environment Variables

### Mobile App

1. Copy the example file:
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env.local
   ```

2. Edit `apps/mobile/.env.local`:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:8000
   EXPO_PUBLIC_ENABLE_DEBUG=false
   ```

### Web App

1. Copy the example file:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. Edit `apps/web/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

## Step 3: Verify Installation

Build all packages:
```bash
npm run build
```

Expected output:
```
✓ Successfully built all packages
```

If you see TypeScript errors like "Cannot find module 'react'", this is expected until peer dependencies are installed in each app.

## Step 4: Start Development

### Option A: Start All Apps (Parallel)

```bash
npm run dev
```

This starts:
- Mobile app at `http://localhost:8081` (Expo)
- Web app at `http://localhost:3000` (Next.js)

### Option B: Start Individual Apps

**Mobile:**
```bash
cd apps/mobile
npm run start
# Or with dev client:
npm run dev
```

**Web:**
```bash
cd apps/web
npm run dev
# Then open http://localhost:3000
```

## Step 5: Start Backend

From the workspace root, navigate to backend:

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`

## Verification Checklist

- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds
- [ ] Environment files created (`.env.local`)
- [ ] Mobile app starts with `npm run dev` in `apps/mobile`
- [ ] Web app starts with `npm run dev` in `apps/web`
- [ ] Backend runs with `python main.py`
- [ ] Can reach `http://localhost:3000` (web)
- [ ] Can reach `http://localhost:8081` (mobile via Expo)

## Project Structure

```
trainer-app/
├── apps/
│   ├── mobile/                    # React Native (Expo)
│   │   ├── src/app/              # Expo Router structure
│   │   ├── .env.local            # Mobile env vars
│   │   └── package.json
│   └── web/                       # Next.js
│       ├── src/app/              # Next.js App Router
│       ├── .env.local            # Web env vars
│       └── package.json
├── packages/
│   ├── types/                     # Shared types (@trainer-app/types)
│   ├── ui/                        # Component interfaces (@trainer-app/ui)
│   └── api/                       # API client (@trainer-app/api)
├── backend/                       # FastAPI (outside monorepo for now)
├── package.json                   # Root workspace config
└── tsconfig.base.json            # Shared TypeScript config
```

## Common Tasks

### Add a Package

```bash
npm install --workspace=@trainer-app/types your-package
```

### Add to Mobile App

```bash
npm install --workspace=trainer-app-mobile axios
```

### Add to Web App

```bash
npm install --workspace=trainer-app-web axios
```

### Run Tests

```bash
npm run test
```

### Format Code

```bash
npm run format
```

### Clean Everything

```bash
npm run clean
npm install
```

## Troubleshooting

### Issue: "Cannot find module 'react'"

**Cause**: Peer dependencies not installed.

**Solution**:
```bash
npm install
npm run build
```

### Issue: Expo keeps asking for JavaScript engine

**Cause**: First-time setup.

**Solution**:
- Select "Continue" when prompted
- Choose "Expo Go" or "Dev Client" based on your needs

### Issue: Next.js TypeScript errors

**Cause**: `.next` directory needs regeneration.

**Solution**:
```bash
cd apps/web
rm -rf .next
npm run build
```

### Issue: Port 3000 (web) or 8081 (mobile) already in use

**Solution**:
```bash
# Kill process on port 3000 (web)
npx kill-port 3000

# Kill process on port 8081 (mobile)
npx kill-port 8081
```

## Next Steps

1. ✅ Complete setup from this guide
2. Connect backend APIs in apps
3. Implement authentication
4. Build feature screens
5. Test on devices/emulators
6. Deploy to app stores

## Support

- **Frontend Issues**: Check Next.js and Expo documentation
- **Backend Issues**: See `backend/README.md`
- **TypeScript Issues**: Check `tsconfig.base.json` and individual app configs

---

**Ready to build!** 🚀

Start with:
```bash
npm install
npm run dev
```
