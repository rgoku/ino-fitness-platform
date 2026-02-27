# INÖ Fitness App

AI-powered fitness platform with workout tracking, diet plans, form analysis, and coaching.

## Quick start

- **New here?** → Read [START_HERE_FINAL.md](START_HERE_FINAL.md)
- **Overview** → [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)
- **Setup** → [PRODUCTION_SETUP_GUIDE.md](PRODUCTION_SETUP_GUIDE.md)
- **iOS & Android** → [docs/MOBILE_IOS_ANDROID.md](docs/MOBILE_IOS_ANDROID.md)
- **Full app info** → [COMPLETE_APP_INFORMATION.md](COMPLETE_APP_INFORMATION.md)
- **Setup checklist** → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- **INO Platform (coach stack)** → [INO_PLATFORM_INTEGRATION.md](INO_PLATFORM_INTEGRATION.md)

## What’s included

- **Mobile app** (React Native + Expo) – Home, workouts, diet, form check, food photo, AI chat, progress, profile
- **Backend API** (FastAPI) – Auth, workouts, diet, reminders, AI coach, form analysis
- **Database** (Supabase/SQLite) – Users, plans, sessions, meals, progress, reminders
- **ino-platform** (`ino-platform/`) – Coach Command Center (React + Vite), fit-mobile (Expo), landing, FastAPI API with Postgres/Redis/MinIO — see [INO_PLATFORM_INTEGRATION.md](INO_PLATFORM_INTEGRATION.md)

## Run locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Mobile** (iOS and Android)
```bash
cd mobile
npm install
npx expo start
```
Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go. See [docs/MOBILE_IOS_ANDROID.md](docs/MOBILE_IOS_ANDROID.md) for details.

## Docs

| File | Purpose |
|------|---------|
| [START_HERE_FINAL.md](START_HERE_FINAL.md) | Entry point and navigation |
| [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) | Features, stack, revenue |
| [PRODUCTION_SETUP_GUIDE.md](PRODUCTION_SETUP_GUIDE.md) | Setup and deploy |
| [COMPLETE_APP_INFORMATION.md](COMPLETE_APP_INFORMATION.md) | Full app reference |
| [COMPLETE_CODEBASE_GUIDE.md](COMPLETE_CODEBASE_GUIDE.md) | Technical deep dive |
| [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) | Pre-launch tasks |
| [MONETIZATION_STRATEGY.md](MONETIZATION_STRATEGY.md) | Revenue models |
| [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) | Step-by-step setup checklist |
| [INO_PLATFORM_INTEGRATION.md](INO_PLATFORM_INTEGRATION.md) | ino-platform setup and integration |
| [docs/MOBILE_IOS_ANDROID.md](docs/MOBILE_IOS_ANDROID.md) | Run and build on iOS and Android |
| [docs/REFERENCED_ASSETS.md](docs/REFERENCED_ASSETS.md) | Referenced zips, ino-platform, ino-fitness.jsx |

## Tech stack

- **Frontend:** React Native, Expo, TypeScript
- **Backend:** FastAPI, Python 3.10+
- **Database:** SQLite (dev) / Supabase PostgreSQL (prod)
- **AI:** Claude, MediaPipe (form), PubMed (diet research)

## License

This project is for your fitness app use.
