# INÖ Fitness App - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### Step 1: Prerequisites Check
```bash
# Verify Node.js
node --version  # Should be 18 or higher

# Verify Python
python --version  # Should be 3.9 or higher
```

### Step 2: Install Dependencies
```bash
# From project root
npm run install:all
```

### Step 3: Setup Backend

**Create `.env` file in `backend/` directory:**
```bash
cd backend
cp .env.example .env

# Edit .env with your values (minimum required):
# DATABASE_URL=sqlite:///./ino_fitness.db
# SECRET_KEY=dev-secret-key
# ANTHROPIC_API_KEY=your-api-key (get from https://console.anthropic.com)
```

**Install and run backend:**
```bash
pip install -r requirements.txt
python main.py
```

Backend will start on `http://localhost:8000`

✅ Test: Visit `http://localhost:8000/docs` - you should see API documentation

### Step 4: Setup Mobile App

**Create `.env` file in `mobile/` directory:**
```bash
cd ../mobile
echo "EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_local" > .env
```

**Start Expo:**
```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Or scan QR code with Expo Go app

### Step 5: Access the App

#### Mobile App
- Login screen appears first
- Create test account or use existing credentials
- Follow onboarding to set biometrics

#### API Documentation
- Browse API: `http://localhost:8000/docs`
- ReDoc docs: `http://localhost:8000/redoc`

---

## 📋 Feature Checklist

### Implemented Features
- ✅ User Authentication (signup, login)
- ✅ User Profiles & Biometrics
- ✅ AI Workout Plan Generation
- ✅ AI Diet Plan Generation
- ✅ Food Photo Analysis
- ✅ Exercise Form Analysis
- ✅ Progress Tracking
- ✅ Chat with AI Coach
- ✅ Coaching Integration
- ✅ Streak & Achievement System

### Default Test Credentials
```
Email: test@example.com
Password: password123
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill the process if needed
kill -9 <PID>

# Try with different port
python -m uvicorn main:app --port 8001
```

### Mobile app can't connect to backend
```bash
# On iPhone simulator
# Change API URL to: http://localhost:8000

# On Android emulator
# Use: http://10.0.2.2:8000

# Update in mobile/.env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

### Database errors
```bash
# Reset SQLite database
rm ino_fitness.db

# Restart backend - DB will auto-create
python main.py
```

### Missing dependencies
```bash
# Backend
pip install -r requirements.txt --upgrade

# Mobile
npm install
```

---

## 📚 Project Structure Overview

```
backend/
├── main.py              # FastAPI app entry
├── app/
│   ├── models.py        # Database models
│   ├── schemas.py       # Pydantic schemas
│   ├── ai_service.py    # AI/Claude integration
│   ├── auth.py          # JWT authentication
│   ├── database.py      # Database setup
│   └── routes/          # API endpoints
```

```
mobile/
├── App.tsx              # Main entry
├── src/
│   ├── screens/         # All UI screens
│   ├── services/        # API clients
│   ├── context/         # State (Auth)
│   ├── navigation/      # Navigation
│   └── types/           # TypeScript types
```

---

## 🔑 Key API Endpoints

### Authentication
```bash
# Register
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Generate Workout Plan
```bash
POST /api/v1/workouts/plans/generate
{
  "biometrics": {
    "age": 25,
    "gender": "male",
    "weight": 80,
    "height": 180,
    "experience_level": "beginner",
    "goals": ["muscle_gain", "strength"]
  }
}
```

### Generate Diet Plan
```bash
POST /api/v1/diet/plans/generate
{
  "biometrics": {...},
  "preferences": {
    "restrictions": ["dairy"],
    "cuisines": ["italian", "asian"]
  }
}
```

### Chat with AI Coach
```bash
POST /api/v1/ai/chat
{
  "user_id": "user_id",
  "content": "How do I improve my squat form?",
  "context": "workout"
}
```

---

## 🎯 Next Steps

1. **Add Real Database**: Replace SQLite with PostgreSQL
   - Set `DATABASE_URL=postgresql://user:pass@localhost/ino_fitness`

2. **Add Real Authentication**: Use Firebase or Auth0
   - Update mobile auth services

3. **Deploy Backend**: Use Railway, Render, or Heroku
   - Update `EXPO_PUBLIC_API_URL` to production URL

4. **Deploy Mobile**: Use Expo EAS Build
   - Run `eas build --platform ios --auto`

5. **Add Payments**: Integrate Stripe
   - Get Stripe keys from https://stripe.com

---

## 💡 Tips

- Check API docs at `/docs` while developing
- Use Postman to test endpoints independently
- Enable auto-reload: `python -m uvicorn main:app --reload`
- Check mobile console: Shake device → Open debugger
- Logs are printed to terminal

---

## 📞 Support

For issues:
1. Check existing GitHub issues
2. Review error logs in terminal
3. Check `.env` file configuration
4. Verify dependencies are installed

Happy coding! 🚀
