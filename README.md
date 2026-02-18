# GGVIBE-LIVE-AI
Production repo for https://www.ggvibe-chatgpt-ai.org.

## Local development
- Node.js: `20.x`
- App directory: `ggvibe/`

```bash
cd ggvibe
npm ci
npm run dev
```

## Verification
```bash
cd ggvibe
npm run build
npm run verify
npm run e2e
```

## Auth methods
- Google OAuth (NextAuth)
- GitHub OAuth (NextAuth)
- Email magic link (NextAuth)
- Phone OTP (Firebase Auth)

## Vercel deployment
- Root Directory: `ggvibe`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `.next`

Environment variable names (no secrets in repo):
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `EMAIL_SERVER`
- `EMAIL_FROM`
- `NEXTAUTH_ENABLE_EMAIL=true` (only when EmailProvider adapter is configured)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `UPSTASH_REDIS_KV_REST_API_URL`
- `UPSTASH_REDIS_KV_REST_API_TOKEN`

See `ggvibe/DEPLOY.md` for full runbook.


Google OAuth callback checklist:
- Authorized JavaScript origins:
  - `https://www.ggvibe-chatgpt-ai.org`
  - `https://ggvibe-chatgpt-ai.org`
- Authorized redirect URIs:
  - `https://www.ggvibe-chatgpt-ai.org/api/auth/callback/google`
  - `https://ggvibe-chatgpt-ai.org/api/auth/callback/google`
- `NEXTAUTH_URL` must be `https://www.ggvibe-chatgpt-ai.org`.
