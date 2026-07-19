@echo off
REM The production-readiness commit (24117a1) already exists locally.
REM This just tidies the index and pushes it to GitHub using your saved credentials.
cd /d "%~dp0.."
if exist ".git\index.lock" del ".git\index.lock"
git reset -q
git push origin claude/cinematic-landing-demo-terminal
echo.
echo Done. If it asks for login, use your GitHub username + a Personal Access Token.
