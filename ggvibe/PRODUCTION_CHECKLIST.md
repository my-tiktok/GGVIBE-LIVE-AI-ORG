# Production Checklist

## Route model
- Public/indexable: `/`, `/login`, `/privacy`, `/terms`.
- Private/non-indexable: `/chat`, `/wallet`, `/transactions`, `/seller/*`, `/admin`.

## Auth guard behavior
- Middleware redirects unauthenticated private-route traffic to `/login?next=...`.
- Private App Router layout server-checks session/cookie and redirects to `/login` if missing.
- Admin page uses `ADMIN_EMAILS` allowlist and returns authenticated non-admin view (not 404).

## Sitemap allowlist
- `app/sitemap.ts` uses explicit public-route allowlist.
- Private routes are excluded from sitemap generation.

## Robots policy
- `public/robots.txt` publishes canonical sitemap and disallows private route prefixes.
- Private app layout sets `robots: { index: false, follow: false }`.

## Canonical domain policy
- Canonical host: `https://www.ggvibe-chatgpt-ai.org`.
- Middleware enforces non-www/apex/vercel.app → `www` redirect with `308` in production.
- Exclusions/bypass: `/api/**`, `/mcp/**`, `/.well-known/**`.

## Key environment variables
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `SESSION_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `EMAIL_SERVER`, `EMAIL_FROM`
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (or split admin vars)
- `ADMIN_EMAILS`
- `OPENAI_APPS_CHALLENGE_TOKEN`
