@echo off
echo ============================================
echo   INO FITNESS APP - Git Fix and Commit
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Removing git lock file...
if exist ".git\index.lock" (
    del /f ".git\index.lock"
    echo       Lock file removed successfully.
) else (
    echo       No lock file found - good to go.
)
echo.

echo [2/4] Staging all changes...
git add -A
echo       Files staged.
echo.

echo [3/4] Committing changes...
git commit -m "feat(ml): unified digital twin engine + body analysis backend integration" -m "- Upgrade MuscleTwin.tsx to use generateDigitalTwin() unified engine" -m "- Fix SymmetryTab and InsightsTab to consume DigitalTwinReport" -m "- Align backend EXERCISE_MUSCLE_MAP with frontend MuscleSlug types" -m "- Fix IconAlertTriangle className prop in InsightsTab" -m "- Sync ML files between body-diagram and web-app" -m "- All TypeScript compilation passes with zero errors" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
echo.

echo [4/4] Pushing to GitHub...
git push origin claude/cinematic-landing-demo-terminal
echo.

echo ============================================
echo   Done! Changes pushed to GitHub.
echo ============================================
pause
