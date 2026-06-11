@echo off
echo ============================================
echo   INO Fitness App - Starting Dev Server
echo ============================================
echo.

cd /d "%~dp0web-app"

echo [1/3] Deleting stale .next cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo       Done - .next removed
) else (
    echo       .next already clean
)

echo [2/3] Clearing node_modules cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo       Done - cache cleared
) else (
    echo       Cache already clean
)

echo [3/3] Starting Next.js dev server on port 3001...
echo.
echo ============================================
echo   Open http://localhost:3001/fit in Chrome
echo ============================================
echo.

npx next dev --port 3001
pause
