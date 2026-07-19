@echo off
REM Commits the production-readiness work (Phases 1-4) and pushes to GitHub.
cd /d "%~dp0.."
if exist ".git\index.lock" del ".git\index.lock"
git add --pathspec-from-file=scripts/_commit_files.txt
echo Files to be committed:
git diff --cached --name-only
git commit -m "Production readiness: P0-P4 fixes (auth, security, migrations, tests, mock-screen backends)"
git push
echo.
echo Pushed. Review on GitHub, then open a PR to main if desired.
