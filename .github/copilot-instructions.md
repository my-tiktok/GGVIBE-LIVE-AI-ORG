# Copilot & Agent Development Guidelines

## NON-NEGOTIABLE CONSTRAINTS

All future agent work must preserve these constraints. Violations will cause production failures.

### 1. App Root & Structure
- **MUST**: App root is `/ggvibe` (Next.js application). Never treat repo root as primary app.
- **MUST**: `/ggvibe` is the only Node.js/Next.js application in this repo.
- **MUST**: Root `package.json` exists and delegates commands to `/ggvibe` (cd ggvibe && npm run ...).

### 2. Protected Paths - NO Interception
The following paths **MUST** be served directly, with NO rewrites, redirects, or middleware interception:
- `/.well-known/*` (all well-known URIs)
- `/api/health` (health check endpoint)
- `/mcp` (Model Context Protocol discovery)
- `/.well-known/openai-apps-challenge` (MUST be file-backed, plain text, no JSON)

**Why**: 
- File-backed routes avoid 404s across different domains (canonical + Replit).
- Rewrites can cause redirect loops in OAuth/OIDC flows.
- Middleware interception breaks OpenAI App Builder verification.

### 3. File-Backed Challenge Token
- **MUST**: Create `/ggvibe/public/.well-known/openai-apps-challenge`
- **MUST**: Content is plain text token only (no JSON, no HTML, no whitespace decoration)
- **MUST**: Served with `Content-Type: text/plain`
- **MUST**: HTTP 200 response code
- **NEVER**: Use rewrites or API handlers for this path

### 4. Static Hosting
- `/public` directory files are served directly by Next.js static handler
- This applies to files in `/public/.well-known/*` and all other public assets
- No configuration needed; Next.js serves these automatically

### 5. Authentication & Cookies
- **MUST**: No explicit `SESSION_COOKIE_DOMAIN` set in production (host-only cookies)
- **MUST**: Cookies must be `HttpOnly`, `Secure` (in production), and `SameSite=Strict`
- **NO**MUST**: OAuth login must not cause `ERR_TOO_MANY_REDIRECTS` across domains
- **MUST**: Canonical domain is `https://ggvibe-chatgpt-ai.org`
- **MUST**: Replit deployments use `*.replit.app` or `*.replit.dev`
- **MUST**: Login redirect to canonical host in production (see `/api/login`)

Rationale: 
- Host-only cookies prevent cross-domain cookie sharing issues
- Explicit domain cookies can cause login redirect loops when accessed from different subdomains

### 6. Build & Runtime Compatibility
- **MUST**: Build succeeds on Replit Core using Node 20+
- **MUST**: Scripts respect `$PORT` environment variable (default: 5000)
- **MUST**: Dev/start/build scripts use both `-p $PORT` and `-H 0.0.0.0` (Replit requirements)
- **MUST**: Use Next.js App Router only (no pages/ directory hacks)
- Example: `"start": "next start -p ${PORT:-5000} -H 0.0.0.0"`

### 7. Endpoint Contracts

#### `/api/health` (GET)
```json
{
  "status": "healthy|error",
  "timestamp": "2024-02-06T...",
  "authenticated": boolean,
  "appUrlConfigured": boolean,
  "sessionSecretConfigured": boolean,
  "canonicalUrl": "https://ggvibe-chatgpt-ai.org"
}
```

#### `/mcp` (GET)
```json
{
  "name": "GGVIBE Chatbot",
  "version": "1.0.0",
  "description": "...",
  "baseUrl": "https://ggvibe-chatgpt-ai.org",
  "endpoints": [
    {
      "name": "Chat Stream",
      "method": "STREAM",
      "path": "/api/v1/chat/stream",
      "description": "...",
      "authentication": "Firebase ID Token"
    }
  ],
  "timestamp": "2024-02-06T..."
}
```

#### `/.well-known/openai-apps-challenge` (GET)
- **Content**: Plain text token (no JSON wrapper)
- **Content-Type**: `text/plain`
- **Status**: 200
- **Example**: File contains: `ggvibe_chatgpt_openai_challenge_token_20240206`

#### `/api/v1/chat/stream` (POST)
- **Requires**: `Authorization: Bearer <firebase-token>` header
- **Response**: Server-Sent Events (SSE) stream
- **401**: Missing or invalid token
- **429**: Rate limited (>100 requests per 60s per IP)
- **413**: Request body >10KB
- **Format**: `data: {JSON}\n\n`

### 8. Middleware Configuration
- **MUST**: Middleware exists at `/ggvibe/middleware.ts`
- **MUST**: Config matcher excludes protected paths:
  ```typescript
  matcher: [
    '/((?!\\.well-known|mcp|api/health|api/healthz|public|_next|static).*)',
  ]
  ```
- **NEVER**: Add rewrites or redirects in next.config.mjs for protected paths

### 9. Environment Variables
**Required**:
- `SESSION_SECRET` (min 32 chars for session encryption)
- `DATABASE_URL` (PostgreSQL connection string)
- `REPL_ID` (OAuth client ID)

**Recommended**:
- `NEXT_PUBLIC_APP_URL` (canonical domain for OAuth & URLs)
- `OPENAI_API_KEY` (for chat completions)

**Optional**:
- `CHAT_MOCK_RESPONSE` (set to "true" for testing)
- `NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME` (mobile app deep links)

### 10. Configuration Files
- **MUST**: `ggvibe/next.config.mjs` contains ONLY `headers()` export (NO rewrites)
- **MUST**: `ggvibe/tsconfig.json` is valid and uses `@` alias for imports
- **MUST**: `ggvibe/package.json` has `"engines": { "node": ">=20" }`
- **MUST**: Root `package.json` delegates to `/ggvibe` tasks

### 11. Simplicity & Production Safety
- **PREFER**: Deletion over adding complexity
- **PREFER**: File-backed routes over API handlers for static content
- **PREFER**: Defensive coding over feature completeness
- **NEVER**: Hardcode domain names or port numbers (use env vars)
- **NEVER**: Log secrets (tokens, API keys, passwords)
- **ALWAYS**: Validate & sanitize inputs
- **ALWAYS**: Use `no-cache` headers on dynamic endpoints

### 12. Testing & Verification
- **MUST**: Run CI smoke tests on every PR
- **MUST**: Verify:
  1. Build succeeds
  2. Health endpoint returns expected fields
  3. MCP endpoint returns expected structure
  4. Challenge endpoint returns plain text token
  5. Chat stream endpoint requires auth (401 without token)
  6. No rewrites intercept protected paths
- **MUST**: All tests in `.github/workflows/smoke-test.yml` pass

### 13. Documentation
- **MUST**: Update docs when changing routes or config
- **MUST**: Create `OPENAI_APP_BUILDER_CHECKLIST.md` with:
  - Requirements checklist
  - curl commands for verification (local + production)
  - Example responses
- **MUST**: Include comments in code for non-obvious logic

## When Making Changes

### Checklist
- [ ] No rewrites/redirects in `next.config.mjs`
- [ ] Protected paths still accessible (no 404)
- [ ] Env vars properly validated
- [ ] Cookies properly configured (no explicit domain in prod)
- [ ] Auth flow doesn't cause redirect loops
- [ ] All CI tests pass
- [ ] Docs updated if behavior changed
- [ ] No hardcoded domains or ports

### Testing Locally
```bash
cd ggvibe

# Build
npm run build

# Start with custom port
PORT=3000 npm start

# Test endpoints
curl http://localhost:3000/.well-known/openai-apps-challenge
curl http://localhost:3000/api/health
curl http://localhost:3000/mcp
curl -X POST -H "Authorization: Bearer test" http://localhost:3000/api/v1/chat/stream
```

### Testing on Replit
1. Push to main branch
2. CI workflow runs automatically
3. All tests must pass before merge
4. Verify on live Replit domain after merge

## Common Mistakes to Avoid

1. **Rewrite for .well-known**: Use file-backed only
2. **Explicit SESSION_COOKIE_DOMAIN in production**: This breaks OAuth
3. **Hardcoded domain/port**: Must use env vars or derived from request
4. **API handler for static content**: Use /public files instead
5. **No test coverage**: Always run CI before merging
6. **Ignoring middleware matcher**: Ensure protected paths are excluded
7. **Not respecting PORT env var**: Replit needs dynamic port binding

## References
- Next.js App Router: https://nextjs.org/docs/app
- OpenAI Apps: https://platform.openai.com/docs/plugins
- Replit Deployment: https://docs.replit.com/
