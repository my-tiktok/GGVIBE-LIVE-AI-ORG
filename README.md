# GGVIBE LIVE AI

Production-focused repository for the GGVIBE Next.js app.

## Architecture Snapshot
- **Framework:** Next.js (App Router) in `ggvibe/`
- **Primary runtime:** Node.js 20+
- **Auth:** Firebase Auth (Email/Password, Google, GitHub, Phone)
- **Deployment target:** Vercel
- **Deploy root directory:** `ggvibe`


## Vercel project mapping (prevents 404/Not Found)
This repo includes a root `vercel.json` that forces Vercel to build the Next.js app from `ggvibe/`.
This prevents accidental deployments from repo root that can cause `Not Found` on routes like `/market` and `/api/market/items`.

## Local Development
```bash
cd ggvibe
npm ci
npm run dev
```

App default URL: `http://localhost:3000`

## Production Build
```bash
cd ggvibe
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

## Core Route Contract
- `GET /` -> `200`
- `GET /robots.txt` -> `200` and contains `Disallow: /payouts`
- `GET /mcp` -> `200` public deterministic JSON with top-level `tools` and `endpoints`
- `GET /market` -> `200` public listings page with empty-state fallback
- `GET /api/market/items` -> `200` public JSON list (or empty array on soft failure)
- `GET /payouts` -> redirects to `/login` when logged out; authenticated users can manage payout settings + requests
- `GET /api/payouts` -> `401` for anonymous users with `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`


## Required Environment Variables
Set these in Vercel for all environments (Production/Preview/Development):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` *(optional)*
- `NEXT_PUBLIC_APP_URL` *(canonical https domain)*
- `SESSION_SECRET` *(strong random 32+ chars)*
- `KV_REST_API_URL` *(optional, recommended for production rate limiting)*
- `KV_REST_API_TOKEN` *(optional, recommended for production rate limiting)*

## Deploy (Vercel)
See `ggvibe/ENVIRONMENT.md` for env vars and `DEPLOY_VERCEL.md` for direct deployment steps.

Recommended Vercel settings:
- Root Directory: `ggvibe`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `.next`
- Node.js: `20.x`

## CI Policy Troubleshooting
If GitHub Actions policy blocks `actions/*`, follow `CI_TROUBLESHOOTING.md`.


## CTO Smoke Test
Replace `<domain>` with your production hostname:

```bash
BASE="https://<domain>"
curl -i "$BASE/market"
curl -i "$BASE/api/market/items"
curl -i "$BASE/payouts"
curl -i "$BASE/api/auth/user"
curl -i "$BASE/robots.txt"
```

Expected:
- `/market`: 200
- `/api/market/items`: 200 JSON (`items` array)
- `/payouts`: 307/308 redirect to `/login` when logged out
- `/api/auth/user`: 401 when logged out, 200 when authenticated
- `/robots.txt`: 200 and includes `Disallow: /payouts`


Login API contract:
- `GET /api/login` -> `405`
- `POST /api/login` -> `200` on success, `401` on invalid credentials, `429` after repeated failed attempts
