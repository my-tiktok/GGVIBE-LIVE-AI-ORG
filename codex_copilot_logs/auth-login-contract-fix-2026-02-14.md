# Auth Login Contract Fix — 2026-02-14

## Root cause
- UI login handler used client-side redirect only (`window.location.href = "/api/login"`) and surfaced generic errors, while backend contract robustness for POST initiation and canonical URL derivation across host variants was incomplete.
- Exact UI entrypoint path: `ggvibe/app/login/page.tsx` (`handleLogin`) and shared hook entrypoint `ggvibe/hooks/use-auth.ts`.

## What was fixed
1. Added deterministic login initiation contract in `app/api/login/route.ts`:
   - supports **GET + POST**
   - supports JSON initiation mode (`/api/login?format=json`) returning `{ authorizationUrl }`
   - keeps redirect mode returning `307 + Location`
2. Hardened callback/canonical URL derivation:
   - `getCanonicalUrl(request)` and `getCallbackUrl(request)` now use request context when canonical env is absent.
   - callback route now derives canonical/callback URLs from request.
3. Improved UI error reporting for initiation failures:
   - login page now POSTs to `/api/login?format=json`
   - displays explicit status + reason if initiation fails.
4. Added deterministic auth verification script:
   - `scripts/verify-auth-contract.sh`
   - checks `POST /api/login` => `302/307 + Location`
   - checks unauthenticated `GET /api/auth/user` => `401`
   - wired to `npm run verify`

## Validation
- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run verify`

All commands passed locally in this container.
