@echo off
echo ============================================
echo   INO FITNESS APP - Start Dev Servers
echo ============================================
echo.

cd /d "%~dp0"

echo Starting web-app on port 3001...
echo Open http://localhost:3001/fit in your browser
echo.
echo Press Ctrl+C to stop the server.
echo.

cd web-app
npx next dev --port 3001
