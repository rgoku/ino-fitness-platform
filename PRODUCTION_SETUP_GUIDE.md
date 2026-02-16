# AI Fitness Empire - Complete Production Setup

## 🚀 ONE-COMMAND SETUP (Choose Your Platform)

### Windows (PowerShell)
```powershell
# Copy and run this entire block in PowerShell

Write-Host "🏋️ AI Fitness Empire - Complete Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check prerequisites
Write-Host "✓ Checking prerequisites..." -ForegroundColor Yellow
$checks = @(
    @{name="Node.js"; cmd="node --version"; install="https://nodejs.org"},
    @{name="npm"; cmd="npm --version"; install="nodejs.org"},
    @{name="Python"; cmd="python --version"; install="https://python.org"},
    @{name="Git"; cmd="git --version"; install="https://git-scm.com"}
)

foreach ($check in $checks) {
    try {
        $result = & $check.cmd 2>&1
        Write-Host "  ✅ $($check.name): $result" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $($check.name) not found - Install from $($check.install)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✓ All prerequisites installed!" -ForegroundColor Green
Write-Host ""

# 2. Setup directories
Write-Host "✓ Creating project structure..." -ForegroundColor Yellow
$rootPath = "$env:USERPROFILE\Desktop\FitnessPro"
if (Test-Path $rootPath) {
    Remove-Item -Recurse -Force $rootPath
}
New-Item -ItemType Directory -Path $rootPath -Force | Out-Null
Set-Location $rootPath

# 3. Clone repositories
Write-Host "✓ Cloning repositories..." -ForegroundColor Yellow
Write-Host "  Cloning frontend..." -ForegroundColor Cyan
npx degit 0xFrann/2025-fitness-pro-complete-final frontend 2>&1 | Out-Null

Write-Host "  Cloning backend..." -ForegroundColor Cyan
npx degit 0xFrann/fitness-pro-backend-2025-final backend 2>&1 | Out-Null

Write-Host "✅ Repositories cloned!" -ForegroundColor Green
Write-Host ""

# 4. Frontend setup
Write-Host "✓ Setting up frontend..." -ForegroundColor Yellow
Set-Location "$rootPath\frontend"

Write-Host "  Installing dependencies..." -ForegroundColor Cyan
npm install 2>&1 | Select-Object -Last 5

# Create .env.local
$envContent = @"
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EXPO_PUBLIC_APP_NAME=FitnessPro
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "  ✅ Created .env.local (update with your Supabase credentials)" -ForegroundColor Green

# 5. Backend setup
Write-Host ""
Write-Host "✓ Setting up backend..." -ForegroundColor Yellow
Set-Location "$rootPath\backend"

# Create virtual environment
Write-Host "  Creating Python virtual environment..." -ForegroundColor Cyan
python -m venv venv
& .\venv\Scripts\Activate.ps1

Write-Host "  Installing dependencies..." -ForegroundColor Cyan
pip install -q -r requirements.txt

# Create .env
$backendEnv = @"
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-key-here
CLAUDE_API_KEY=your-anthropic-key
GEMINI_API_KEY=your-google-key
JWT_SECRET=your-secret-key-min-32-chars
HOST=0.0.0.0
PORT=8000
"@

$backendEnv | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "  ✅ Created .env (update with your API keys)" -ForegroundColor Green

# 6. Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Update environment variables:" -ForegroundColor White
Write-Host "   Frontend: $rootPath\frontend\.env.local" -ForegroundColor Gray
Write-Host "   Backend: $rootPath\backend\.env" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Get Supabase credentials:" -ForegroundColor White
Write-Host "   → https://app.supabase.com" -ForegroundColor Cyan
Write-Host "   → Create new project or use existing" -ForegroundColor Cyan
Write-Host "   → Copy URL + anon key + service key" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  Get AI API keys:" -ForegroundColor White
Write-Host "   → Claude: https://console.anthropic.com" -ForegroundColor Cyan
Write-Host "   → Gemini: https://ai.google.dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  Start development servers:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "   cd $rootPath\backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   uvicorn main:app --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "   cd $rootPath\frontend" -ForegroundColor Gray
Write-Host "   npx expo start" -ForegroundColor Gray
Write-Host ""
Write-Host "5️⃣  Deploy backend (optional):" -ForegroundColor White
Write-Host "   npx railway up --service fitness-backend" -ForegroundColor Gray
Write-Host "   → Get URL from Railway dashboard" -ForegroundColor Gray
Write-Host "   → Update EXPO_PUBLIC_BACKEND_URL in frontend .env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project location: $rootPath" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
```

### macOS/Linux (Bash)
```bash
#!/bin/bash
set -e

echo "🏋️  AI Fitness Empire - Complete Setup"
echo "========================================"
echo ""

# 1. Check prerequisites
echo "✓ Checking prerequisites..."
commands=("node" "npm" "python3" "git")
for cmd in "${commands[@]}"; do
    if ! command -v $cmd &> /dev/null; then
        echo "❌ $cmd not found. Install from appropriate source."
        exit 1
    fi
    version=$($cmd --version 2>&1 | head -1)
    echo "  ✅ $cmd: $version"
done

echo ""
echo "✓ All prerequisites installed!"
echo ""

# 2. Setup directories
echo "✓ Creating project structure..."
ROOT_PATH="$HOME/Desktop/FitnessPro"
rm -rf "$ROOT_PATH" 2>/dev/null || true
mkdir -p "$ROOT_PATH"
cd "$ROOT_PATH"

# 3. Clone repositories
echo "✓ Cloning repositories..."
echo "  Cloning frontend..."
npx degit 0xFrann/2025-fitness-pro-complete-final frontend

echo "  Cloning backend..."
npx degit 0xFrann/fitness-pro-backend-2025-final backend

echo "✅ Repositories cloned!"
echo ""

# 4. Frontend setup
echo "✓ Setting up frontend..."
cd "$ROOT_PATH/frontend"

echo "  Installing dependencies..."
npm install > /dev/null 2>&1

# Create .env.local
cat > .env.local << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EXPO_PUBLIC_APP_NAME=FitnessPro
EOF

echo "  ✅ Created .env.local"

# 5. Backend setup
echo ""
echo "✓ Setting up backend..."
cd "$ROOT_PATH/backend"

# Create virtual environment
echo "  Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "  Installing dependencies..."
pip install -q -r requirements.txt

# Create .env
cat > .env << 'EOF'
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-key-here
CLAUDE_API_KEY=your-anthropic-key
GEMINI_API_KEY=your-google-key
JWT_SECRET=your-secret-key-min-32-chars
HOST=0.0.0.0
PORT=8000
EOF

echo "  ✅ Created .env"

# 6. Success message
echo ""
echo "========================================"
echo "🎉 Setup Complete!"
echo "========================================"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Update environment variables:"
echo "   Frontend: $ROOT_PATH/frontend/.env.local"
echo "   Backend: $ROOT_PATH/backend/.env"
echo ""
echo "2️⃣  Get Supabase credentials:"
echo "   → https://app.supabase.com"
echo "   → Create new project or use existing"
echo "   → Copy URL + anon key + service key"
echo ""
echo "3️⃣  Get AI API keys:"
echo "   → Claude: https://console.anthropic.com"
echo "   → Gemini: https://ai.google.dev"
echo ""
echo "4️⃣  Start development servers:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   cd $ROOT_PATH/backend"
echo "   source venv/bin/activate"
echo "   uvicorn main:app --reload"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd $ROOT_PATH/frontend"
echo "   npx expo start"
echo ""
echo "5️⃣  Deploy backend (optional):"
echo "   npx railway up --service fitness-backend"
echo ""
echo "========================================"
echo "Project location: $ROOT_PATH"
echo "========================================"
```

---

## 📦 Manual Setup (Step-by-step)

If the automated scripts don't work, follow these manual steps:

### Step 1: Clone Repositories
```bash
# Create a folder for your project
mkdir ~/Desktop/FitnessPro
cd ~/Desktop/FitnessPro

# Clone frontend
npx degit 0xFrann/2025-fitness-pro-complete-final frontend
cd frontend

# Clone backend (in another terminal or folder)
cd ~/Desktop/FitnessPro
npx degit 0xFrann/fitness-pro-backend-2025-final backend
```

### Step 2: Frontend Setup
```bash
cd ~/Desktop/FitnessPro/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npx expo start
```

### Step 3: Backend Setup
```bash
cd ~/Desktop/FitnessPro/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start server
uvicorn main:app --reload
```

### Step 4: Database Setup (Supabase)
```sql
-- 1. Create Supabase project at https://app.supabase.com
-- 2. In SQL Editor, paste the entire migration from:
--    backend/migrations/001_create_tables.sql
-- 3. Click "Run"
-- 4. Copy credentials to .env files
```

---

## 🔑 Required API Keys

### Supabase (Database)
1. Go to https://app.supabase.com
2. Create new project
3. Settings → API → Copy:
   - URL: `EXPO_PUBLIC_SUPABASE_URL`
   - Anon Key: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Service Key: `SUPABASE_KEY` (backend)

### Anthropic (Claude API)
1. Go to https://console.anthropic.com
2. Create API key
3. Add to backend `.env` as `CLAUDE_API_KEY`

### Google (Gemini API)
1. Go to https://ai.google.dev
2. Create API key
3. Add to backend `.env` as `GEMINI_API_KEY`

---

## 🚀 Quick Test Commands

```bash
# Test frontend
cd frontend
npm run lint          # Check for errors
npm run type-check    # TypeScript validation

# Test backend
cd backend
python -m pytest      # Run tests
uvicorn main:app --reload  # Start server

# Test API endpoints
curl http://localhost:8000/docs    # Swagger UI
curl http://localhost:8000/health  # Health check
```

---

## 📊 File Structure After Setup

```
FitnessPro/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── .env.local         ← Update with your keys
│   ├── package.json
│   └── README.md
├── backend/
│   ├── app/
│   ├── routes/
│   ├── models/
│   ├── .env              ← Update with your keys
│   ├── requirements.txt
│   ├── main.py
│   └── README.md
└── COMPLETE_CODEBASE_GUIDE.md ← Full documentation
```

---

## 🆘 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `npx: command not found` | Install Node.js from https://nodejs.org |
| `python: command not found` | Install Python from https://python.org |
| `Module not found` | Run `npm install` or `pip install -r requirements.txt` |
| Port 8000 in use | Use different port: `uvicorn main:app --port 8001` |
| Supabase connection failed | Check URL and API keys in .env files |
| Video upload fails | Ensure backend is running and BACKEND_URL is correct |
| Blank mobile screen | Run `npx expo start --clear` to clear cache |

---

## 📱 Testing on Device

### iOS (macOS only)
```bash
cd frontend
npx eas build --platform ios
# Scan QR code with Camera app
# Open with TestFlight
```

### Android
```bash
cd frontend
npx eas build --platform android
# Download APK or use Google Play beta
```

### Web (Optional)
```bash
cd frontend
npm run build
npm run start
# Opens http://localhost:3000
```

---

## 🚢 Deploy to Production

### Deploy Backend to Railway
```bash
npm install -g @railway/cli
railway login
cd backend
railway up
# Get URL from Railway dashboard
```

### Deploy Frontend to Expo
```bash
cd frontend
eas build --platform ios --release
eas build --platform android --release
# Submit to App Store / Google Play
```

### Deploy Web to Vercel
```bash
cd frontend
vercel --prod
# Your app is now live
```

---

## 💡 Tips & Best Practices

1. **Keep APIs Secure:**
   - Use `.env` files (never commit to Git)
   - Enable RLS on all Supabase tables
   - Rotate API keys regularly

2. **Monitor Performance:**
   - Use Sentry for error tracking
   - Monitor API response times
   - Check database query performance

3. **Scale Your App:**
   - Use CDN for media (Cloudinary)
   - Implement caching (Redis)
   - Setup load balancing

4. **Backup Your Data:**
   - Enable Supabase automated backups
   - Export database regularly
   - Test restore procedure

---

**You're now ready to launch your fitness empire! 🚀**

For support and questions:
- 📚 Full Guide: `COMPLETE_CODEBASE_GUIDE.md`
- 🐛 Issues: GitHub Issues in each repo
- 💬 Community: Discord/Slack channels
