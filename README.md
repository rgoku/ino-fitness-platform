# INÖ Fitness App

AI-powered fitness platform with workout tracking, diet plans, form analysis, and coaching.

## Quick start

- **New here?** → Read [START_HERE_FINAL.md](START_HERE_FINAL.md)
- **Overview** → [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)
- **Setup** → [PRODUCTION_SETUP_GUIDE.md](PRODUCTION_SETUP_GUIDE.md)
- **Full app info** → [COMPLETE_APP_INFORMATION.md](COMPLETE_APP_INFORMATION.md)

## What’s included

- **Mobile app** (React Native + Expo) – Home, workouts, diet, form check, food photo, AI chat, progress, profile
- **Backend API** (FastAPI) – Auth, workouts, diet, reminders, AI coach, form analysis
- **Database** (Supabase/SQLite) – Users, plans, sessions, meals, progress, reminders

## Run locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Mobile**
```bash
cd mobile
npm install
npx expo start
```

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

## Tech stack

- **Frontend:** React Native, Expo, TypeScript
- **Backend:** FastAPI, Python 3.10+
- **Database:** SQLite (dev) / Supabase PostgreSQL (prod)
- **AI:** Claude, MediaPipe (form), PubMed (diet research)

## License

This project is for your fitness app use.
