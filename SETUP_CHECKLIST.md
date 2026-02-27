# ✅ Setup Checklist

**Use this checklist to ensure everything is set up correctly for INO Fitness App.**

---

## 📋 Prerequisites

- [ ] Node.js installed (v18+)
  - Check: `node --version`
  - Download: https://nodejs.org

- [ ] Python installed (v3.9+)
  - Check: `python --version`
  - Download: https://python.org

- [ ] npm installed
  - Check: `npm --version`
  - Comes with Node.js

- [ ] Git installed (optional)
  - Check: `git --version`
  - Download: https://git-scm.com

- [ ] (Optional) pnpm for ino-platform: `npm install -g pnpm`
- [ ] (Optional) Docker Desktop for ino-platform backend stack

---

## 🔧 Backend Setup (INO Fitness — `backend/`)

- [ ] Navigated to `backend` folder
- [ ] Created virtual environment: `python -m venv venv` then activate
- [ ] Installed dependencies: `pip install -r requirements.txt`
- [ ] Created `.env` file and set `DATABASE_URL`, `SECRET_KEY`, etc.
- [ ] Ran migrations if applicable: `alembic upgrade head`
- [ ] Tested backend: `uvicorn main:app --reload`
- [ ] Verified API: http://localhost:8000 and http://localhost:8000/docs

---

## 📱 Mobile Setup (`mobile/`)

- [ ] Navigated to `mobile` folder
- [ ] Installed dependencies: `npm install`
- [ ] Created `.env` with `EXPO_PUBLIC_API_URL` (use your machine IP for physical device)
- [ ] Started app: `npx expo start`
- [ ] Opened on iOS (`i`) or Android (`a`) or scanned QR with Expo Go
- [ ] Verified connection to backend

See [docs/MOBILE_IOS_ANDROID.md](docs/MOBILE_IOS_ANDROID.md) for full iOS/Android run and build.

---

## 🖥️ INO Platform (Coach stack — `ino-platform/`)

- [ ] Navigated to `ino-platform` folder
- [ ] Installed dependencies: `pnpm install`
- [ ] Copied env: `copy .env.example .env` (Windows) or `cp .env.example .env`
- [ ] Started backend stack: `docker compose up -d`
- [ ] Seeded data: `docker compose exec api python -m scripts.seed`
- [ ] Started coach web: `cd apps/coach-web` then `pnpm dev`
- [ ] Coach UI: http://localhost:3000 | API docs: http://localhost:8000/docs

See [INO_PLATFORM_INTEGRATION.md](INO_PLATFORM_INTEGRATION.md) for details.

---

## 🌐 Web / Trainer App (if applicable)

- [ ] **Web app:** `cd web-app` → `npm install` → `npm run dev`
- [ ] **Trainer-app monorepo:** `cd trainer-app` → `pnpm install` → run desired app (e.g. `apps/web` or `apps/mobile`)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
- [ ] `DATABASE_URL` set
- [ ] `SECRET_KEY` set (32+ characters)
- [ ] `CORS_ORIGINS` set
- [ ] API keys (OpenAI, Anthropic, etc.) if used

### Mobile (`mobile/.env`)
- [ ] `EXPO_PUBLIC_API_URL` set (localhost for simulator; IP for device)

### ino-platform (`ino-platform/.env`)
- [ ] `DATABASE_URL`, `JWT_SECRET`, `S3_*`, `STRIPE_*` as in `.env.example`

---

## 🗄️ Database

- [ ] Database installed (SQLite/PostgreSQL/Supabase per project)
- [ ] Connection string in `.env`
- [ ] Migrations run where applicable
- [ ] Verified tables/connection

---

## 🚀 Running Everything

- [ ] Backend running (Terminal 1): `cd backend` → `uvicorn main:app --reload`
- [ ] Mobile running (Terminal 2): `cd mobile` → `npx expo start`
- [ ] (Optional) Coach web: `cd ino-platform/apps/coach-web` → `pnpm dev`
- [ ] All services accessible; no errors in terminals or console

---

## ✅ Testing

- [ ] Backend health: http://localhost:8000/health
- [ ] API docs: http://localhost:8000/docs
- [ ] Mobile loads and can reach API
- [ ] Basic flows work (login, data display)

---

## 🔍 Verification

- [ ] Ports free (e.g. 8000, 3000): `netstat -ano | findstr :8000`
- [ ] All `.env` files created and filled
- [ ] CORS and API URL correct for frontend/mobile

---

## 📚 Documentation

- [ ] Read [README.md](README.md)
- [ ] [START_HERE_FINAL.md](START_HERE_FINAL.md) — entry point
- [ ] [INO_PLATFORM_INTEGRATION.md](INO_PLATFORM_INTEGRATION.md) — coach stack
- [ ] [docs/MOBILE_IOS_ANDROID.md](docs/MOBILE_IOS_ANDROID.md) — iOS/Android

---

## 📝 Notes

**Project path:** `C:\Users\MINI\Desktop\INO_FITNESS_APP`

**Important URLs:**
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs
- Coach web (ino-platform): http://localhost:3000
- Mobile: Expo QR code

**Commands (Windows — use `;` or separate lines instead of `&&`):**
- Backend: `cd backend` then `uvicorn main:app --reload`
- Mobile: `cd mobile` then `npx expo start`
- ino-platform: `cd ino-platform` then `docker compose up -d`; coach UI: `cd apps/coach-web` then `pnpm dev`

---

**Check off each item as you complete it!** ✅ Once all items are checked, the project is ready to go. 🚀
