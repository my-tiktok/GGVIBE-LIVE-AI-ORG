# Auth Migration Log — 2026-02-15

## Scope
- Removed Replit auth flow usage from runtime code.
- Migrated auth initiation to NextAuth sign-in routes/providers.
- Added premium login UI variants A/B/C and Firebase phone OTP panel.
- Fixed auth verify contract to ensure no `/api/login` 405.

## Implemented auth methods
1. Google OAuth (NextAuth)
2. GitHub OAuth (NextAuth)
3. Email Magic Link (NextAuth Email provider)
4. Phone Number OTP (Firebase Auth client flow)

## Key notes
- `/api/login` now deterministic redirect wrapper to `/api/auth/signin` for GET+POST.
- `/api/auth/user` uses `getServerSession` from NextAuth and returns 401 if unauthenticated.
- Canonical URL logic now prioritizes `NEXTAUTH_URL` and defaults to `https://www.ggvibe-chatgpt-ai.org`.
- `npm run verify` checks:
  - `/api/auth/signin` reachable
  - `/api/auth/user` unauthenticated => 401
  - `/api/login` is non-405

## Outstanding manual deployment checks
- Configure real OAuth provider credentials and email SMTP transport in Vercel env.
- Configure Firebase web config env vars for phone auth.
- Validate canonical domain and OAuth callback URLs in provider consoles.
