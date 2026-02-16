# 🏋️ INÖ Fitness App - Complete AI Fitness Platform

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)](https://reactnative.dev)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

**An enterprise-grade AI fitness application featuring intelligent coaching, evidence-based nutrition planning, smart reminders, and exercise form recognition.**

---

## 🎯 What You Get

### For Trainers/Coaches
- 🌐 **Web Portal** (`coach-portal/trainers.html`) - Create AI diet plans, schedule reminders, manage clients
- 🤖 **AI Assistant** - Claude generates personalized plans backed by PubMed research
- 📅 **Smart Reminders** - Automatic, personalized reminders (drink water, workout, eat meal)
- 📊 **Client Management** - Track adherence, view progress, adjust plans
- 📚 **Research Backing** - All plans include peer-reviewed citations

### For Clients
- 💬 **AI Coach** - Real-time fitness coaching via chat
- 🏃 **Form Recognition** - Record exercise videos, get instant form feedback
- 🍎 **Nutrition Guidance** - Personalized diet plans with supplement recommendations
- 🔔 **Smart Reminders** - Multi-channel (in-app, push, email)
- 📈 **Progress Tracking** - Track workouts, diet, body metrics

### For Developers
- ✅ **Production-Ready Code** - Following FastAPI best practices
- 🧪 **Comprehensive Tests** - 20+ tests with full mocking
- 📚 **Complete Documentation** - 5000+ lines of guides
- 🔒 **Secure** - JWT auth, encrypted passwords, SQL injection protection
- 🚀 **Scalable** - Async architecture, PostgreSQL ready, Docker-compatible

---

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Python 3.9+
- pip

### Installation
```powershell
# 1. Navigate to backend
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 4. Initialize database
alembic upgrade head

# 5. Run tests
pytest -v

# 6. Start server
uvicorn main:app --reload
```

API available at: **http://localhost:8000**  
Documentation at: **http://localhost:8000/docs**  
Trainer Portal at: **`coach-portal/trainers.html`**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **START_HERE.md** | 👈 Begin here - navigation guide |
| **PERFECT_SUMMARY.md** | High-level overview of what was built |
| **IMPLEMENTATION_COMPLETE.md** | Detailed architecture & API docs |
| **SETUP_AND_TESTING.md** | Installation & troubleshooting |
| **SYSTEM_OVERVIEW.txt** | ASCII architecture diagram |
| **VERIFICATION_CHECKLIST.md** | Complete feature verification |

---

## 🆕 What's New (November 2025)

### Intelligent Reminder System ✨
```
✨ AI-Generated Messages → Personalized reminders via Claude
✨ Smart Scheduling → Schedule for specific times
✨ Multi-Channel Delivery → In-app, push (FCM), email (SMTP)
✨ Automatic Sending → Background worker (every 60 seconds)
✨ Comprehensive Testing → 11 reminder tests + 8 notification tests
```

**API Endpoints** (NEW):
```bash
POST /api/v1/reminders                    # Create reminder
GET /api/v1/reminders                     # List reminders
POST /api/v1/reminders/{id}/send          # Send now
DELETE /api/v1/reminders/{id}             # Delete
```

### Database Migrations ✨
```
✨ Alembic Integration → Version control for DB schema
✨ Reminders Table → Fully indexed with foreign keys
✨ Supplements Column → Store recommendations in diet plans
```

### Trainer Portal ✨
```
✨ Web Interface → No login needed, uses bearer tokens
✨ Create Plans → AI generates with research backing
✨ Set Reminders → Schedule with custom messages
✨ Real-time Feedback → See API responses instantly
```

---

## 🏗️ Architecture

```
Client (Mobile)          Coach (Web)
     ↓                        ↓
     └────────────────────────┘
              ↓
        FastAPI Backend
           ↓        ↓        ↓
       Routes   Services   Database
        ↓        ↓        ↓
    AI Coach  Reminders  SQLite/PostgreSQL
    Claude    Notifications
    PubMed    FCM, SMTP
    MediaPipe
```

### Key Components

| Component | Role | Tech |
|-----------|------|------|
| **AI Service** | Coaching, diet plans, reminders, form analysis | Claude + PubMed |
| **Reminder System** | Schedule & send smart reminders | Async worker |
| **Notification Service** | Multi-channel delivery | In-app, FCM, SMTP |
| **Database** | Persistent storage | SQLAlchemy + Alembic |
| **Routes** | API endpoints | FastAPI |
| **Mobile App** | Client interface | React Native + Expo |
| **Trainer Portal** | Coach interface | Static HTML |

---

## 📋 API Examples

### Create a Reminder (AI generates message)
```bash
curl -X POST "http://localhost:8000/api/v1/reminders?title=Hydration&remind_at=2025-11-22T15:00:00" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create AI Diet Plan
```bash
curl -X POST "http://localhost:8000/api/v1/diet/plans/generate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "biometrics": {"age": 28, "weight": 75, "height": 180, "goal": "muscle gain"},
    "preferences": {"restrictions": [], "cuisines": ["Mediterranean"]}
  }'
```

### List Reminders
```bash
curl -X GET "http://localhost:8000/api/v1/reminders" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Full API documentation: `http://localhost:8000/docs`

---

## 🧪 Testing

```powershell
# Run all tests
pytest -v

# Run specific test file
pytest tests/test_reminders.py -v

# With coverage report
pytest --cov=app tests/

# Run single test
pytest tests/test_reminders.py::test_reminder_model_creation -v
```

**Test Coverage**: 20+ tests covering:
- ✅ Reminder creation & persistence
- ✅ AI message generation (mocked Claude)
- ✅ Background worker logic
- ✅ Multi-channel notifications
- ✅ Supplement recommendations
- ✅ Configuration validation
- ✅ Error handling & fallbacks

---

## 🔧 Configuration

Create `.env` from `.env.example`:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SECRET_KEY=your-secret-key-min-32-chars
DATABASE_URL=sqlite:///./ino_fitness.db

# Optional (for full features)
FCM_API_KEY=your-firebase-cloud-messaging-key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

All options documented in `.env.example`.

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── routes/
│   │   ├── reminders.py          ← NEW (reminder CRUD + send)
│   │   ├── ai_coach.py           (nutrition, chat, planning)
│   │   ├── diet.py               (diet plans with research)
│   │   ├── workouts.py
│   │   ├── progress.py
│   │   ├── coaching.py
│   │   ├── auth.py
│   │   └── users.py
│   ├── models.py                 (15+ SQLAlchemy models + Reminder)
│   ├── ai_service.py             (Claude integration + generate_reminder_message)
│   ├── notification_service.py   ← NEW (push, email, in-app)
│   ├── database.py               (SQLAlchemy setup)
│   ├── auth.py                   (JWT)
│   └── schemas.py
├── tests/
│   ├── test_reminders.py         ← NEW (11 tests)
│   ├── test_notifications.py     ← NEW (8 tests)
│   └── test_supplements.py
├── alembic/                      ← NEW (database migrations)
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 001_add_reminders_and_supplements.py
├── main.py                       (FastAPI app + reminder worker)
├── requirements.txt              (+ alembic)
└── alembic.ini                   ← NEW

mobile/
├── src/
│   ├── screens/
│   ├── services/
│   ├── components/
│   └── navigation/
├── App.tsx
└── package.json

coach-portal/
└── trainers.html                 ← NEW (web UI for coaches)

START_HERE.md                      ← Read this first!
PERFECT_SUMMARY.md
IMPLEMENTATION_COMPLETE.md
SETUP_AND_TESTING.md
SYSTEM_OVERVIEW.txt
VERIFICATION_CHECKLIST.md
.env.example
check_setup.py                     (sanity check script)
```

---

## 🚀 Deployment

### Local Development
```powershell
uvicorn main:app --reload
```

### Production (Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

### Production (Gunicorn)
```powershell
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Database
- **Development**: SQLite (default)
- **Production**: PostgreSQL
  ```
  DATABASE_URL=postgresql://user:password@localhost/ino_fitness
  ```

---

## 🔒 Security

✅ **JWT Authentication** - All routes require bearer token  
✅ **Password Hashing** - bcrypt encryption  
✅ **SQL Injection Protection** - SQLAlchemy ORM  
✅ **CORS Configured** - Prevent unauthorized cross-origin requests  
✅ **Environment Secrets** - API keys in .env, not in code  
✅ **User Isolation** - Can't see other users' data  

---

## ⚙️ Features Complete

### AI Coaching
- [x] Chat with AI fitness coach
- [x] Personalized workout plans
- [x] Research-backed diet plans
- [x] Supplement recommendations with citations
- [x] Exercise form recognition
- [x] **NEW**: Smart reminders with AI messages

### Client Experience
- [x] Mobile app (React Native)
- [x] User authentication
- [x] Progress tracking
- [x] In-app messaging with coaches
- [x] **NEW**: Multi-channel reminders

### Trainer Tools
- [x] Coaching interface
- [x] Client management
- [x] Plan creation & modification
- [x] **NEW**: Web portal for trainers
- [x] **NEW**: Reminder scheduling

### Backend Services
- [x] 20+ REST API endpoints
- [x] Database with 15+ models
- [x] JWT authentication
- [x] **NEW**: Reminder system
- [x] **NEW**: Notification service
- [x] **NEW**: Database migrations

### Quality Assurance
- [x] 20+ comprehensive tests
- [x] Full mock coverage
- [x] Error handling & fallbacks
- [x] Documentation (5000+ lines)
- [x] Sanity check script

---

## 🎯 Next Steps

1. **Read**: `START_HERE.md` for navigation
2. **Install**: Follow "Quick Start" above
3. **Test**: `pytest -v`
4. **Run**: `uvicorn main:app --reload`
5. **Explore**: `http://localhost:8000/docs`
6. **Try**: Open `coach-portal/trainers.html`

---

## 📞 Support

- **Setup Issues**: See `SETUP_AND_TESTING.md`
- **API Questions**: Check `http://localhost:8000/docs`
- **Architecture**: Read `IMPLEMENTATION_COMPLETE.md`
- **Validation**: Run `python check_setup.py`

---

## 📊 Stats

```
Code:         ~3000 lines (backend)
Tests:        20+ comprehensive test cases
Documentation: 5000+ lines
Models:       15+ SQLAlchemy models
Endpoints:    20+ REST API routes
AI Features:  Claude, PubMed, MediaPipe
```

---

## 🙏 Acknowledgments

Built with:
- **Anthropic Claude** - AI coaching & intelligence
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Powerful ORM
- **MediaPipe** - Computer vision pose detection
- **PubMed** - Research citation integration
- **React Native** - Cross-platform mobile

---

**Status**: ✅ **PRODUCTION READY**

**Version**: 1.0.0 Complete

**Last Updated**: November 22, 2025

🎉 **Ready to launch your AI fitness platform!**

---

### Quick Commands

```powershell
# Setup
pip install -r backend/requirements.txt
alembic upgrade head

# Development
uvicorn main:app --reload

# Testing
pytest -v

# Validation
python check_setup.py
```

### Key Files
- 📍 START_HERE.md - Navigation guide
- 📍 .env.example - Configuration template
- 📍 check_setup.py - Validation script
- 📍 coach-portal/trainers.html - Trainer web UI
- 📍 backend/tests/ - Test suite

For more, see **START_HERE.md** ➜
