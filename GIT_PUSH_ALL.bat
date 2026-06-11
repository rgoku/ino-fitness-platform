@echo off
echo ============================================
echo   INO Fitness - Commit and Push to GitHub
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Removing git lock file...
if exist ".git\index.lock" (
    del /f /q ".git\index.lock"
    echo       Lock removed
) else (
    echo       No lock found
)

echo [2/4] Staging dark cinematic redesign files...
git add web-app/components/screens/HomeScreen.tsx
git add web-app/components/screens/DietScreen.tsx
git add web-app/components/screens/ChatScreen.tsx
git add web-app/components/screens/ProgressScreen.tsx
git add web-app/components/screens/ProfileScreen.tsx
git add web-app/components/screens/RemindersScreen.tsx
git add web-app/components/TabBar.tsx
git add web-app/app/fit/page.tsx
git add .vscode/tasks.json
git add START_FIT_APP.bat
git add CLAUDE.md

echo [3/4] Creating commit...
git commit -m "feat(fit): dark cinematic UI redesign for client app - Complete redesign of /fit client app with premium dark theme - #030303 background, glassmorphism cards, SVG Lucide icons - Brand green (#10B981) accents with glow effects - All 6 screens: Home, Diet, Chat, Progress, Profile, Reminders - Tab bar with backdrop-blur and active indicator - AI Insight cards with gradient styling - Added VS Code task and startup batch file Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"

echo [4/4] Pushing to GitHub...
git push origin claude/cinematic-landing-demo-terminal

echo.
echo ============================================
echo   Done! Check GitHub for the push.
echo ============================================
pause
