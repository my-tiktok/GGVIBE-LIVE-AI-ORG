# Replit Deployments Runbook - GGVIBE LIVE AI

## Production Incident: Login Not Persisting

### Root Cause
Domain mixing between `ggvibe-chatgpt-ai.org` (canonical) and `*.replit.app` (secondary) caused:
1. OAuth redirect_uri built from wrong domain
2. Session cookies set on wrong host
3. Cookies not sent back on canonical domain requests

### Fix Summary
1. **Canonical URL enforcement** - Login and callback routes now ALWAYS redirect to canonical domain before proceeding
2. **Host-only cookies** - No Domain attribute set (cookies only valid for exact host)
3. **Frontend cache-busting** - Auth hook uses `cache: 'no-store'` to prevent stale auth state

---

## Replit Secrets Configuration

Go to: **Replit → Tools → Secrets**

### Required Secrets

| Secret Name | Value | Notes |
|------------|-------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://ggvibe-chatgpt-ai.org` | **No trailing slash!** This is the canonical URL |
| `SESSION_SECRET` | `<random 32+ char string>` | Generate with: `openssl rand -base64 32` |
| `DATABASE_URL` | `<postgres connection string>` | Auto-provided if using Replit Postgres |
| `REPL_ID` | `<your-repl-id>` | Auto-provided by Replit |
| `OPENAI_API_KEY` | `<your-openai-key>` | For AI chat features |

### Secrets to DELETE (if present)

| Secret Name | Reason |
|------------|--------|
| `SESSION_COOKIE_DOMAIN` | **DELETE THIS** - Causes cross-domain cookie issues. Host-only cookies work correctly. |

---

## Replit Auth Configuration

Go to: **Replit → Tools → Auth → Configure**

### Authorized Origins
```
https://ggvibe-chatgpt-ai.org
https://ggvibe-live-ai-1.replit.app
```

### Authorized Redirect URIs
```
https://ggvibe-chatgpt-ai.org/api/callback
https://ggvibe-live-ai-1.replit.app/api/callback
```

**Important:** Do NOT include preview URLs (like `https://*.repl.co`)

---

## Deployment Steps

1. **Set all secrets** (see table above)
2. **Delete SESSION_COOKIE_DOMAIN** if it exists
3. **Configure Replit Auth** with origins and redirect URIs above
4. **Click "Deploy"** → Select "Autoscale"
5. **Wait for deployment** to complete (green checkmark)
6. **Clear browser cookies** for both domains:
   - `ggvibe-chatgpt-ai.org`
   - `ggvibe-live-ai-1.replit.app`
7. **Test login flow** (see verification below)

---

## Verification Commands

### Health Check
```bash
curl -s https://ggvibe-chatgpt-ai.org/api/v1/health | jq
```

Expected:
```json
{
  "status": "healthy",
  "version": "v1",
  "requestId": "req_...",
  "checks": {
    "session_secret": true,
    "database_url": true,
    "repl_id": true,
    "openai_api_key": true
  },
  "timestamp": "2026-..."
}
```

### Unauthenticated User Check
```bash
curl -s https://ggvibe-chatgpt-ai.org/api/auth/user | jq
```

Expected:
```json
{
  "authenticated": false,
  "error": "unauthorized",
  "requestId": "req_..."
}
```

### Login Flow Test
```bash
# Check login redirects to Replit
curl -sI https://ggvibe-chatgpt-ai.org/api/login | grep -E "^(HTTP|Location)"
```

Expected:
```
HTTP/2 307
Location: https://replit.com/oidc/auth?client_id=...&redirect_uri=https%3A%2F%2Fggvibe-chatgpt-ai.org%2Fapi%2Fcallback...
```

### Authenticated User Check (after login in browser)
```bash
# Copy the ggvibe_session cookie from browser DevTools
curl -s https://ggvibe-chatgpt-ai.org/api/auth/user \
  -H "Cookie: ggvibe_session=<your-cookie-value>" | jq
```

Expected:
```json
{
  "authenticated": true,
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "..."
  },
  "requestId": "req_..."
}
```

---

## Browser Testing

1. Open https://ggvibe-chatgpt-ai.org in incognito/private window
2. Open DevTools → Network tab
3. Click "Sign in with Replit"
4. Complete Replit auth
5. Verify redirect back to https://ggvibe-chatgpt-ai.org/auth/success
6. Check DevTools → Application → Cookies:
   - `ggvibe_session` cookie should exist for `ggvibe-chatgpt-ai.org`
   - Domain should be empty (host-only) or exactly `ggvibe-chatgpt-ai.org`
7. Navigate to homepage - UI should show authenticated state

---

## Troubleshooting

### "invalid_callback" error after login
- **Cause:** Cookies set on wrong domain, or SESSION_COOKIE_DOMAIN misconfigured
- **Fix:** Delete SESSION_COOKIE_DOMAIN, clear all cookies, redeploy

### Login succeeds but /api/auth/user returns unauthorized
- **Cause:** Session cookie not being sent (wrong domain)
- **Fix:** Verify NEXT_PUBLIC_APP_URL is exactly `https://ggvibe-chatgpt-ai.org` (no trailing slash)

### Redirect loop between domains
- **Cause:** Missing canonical URL enforcement
- **Fix:** Ensure code forces canonical domain for OAuth flow (this is fixed in current version)

### Cookies not persisting
- **Cause:** Browser blocking third-party cookies, or Secure flag issues
- **Fix:** Ensure site is accessed via HTTPS, check browser cookie settings
