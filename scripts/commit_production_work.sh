#!/usr/bin/env bash
# Commits the production-readiness work (Phases 1-4) and pushes to GitHub.
# Run from the repo root in Git Bash:  bash scripts/commit_production_work.sh
set -e
cd "$(dirname "$0")/.."

# Clear any stale lock from an interrupted git operation
rm -f .git/index.lock

# Stage exactly the files changed for this work
git add --pathspec-from-file=scripts/_commit_files.txt

echo "Files to be committed:"
git diff --cached --name-only

git commit -m "Production readiness: P0-P4 fixes (auth, security, migrations, tests, mock-screen backends)

- P0: mount orphaned routers + new models; POST /programs; anthropic pin + cryptography;
  mobile build fix; dashboard API-first (no mock auto-login); duplicate-React fix.
- P1: CORS lockdown; coach->client IDOR fix; DB-backed rotating refresh tokens;
  coach-only role gating; upload validation; real food-photo/AI-assistant (no stubs).
- P2/P3: squashed+repaired Alembic chain (clean alembic.ini); tuned polling (web+mobile);
  Render as single deploy target; 17-test backend suite; CI workflow; EAS config;
  Habits/Bookings/Challenges/Leaderboard/Grocery backends + mobile wiring; food-log + watch-demo."

# Push to the tracked upstream (origin/claude/cinematic-landing-demo-terminal)
git push

echo
echo "Pushed to: $(git rev-parse --abbrev-ref @{u})"
echo "Review on GitHub, then open a PR to main if you want it there."
