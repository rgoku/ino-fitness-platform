# INO Trainer Dashboard

Next.js 14 coach dashboard for the INO Fitness Platform. Part of the INO monorepo — shares the FastAPI backend with the client web app and mobile app.

## Getting started

```bash
# Install dependencies (from the repo root or this directory)
npm install

# Copy environment template and fill in values
cp .env.example .env.local

# Run the dev server
npx next dev
# Default port: 3000
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000).

## Environment variables

See [`.env.example`](./.env.example). Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend (e.g. `http://localhost:8095`). Leave unset to run with mock data. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (optional in dev). |

When `NEXT_PUBLIC_API_URL` is not set, the app runs in mock-data mode and the auth middleware is bypassed so you can explore the dashboard without a backend.

## Scripts

```bash
npx next dev          # Start the dev server on port 3000
npx next build        # Production build (also serves as type check)
npx next start        # Run the production build
npm run lint          # Lint
npm run test          # Jest unit tests
```

## Project structure

```
src/
  app/                — Next.js App Router pages
    (dashboard)/      — Authenticated coach routes (layout, error, not-found)
    login/            — Public auth routes
  components/         — Feature components
    ui/               — Design-system primitives (Button, Card, Badge, etc.)
  hooks/              — React Query hooks
  lib/                — API client, mock data, utilities
  providers/          — React context providers
  stores/             — Zustand stores (auth, sidebar, theme, notifications)
  middleware.ts       — Route protection (cookie-based auth gate)
```

## Authentication

- Tokens are stored in `localStorage` (`ino_auth_token`) for client-side API calls.
- The same token is mirrored to a cookie (`ino_auth_token`) so `src/middleware.ts` can gate routes server-side.
- Public paths: `/login`, `/signup`, `/forgot-password`. Everything else redirects to `/login?redirect=<path>` when the cookie is missing.
- In mock mode (no `NEXT_PUBLIC_API_URL`), middleware bypasses the check.

## Error handling

- `src/app/error.tsx` — global App Router error boundary.
- `src/app/not-found.tsx` — global 404 page.
- `src/app/(dashboard)/error.tsx` — dashboard-scoped error page with retry + home buttons.
- `src/app/(dashboard)/not-found.tsx` — dashboard-scoped 404 page.
- `src/components/error-boundary.tsx` — reusable client React error boundary for finer-grained error isolation.

## Deployment (Vercel)

This app ships with a [`vercel.json`](./vercel.json) that pins the build to the `iad1` region, applies a baseline set of security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`), and maps `NEXT_PUBLIC_API_URL` to the `ino_api_url` Vercel secret.

### Deploy steps

1. Install the Vercel CLI: `npm i -g vercel`.
2. From `trainer-app/apps/web`, run `vercel link` to connect this directory to your Vercel project.
3. Create the required secret:
   ```bash
   vercel secrets add ino_api_url https://api.ino-fitness.com
   ```
4. Add any additional env vars in the Vercel dashboard (e.g. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
5. Deploy:
   ```bash
   vercel            # preview
   vercel --prod     # production
   ```

### Monorepo notes

The project root for Vercel should be set to `trainer-app/apps/web`. The build command (`next build`) and framework (`nextjs`) are already pinned in `vercel.json`.

## Design system

See `design-system/MASTER.md` at the repo root for complete specs. Key conventions:

- Accent color: electric green (`#10B981`) — use `brand-500`/`brand-600` utilities.
- Typography: Inter — use `text-heading-1`, `text-heading-2`, `text-body-sm`, etc.
- Spacing: 8px grid.
- Dark mode: full CSS variable system via `var(--color-text-primary)` etc.
- Icons: Lucide only, never emoji.
- Numbers: always add `tabular-nums`.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS with custom design tokens
- React Query (`@tanstack/react-query`) for server state
- Zustand for client state
- Lucide React for icons
- Recharts for visualizations
