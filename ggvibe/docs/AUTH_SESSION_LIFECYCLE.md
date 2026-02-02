# Authentication & Session Lifecycle

## Overview

GGVIBE LIVE AI uses Replit OAuth (OpenID Connect) with iron-session for secure authentication.

## Flow Diagram

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
Redirect to home (authenticated)
```

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

| Cookie | HttpOnly | Secure | SameSite | MaxAge |
|--------|----------|--------|----------|--------|
| `ggvibe_session` | Yes | Prod only | lax | 7 days |
| `code_verifier` | Yes | Prod only | lax | 10 min |
| `oauth_state` | Yes | Prod only | lax | 10 min |

## API Endpoints

### GET /api/login
Initiates OAuth flow. Redirects to Replit.

### GET /api/callback
Handles OAuth callback. Exchanges code for tokens and creates session.

### GET /api/logout
Destroys session and redirects to Replit logout.

### GET /api/auth/user
Returns current authenticated user or 401.

### GET /api/auth/health
Returns authentication system health status.

## Error Handling

All OAuth errors redirect to home with error query param:
- `/?error=login_failed` - OAuth initiation failed
- `/?error=provider_error` - Provider returned error
- `/?error=invalid_callback` - Invalid or missing callback params
- `/?error=invalid_claims` - Token claims invalid
- `/?error=auth_failed` - Token exchange failed

## Security Considerations

1. **PKCE** - Prevents authorization code interception
2. **State** - Prevents CSRF attacks
3. **HttpOnly cookies** - Prevents XSS access to session
4. **Secure cookies** - HTTPS only in production
5. **SameSite=lax** - Prevents CSRF while allowing top-level navigation
