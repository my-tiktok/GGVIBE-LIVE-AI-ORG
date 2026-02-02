# Authentication & Session Lifecycle

## Overview

GGVIBE LIVE AI uses Replit OAuth (OpenID Connect) with iron-session for secure authentication.

## Flow Diagram (Web)

```
User clicks "Sign In"
        │
        ▼
GET /api/login
        │
        ├─► Generate PKCE code_verifier + code_challenge
        ├─► Generate random state
        ├─► Store code_verifier and state in httpOnly cookies
        │
        ▼
Redirect to Replit OAuth
https://replit.com/oidc/auth?
  client_id=REPL_ID
  redirect_uri=.../api/callback
  code_challenge=...
  state=...
        │
        ▼
User authenticates on Replit
        │
        ▼
GET /api/callback?code=...&state=...
        │
        ├─► Validate state matches cookie
        ├─► Exchange code for tokens (with code_verifier)
        ├─► Extract claims from ID token
        ├─► Upsert user in database
        ├─► Create iron-session with user data
        ├─► Clear OAuth cookies
        │
        ▼
Redirect to /auth/success
        │
        ▼
Auto-redirect to home (or deep-link for mobile)
```

## Mobile Flow (System Browser OAuth)

For mobile apps using a system browser for OAuth:

```
Mobile App opens system browser
        │
        ▼
GET /api/login (in system browser)
        │
        ▼
... OAuth flow as above ...
        │
        ▼
Redirect to /auth/success
        │
        ├─► Display "Login Successful" message
        ├─► If NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME set:
        │   ├─► Show countdown (2 seconds)
        │   ├─► Auto-redirect to ${scheme}/success
        │   └─► Show manual "Return to App" button
        │
        └─► If no deep-link scheme:
            └─► Redirect to home page
```

### Mobile Deep Link Configuration

Set the environment variable:
```
NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME=ggvibe://
```

### Deep Link URLs

| Scenario | URL |
|----------|-----|
| Success | `${scheme}/success` |
| Error | `${scheme}/error?code=${errorCode}` |

### Error Handling (Mobile)

The `/login` page handles errors with:
1. Display user-friendly error message
2. "Try Again" button to restart OAuth
3. "Return to App" button → deep-link with error code

## Session Storage

Sessions are stored in encrypted httpOnly cookies using iron-session:

```typescript
interface SessionData {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  accessToken?: string;
  expiresAt?: number;
  isLoggedIn: boolean;
}
```

## Cookie Configuration

| Cookie | HttpOnly | Secure | SameSite | Path | MaxAge |
|--------|----------|--------|----------|------|--------|
| `ggvibe_session` | Yes | Prod only | lax | / | 7 days |
| `code_verifier` | Yes | Prod only | lax | / | 10 min |
| `oauth_state` | Yes | Prod only | lax | / | 10 min |

**Cookie Scoping:** Host-only cookies (no domain attribute) for security.

## API Endpoints

### GET /api/login
Initiates OAuth flow. Redirects to Replit.

### GET /api/callback
Handles OAuth callback. Exchanges code for tokens and creates session.

### GET /api/logout
Destroys session and redirects to Replit logout.

### GET /api/auth/user (legacy)
Returns current authenticated user or 401.

### GET /api/v1/auth/user (stable)
Returns current authenticated user or 401 with standard error format.

### GET /api/auth/health (legacy)
Returns authentication system health status.

### GET /api/v1/health (stable)
Returns system health with version and requestId.

## Pages

### /login
Login page with error handling. Reads `?error=` param and displays message.

### /auth/success
Post-login success page. Auto-redirects to home or mobile deep-link.

## Error Handling

OAuth errors redirect to `/login?error=`:

| Error Code | Meaning |
|------------|---------|
| `login_failed` | OAuth initiation failed |
| `provider_error` | Provider returned error |
| `invalid_callback` | Invalid/missing callback params, state mismatch, invalid_grant |
| `invalid_claims` | Token claims invalid |
| `auth_failed` | Token exchange failed |

**Note:** `invalid_grant` errors (expired codes, reused codes) are mapped to `invalid_callback` for user-friendly messaging.

## Security Considerations

1. **PKCE** - Prevents authorization code interception
2. **State** - Prevents CSRF attacks
3. **HttpOnly cookies** - Prevents XSS access to session
4. **Secure cookies** - HTTPS only in production
5. **SameSite=lax** - Prevents CSRF while allowing top-level navigation
6. **Host-only cookies** - No cross-subdomain leakage
7. **No stack traces** - Errors logged server-side only
8. **RequestId** - Every request has unique ID for debugging

## Base URL Resolution

Priority order for determining base URL:
1. `NEXT_PUBLIC_APP_URL` (canonical, recommended for production)
2. `REPLIT_DEPLOYMENT_URL` (auto-set by Replit Deployments)
3. x-forwarded headers (production only, if safe)
4. `NEXTAUTH_URL` (legacy fallback)
5. Request URL
6. `localhost:${PORT}`

## Environment Validation

On startup, the app validates:
- Required: `SESSION_SECRET`, `DATABASE_URL`, `REPL_ID`
- Warnings if: No `NEXT_PUBLIC_APP_URL` or `REPLIT_DEPLOYMENT_URL`, no `OPENAI_API_KEY`
