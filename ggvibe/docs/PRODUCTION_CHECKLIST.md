# Production Checklist (Vercel)

## Public vs private routes
- Public/indexable: `/`, `/login`, `/privacy`, `/terms`.
- Private/non-indexable: `/chat`, `/wallet`, `/transactions`, `/seller/*`, `/admin`.

## Auth guard behavior
- Middleware redirects unauthenticated private-route requests to `/login?next=...`.
- App private layout (`app/(app)/layout.tsx`) also server-checks session and redirects to `/login`.
- Admin route uses `ADMIN_EMAILS` allowlist and redirects non-admin users to `/chat?error=forbidden`.

## Sitemap allowlist
- `app/sitemap.ts` includes only public routes.
- Private app routes are intentionally excluded.

## Robots policy
- `public/robots.txt` disallows private prefixes.
- `public/robots.txt` references canonical sitemap URL:
  - `https://www.ggvibe-chatgpt-ai.org/sitemap.xml`
- Private layout sets `robots: { index: false, follow: false }`.

## Canonical domain policy
- Canonical host: `https://www.ggvibe-chatgpt-ai.org`.
- Middleware redirects apex/non-www/vercel.app hosts to canonical `www` with `308` in production.
- Middleware bypasses: `/api/**`, `/mcp/**`, `/.well-known/**`.

## Required Vercel environment variables
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `EMAIL_SERVER`
- `EMAIL_FROM`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (or split admin vars)
- `ADMIN_EMAILS`

## Health checks
- `GET /api/health` returns env readiness status and missing env names.
- `GET /api/auth/health` returns auth checks and status.
- `GET /mcp/health` returns MCP readiness and missing env names.

## Runtime version pin
- Use Node.js `20.x` in Vercel project settings (and package engines).

## Marketplace entitlements (no payment provider code)
- Marketplace is locked by Firestore `users/{uid}` entitlement fields: `plan`, `planStatus`, `planExpiresAt`.
- Access granted only when `planStatus=active` and `plan` is `MONTHLY` or `ANNUAL`.
- Stripe and Paystack integrations are intentionally not present in this repo.
