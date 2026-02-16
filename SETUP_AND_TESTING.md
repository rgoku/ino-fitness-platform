# INÖ Fitness Backend - Complete Setup & Test Guide

## Prerequisites
- Python 3.9+
- pip

## Installation & Setup

### 1. Install Python Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

### 2. Initialize the Database with Alembic Migrations
```powershell
# Create .env file from .env.example and configure it
copy .env.example .env

# Run migrations
alembic upgrade head
```

### 3. Run All Tests
```powershell
# Run all tests with pytest
pytest -v

# Run with coverage report
pytest --cov=app tests/
```

### 4. Run Specific Test Suites
```powershell
# Test reminders functionality
pytest tests/test_reminders.py -v

# Test supplements
pytest tests/test_supplements.py -v

# Test notifications (push, email, in-app)
pytest tests/test_notifications.py -v

# Run a specific test
pytest tests/test_reminders.py::test_reminder_model_creation -v
```

### 5. Start the Development Server
```powershell
# Option 1: Direct with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Via Python module
python -m uvicorn main:app --reload
```

## Project Structure

```
backend/
├── alembic/
│   ├── env.py              # Alembic environment configuration
│   ├── script.py.mako      # Migration template
│   └── versions/
│       └── 001_...py       # Initial migration (reminders + supplements)
├── app/
│   ├── ai_service.py       # Claude AI service + form recognition + reminders
│   ├── auth.py             # JWT authentication
│   ├── database.py         # SQLAlchemy setup
│   ├── models.py           # SQLAlchemy models (User, Reminder, DietPlan, etc.)
│   ├── notification_service.py  # Push/Email/In-app notification channels
│   ├── schemas.py          # Pydantic schemas
│   └── routes/
│       ├── ai_coach.py     # AI coaching endpoints
│       ├── auth.py         # Auth endpoints
│       ├── diet.py         # Diet plan endpoints
│       ├── reminders.py    # Reminder CRUD + send endpoints ← NEW
│       ├── workouts.py
│       ├── coaching.py
│       ├── progress.py
│       └── users.py
├── tests/
│   ├── test_reminders.py       # Reminder tests ← NEW
│   ├── test_supplements.py     # Supplement tests
│   └── test_notifications.py   # Notification channel tests ← NEW
├── main.py                 # FastAPI app + reminder worker startup
├── requirements.txt        # Python dependencies
└── alembic.ini            # Alembic configuration

```

## Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL`: SQLite or PostgreSQL connection
- `ANTHROPIC_API_KEY`: Claude API key
- `FCM_API_KEY`: Firebase Cloud Messaging API key (optional, for push notifications)
- `SMTP_SERVER`, `SMTP_USER`, `SMTP_PASSWORD`: Email configuration (optional)
- `SECRET_KEY`: JWT secret for auth

## Feature Overview

### 1. Reminders
- **Model**: `Reminder` table stores scheduled reminders
- **Routes**: 
  - `POST /api/v1/reminders` - Create reminder
  - `GET /api/v1/reminders` - List user's reminders
  - `POST /api/v1/reminders/{id}/send` - Send reminder now
  - `DELETE /api/v1/reminders/{id}` - Delete reminder
- **Background Worker**: Started on app startup; checks due reminders every 60 seconds and sends as in-app messages
- **AI Generation**: Claude generates personalized reminder messages

### 2. Notifications
- **Channels**: in-app, push (FCM), email (SMTP)
- **Service**: `NotificationService` abstracts channel selection
- **Integration**: Reminders can send via any channel; respects user preference

### 3. Diet Plans
- **Research Backed**: PubMed citations integrated
- **Supplements**: AI-generated supplement recommendations with evidence levels
- **Persistence**: Supplements stored in `diet_plans.supplement_recommendations` JSON column

### 4. Form Check (Exercise Form Recognition)
- **Technology**: MediaPipe Pose + OpenCV + Claude
- **Input**: Video file of exercise
- **Output**: Form score, improvements, safety warnings

### 5. Trainer Portal
- **Path**: `coach-portal/trainers.html`
- **Purpose**: Lightweight HTML UI for trainers to create plans and reminders
- **API Integration**: Calls FastAPI endpoints with bearer tokens

## Testing

All new code includes comprehensive test coverage using pytest and mocking:

### Reminder Tests (`test_reminders.py`)
- Reminder model creation and persistence
- Claude-based reminder message generation (with mock)
- Querying due reminders
- Marking reminders as sent
- Message creation from reminders
- Reminder deletion
- Channel options

### Notification Tests (`test_notifications.py`)
- In-app notification (always succeeds)
- Push notification (FCM) with missing config & token scenarios
- Email notification (SMTP) with missing config & email scenarios
- NotificationService routing & multi-channel sending

### Supplement Tests (`test_supplements.py`)
- Supplement recommendation generation with mocked PubMed & Claude
- Evidence summary generation
- Citation fetching

## Deployment Notes

### For Production
1. Use PostgreSQL instead of SQLite
2. Set `DATABASE_URL=postgresql://user:pass@host/db`
3. Configure SMTP credentials for email notifications
4. Obtain FCM credentials for push notifications
5. Set `DEBUG=false` in `.env`
6. Run migrations: `alembic upgrade head`
7. Use production-grade ASGI server (e.g., Gunicorn + Uvicorn):
   ```
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

### Database Backup
SQLite: `cp ino_fitness.db ino_fitness.db.backup`
PostgreSQL: `pg_dump -U user dbname > backup.sql`

## Troubleshooting

### Reminder worker not running
- Check that FastAPI startup event fires (no errors in logs)
- Verify `remind_at` times are in UTC
- Check `sent` flag is False for due reminders

### Notification fails silently
- Check `.env` has correct credentials
- In-app channel always succeeds; push/email need config
- Review logs for specific errors

### Alembic migration fails
- Ensure database exists and is accessible
- If upgrading existing DB without previous migrations, apply manually:
  ```sql
  CREATE TABLE reminders (...);
  ALTER TABLE diet_plans ADD COLUMN supplement_recommendations JSON;
  ```

## Quick Start (Copy-Paste)

```powershell
# 1. Setup
cd backend
pip install -r requirements.txt
cp .env.example .env
# [edit .env with your API keys]

# 2. Migrate
alembic upgrade head

# 3. Test
pytest -v

# 4. Run
uvicorn main:app --reload
```

Then visit trainer portal at: `file:///path/to/coach-portal/trainers.html`

---

**Last Updated**: 2025-11-22
**Version**: 1.0.0-complete
