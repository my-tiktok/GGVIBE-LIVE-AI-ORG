# Vercel Deployment Runbook

This repository deploys a Next.js app from `ggvibe/`.

## Required Vercel project settings
> This repo ships a root `vercel.json` to force building from `ggvibe/` so routes like `/market` and `/api/market/items` do not 404 from wrong project root.

- **Framework Preset:** Next.js
- **Root Directory:** `ggvibe`
- **Install Command:** `npm ci`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node.js Version:** `20.x`

## Required environment variables (Production/Preview/Development)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_APP_URL`
- `SESSION_SECRET`
- `KV_REST_API_URL` (optional, recommended for production rate limiting)
- `KV_REST_API_TOKEN` (optional, recommended for production rate limiting)

## Deploy and verify
```bash
VERCEL_URL="https://<your-vercel-domain>"
curl -i "$VERCEL_URL/"
curl -i "$VERCEL_URL/market"
curl -i "$VERCEL_URL/payouts"
```

Expected:
- `/` -> `200`
- `/market` -> `200` (empty state is valid)
- `/payouts` -> redirects to `/login` when logged out

## CI policy note
If CI fails due to blocked `actions/*`, apply `CI_TROUBLESHOOTING.md` first.


## Firebase Console checklist
- Authentication providers: Email/Password, Google, GitHub, Phone enabled.
- Authorized domains include:
  - `localhost`
  - your production domain
  - any Vercel preview domains you use
- OAuth redirect handler for providers uses Firebase handler endpoint:
  - `https://<your-auth-domain>/__/auth/handler`

## Firestore rules deployment
- Publish rules from `ggvibe/firestore.rules`.
- Verify MVP policy after publish:
  - listings public read
  - sellers owner read/write
  - payoutRequests owner create/read, admin update
  - users owner read/write
