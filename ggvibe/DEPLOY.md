# GGVIBE deployment (Vercel + Firebase + NextAuth)

## Vercel project settings
- Root Directory: `ggvibe`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `.next`

## Canonical domain
- Production canonical host: `https://www.ggvibe-chatgpt-ai.org`
- Configure apex (`ggvibe-chatgpt-ai.org`) and `*.vercel.app` to redirect `308` to `www`.

## Required environment variables

### Core
- `NEXT_PUBLIC_APP_URL=https://www.ggvibe-chatgpt-ai.org`
- `NEXTAUTH_URL=https://www.ggvibe-chatgpt-ai.org`
- `NEXTAUTH_SECRET` (32+ chars)

### NextAuth providers
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `EMAIL_SERVER`
- `EMAIL_FROM`
- `NEXTAUTH_ENABLE_EMAIL=true` (enable NextAuth EmailProvider only when adapter-backed email sign-in is configured)

### Firebase (phone OTP + server verification)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (or split admin vars)

### Rate limiter backend
- `UPSTASH_REDIS_KV_REST_API_URL`
- `UPSTASH_REDIS_KV_REST_API_TOKEN`
- Back-compat fallback: `KV_REST_API_URL` / `KV_REST_API_TOKEN`

## Auth methods enabled
1. Google OAuth (NextAuth)
2. GitHub OAuth (NextAuth)
3. Email magic link (NextAuth)
4. Phone OTP (Firebase client auth + `/api/login` session exchange)

Replit auth is not used.

## Verification curl commands
```bash
curl -i https://www.ggvibe-chatgpt-ai.org/api/auth/signin
curl -i https://www.ggvibe-chatgpt-ai.org/api/auth/signin/google
curl -i https://www.ggvibe-chatgpt-ai.org/api/auth/signin/github
curl -i https://www.ggvibe-chatgpt-ai.org/api/auth/user
curl -i https://www.ggvibe-chatgpt-ai.org/api/login
```

## Clearing limiter keys safely
Use key prefix deletes only:
- `login-fail:*`
- `ratelimit:*`

Never flush full production Redis DB.

### Google OAuth setup (to avoid redirect_uri_mismatch)
- Authorized JavaScript origins:
  - `https://www.ggvibe-chatgpt-ai.org`
  - `https://ggvibe-chatgpt-ai.org`
- Authorized redirect URIs:
  - `https://www.ggvibe-chatgpt-ai.org/api/auth/callback/google`
  - `https://ggvibe-chatgpt-ai.org/api/auth/callback/google`
- Environment variables:
  - `NEXTAUTH_URL=https://www.ggvibe-chatgpt-ai.org`
  - `NEXTAUTH_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
