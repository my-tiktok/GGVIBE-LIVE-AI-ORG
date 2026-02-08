# GGVIBE LIVE AI — Operations Runbook

## Deploy Configuration

| Setting | Value |
|---------|-------|
| Root directory | `ggvibe` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm run start` |
| Deployment target | autoscale |
| Production domain | `https://ggvibe-chatgpt-ai.org` |
| Port | `${PORT:-5000}` (dynamic with fallback) |
| Host binding | `0.0.0.0` |

## Required Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `REPL_ID` | Yes | Auto-provided by Replit |
| `DATABASE_URL` | Yes | Auto-provided by Replit PostgreSQL |
| `SESSION_SECRET` | Yes* | At least 32 characters. Fallback: `NEXTAUTH_SECRET` |
| `OPENAI_API_KEY` | For chat | Required for chat functionality |
| `ISSUER_URL` | No | Defaults to `https://replit.com/oidc` |

*Either `SESSION_SECRET` or `NEXTAUTH_SECRET` must be set.

## Verification Commands

### Domain Verification (OpenAI)

```bash
curl -i https://ggvibe-chatgpt-ai.org/.well-known/openai-apps-challenge
```

Expected:
- HTTP 200
- Body: `neoIMNB3-IRXIZZijFujbAlUlaB33p6M29EfuBhfqow` (token only, no HTML/JSON wrapper)
- Content-Type: `text/plain`

### MCP Endpoints

```bash
curl -i https://ggvibe-chatgpt-ai.org/mcp
curl -i https://ggvibe-chatgpt-ai.org/mcp/health
curl -i https://ggvibe-chatgpt-ai.org/mcp/version
```

Expected for all three:
- HTTP 200
- Content-Type: `application/json`
- Valid JSON body with `requestId` field

### CORS / Scanner Compatibility

```bash
# No-Origin request (scanner mode)
curl -i -H "Accept: application/json" https://ggvibe-chatgpt-ai.org/mcp

# OPTIONS preflight
curl -i -X OPTIONS https://ggvibe-chatgpt-ai.org/mcp
```

Expected: HTTP 200 (GET) / HTTP 204 (OPTIONS)

## Auth / OIDC Configuration

### Redirect URIs

The following URI must be whitelisted in the Replit OIDC provider:

```
https://ggvibe-chatgpt-ai.org/api/callback
```

### Auth Flow

1. User visits `/api/login`
2. Server redirects to Replit OIDC with PKCE
3. Replit authenticates and redirects to `/api/callback`
4. Server exchanges code for tokens, creates session
5. User redirected to `/auth/success`

### Canonical Host Enforcement

In production, login and callback routes enforce the canonical host (`ggvibe-chatgpt-ai.org`). Requests arriving on non-canonical hosts (e.g., `*.replit.app`) are redirected to the canonical domain before OAuth flow begins.

## Troubleshooting

### Domain Verification Fails

1. Check the file exists: `cat ggvibe/public/.well-known/openai-apps-challenge`
2. Verify content is token-only (no JSON, no quotes, no trailing newline)
3. Check middleware.ts matcher excludes `.well-known`: look for `(?!\\.well-known` in the matcher regex
4. Check next.config.mjs has no redirects/rewrites touching `/.well-known`
5. If CDN is caching an old build, redeploy and wait for propagation

### MCP Scanner Fails

1. Verify all three endpoints return JSON: `curl -s https://ggvibe-chatgpt-ai.org/mcp | python3 -m json.tool`
2. Check /mcp/health returns 200 (not 503): it always returns 200 with status field in body
3. Check CORS allows no-Origin requests (scanner sends requests without Origin header)
4. Verify rate limiting isn't blocking: 30 req/min for /mcp, 60 req/min for /mcp/version

### Port Conflicts

- Production: uses `$PORT` env var (Replit sets this automatically)
- Development: defaults to port 5000
- Only the frontend server should bind to port 5000

### Stale Build Cache

If you see `MODULE_NOT_FOUND` or `pages-manifest.json` errors:

```bash
cd ggvibe
rm -rf .next
npm run build
npm run start
```

### Missing Environment Variables

- `/mcp/health` reports missing vars in the `missingEnv` array but always returns HTTP 200
- Session module accepts either `SESSION_SECRET` or `NEXTAUTH_SECRET`
- `REPL_ID` is auto-set by Replit; if missing, OIDC login will fail
- `DATABASE_URL` is auto-set by Replit PostgreSQL addon

### Auth Login Returns "invalid_redirect_uri"

1. Verify `REPL_ID` is set (used as OIDC client_id)
2. Confirm the callback URL is `https://ggvibe-chatgpt-ai.org/api/callback`
3. Ensure the Replit app's OIDC configuration includes this redirect URI
4. Check for HTTP vs HTTPS mismatch or trailing slash differences
