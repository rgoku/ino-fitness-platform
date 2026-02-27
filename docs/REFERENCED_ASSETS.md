# Referenced Assets & External Files

This doc describes how **external files and folders** you provided are reflected in the INO Fitness App repo.

---

## Desktop references

| Item | Location / Purpose |
|------|--------------------|
| **files (2).zip** | Contains coach-web and API pieces: `App.jsx`, `ARCHITECTURE.md`, `ino-coach-command-center.jsx`, `ino-platform-unified.jsx`, `api.ts`, `AppShell.tsx`, `auth.tsx`, `CommandCenter.ts`, `Login.tsx`, `Makefile`, `seed.py`, `useApi.ts`. Content matches or overlaps with `ino-platform/` (apps/coach-web, services/api). |
| **files (3).zip** | Subset of files (2): `api.ts`, `AppShell.tsx`, `auth.tsx`, `CommandCenter.ts`, `Login.tsx`, `Makefile`, `seed.py`, `useApi.ts`. No separate merge needed; use `ino-platform/` as source of truth. |
| **ino-platform** (Desktop) | Same structure as `INO_FITNESS_APP/ino-platform/`: apps (coach-web, fit-mobile, landing, demo), packages, services/api, docs, infra. The repo’s `ino-platform/` is the integrated copy. |
| **SETUP_CHECKLIST.md** (Desktop) | Generic setup checklist. A **tailored version** for this project is at repo root: [SETUP_CHECKLIST.md](../SETUP_CHECKLIST.md) (paths, backend, mobile, ino-platform, Windows commands). |
| **ino-fitness.jsx** (Desktop) | Standalone client fitness app (themes, workout, habits, PRs, muscle map, coach connect). **Copied into** the repo at `ino-platform/apps/demo/ino-fitness.jsx`. See [ino-platform/apps/demo/README.md](../ino-platform/apps/demo/README.md). |

---

## Where things live in the repo

- **Setup checklist:** [SETUP_CHECKLIST.md](../SETUP_CHECKLIST.md)
- **INO Platform (coach stack):** [ino-platform/](../ino-platform/) and [INO_PLATFORM_INTEGRATION.md](../INO_PLATFORM_INTEGRATION.md)
- **Standalone JSX demos (ino-fitness, coach command center, unified):** [ino-platform/apps/demo/](../ino-platform/apps/demo/) and [ino-platform/apps/demo/README.md](../ino-platform/apps/demo/README.md)

---

## Using the zips

If you need to pull in changes from **files (2).zip** or **files (3).zip**:

1. Extract the zip.
2. Compare with:
   - **Coach web:** `ino-platform/apps/coach-web/src/` (e.g. `App.jsx`, `AppShell.tsx`, `lib/api.ts`, `lib/auth.tsx`, `pages/Login.tsx`, hooks).
   - **API:** `ino-platform/services/api/` (e.g. `app/`, `scripts/seed.py`).
3. Copy over any updated files you want; keep the repo’s folder layout (`apps/coach-web/`, `services/api/app/`, etc.).

No separate “merge” of the zips is required for the project to run; the repo’s `ino-platform/` is the canonical structure.
