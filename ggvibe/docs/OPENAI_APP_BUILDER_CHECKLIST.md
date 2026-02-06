# OpenAI App Builder Compliance Checklist

## Overview
This document provides step-by-step verification that GGVIBE meets all OpenAI App Builder requirements for integration with ChatGPT.

## Requirements Checklist

### 1. Domain Verification Challenge
- [x] Endpoint: `/.well-known/openai-apps-challenge`
- [x] HTTP Method: GET
- [x] Response Code: 200 OK
- [x] Content-Type: `text/plain`
- [x] Body: Plain text token (no JSON, no HTML, no extra whitespace)
- [x] File-backed: Located at `/public/.well-known/openai-apps-challenge`
- [x] No rewrites/redirects used

**Why file-backed**: Static file serving ensures compatibility across all domain variations (canonical domain, Replit preview, etc.) without risk of redirect loops or configuration errors.

### 2. Health / Status Endpoint  
- [x] Endpoint: `/api/health`
- [x] HTTP Method: GET
- [x] Response Code: 200 OK
- [x] Content-Type: `application/json`
- [x] Required Fields:
  - `status` ("healthy" | "error")
  - `timestamp` (ISO 8601)
  - `authenticated` (boolean)
  - `appUrlConfigured` (boolean)
  - `sessionSecretConfigured` (boolean)
  - `canonicalUrl` (string)

### 3. Model Context Protocol (MCP) Discovery
- [x] Endpoint: `/mcp`
- [x] HTTP Method: GET
- [x] Response Code: 200 OK
- [x] Content-Type: `application/json`
- [x] Required Fields:
  - `name` (string): "GGVIBE Chatbot"
  - `version` (string): "1.0.0"
  - `description` (string)
  - `baseUrl` (string): Canonical URL
  - `endpoints` (array of endpoint objects)
  - `timestamp` (ISO 8601)
- [x] Endpoint Structure:
  - `name` (string)
  - `method` ("GET" | "POST" | "STREAM")
  - `path` (string)
  - `description` (string)
  - `authentication` (string, optional): Description of auth mechanism

### 4. Chat Streaming Endpoint
- [x] Endpoint: `/api/v1/chat/stream`
- [x] HTTP Method: POST
- [x] Request Header: `Authorization: Bearer <firebase-token>`
- [x] Response Type: Server-Sent Events (SSE)
- [x] Response Code: 200 (with streaming) / 401 (no auth)
- [x] Error Handling:
  - 401: Missing or invalid token
  - 429: Rate limited
  - 413: Request body too large
  - 500: Internal server error
- [x] SSE Format: `data: {JSON}\n\n`
- [x] Rate Limiting: 100 requests per 60 seconds per IP
- [x] Request Size Limit: 10KB max body size

### 5. Authentication & Security
- [x] Session Cookies:
  - HttpOnly: Yes (production)
  - Secure: Yes (production)
  - SameSite: Strict
  - Domain: Host-only (no explicit domain in production)
- [x] HTTPS: Required in production (https://ggvibe-chatgpt-ai.org)
- [x] CORS: Properly configured for OpenAI domain
- [x] Token Validation: Firebase ID tokens verified server-side
- [x] No Exposed Secrets: API keys, passwords never logged or exposed

### 6. Configuration & Environment
- [x] Node.js Version: 20+
- [x] Next.js Version: 15.5.11 (App Router)
- [x] Build System: Next.js build (npm run build)
- [x] Start Command: `next start -p ${PORT:-5000} -H 0.0.0.0`
- [x] Environment Variables Configured:
  - SESSION_SECRET (required)
  - DATABASE_URL (required)
  - REPL_ID (required)
  - NEXT_PUBLIC_APP_URL (recommended)
  - OPENAI_API_KEY (recommended)

### 7. Deployment & Replit Compatibility
- [x] Replit Core Support: Builds with Node 20+
- [x] Port Configuration: Respects `$PORT` env var
- [x] Host Binding: Binds to `0.0.0.0` (required for Replit)
- [x] Canonical Domain: https://ggvibe-chatgpt-ai.org
- [x] OAuth Redirects: No redirect loops across canonical + Replit domains

### 8. Documentation
- [x] README with setup instructions
- [x] API documentation (this checklist + copilot-instructions.md)
- [x] Environment variable examples (.env.example)
- [x] Deployment guide (REPLIT_DEPLOY_RUNBOOK.md)
- [x] CI test verification (smoke-test.yml)

## Verification Commands

### Local Testing (development)
```bash
cd ggvibe
npm install
npm run build
PORT=3000 npm start &
sleep 3

# Test challenge endpoint
echo "=== Test 1: Challenge Endpoint ==="
curl -v http://localhost:3000/.well-known/openai-apps-challenge
echo ""
echo ""

# Test health endpoint
echo "=== Test 2: Health Endpoint ==="
curl -s http://localhost:3000/api/health | jq .
echo ""

# Test MCP endpoint
echo "=== Test 3: MCP Discovery ==="
curl -s http://localhost:3000/mcp | jq .
echo ""

# Test chat stream - unauthorized
echo "=== Test 4: Chat Stream (Unauthorized) ==="
curl -w "\nHTTP Status: %{http_code}\n" -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' \
  http://localhost:3000/api/v1/chat/stream
echo ""

# Test chat stream - authorized
echo "=== Test 5: Chat Stream (Authorized) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST \
  -H "Authorization: Bearer test-firebase-token-12345" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' \
  http://localhost:3000/api/v1/chat/stream | head -20
echo ""

kill %1 2>/dev/null
wait
```

### Production Testing (after deploy to Replit)
```bash
# Replace YOUR_REPLIT_DOMAIN with actual domain (e.g., ggvibe-live-ai.replit.dev)
DOMAIN="https://YOUR_REPLIT_DOMAIN"

# Test challenge endpoint
echo "=== Test 1: Challenge Endpoint ==="
curl -v "$DOMAIN/.well-known/openai-apps-challenge"
echo ""

# Test health endpoint
echo "=== Test 2: Health Endpoint ==="
curl -s "$DOMAIN/api/health" | jq .
echo ""

# Test MCP endpoint
echo "=== Test 3: MCP Discovery ==="
curl -s "$DOMAIN/mcp" | jq .
echo ""

# Test chat stream - unauthorized
echo "=== Test 4: Chat Stream (Unauthorized) ==="
curl -w "\nHTTP Status: %{http_code}\n" -s -X POST "$DOMAIN/api/v1/chat/stream"
echo ""

# Test chat stream - authorized
echo "=== Test 5: Chat Stream (Authorized) ==="
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  "$DOMAIN/api/v1/chat/stream" | head -20
echo ""
```

### Expected Responses

#### Challenge Endpoint
```
HTTP/1.1 200 OK
Content-Type: text/plain

ggvibe_chatgpt_openai_challenge_token_20240206
```

#### Health Endpoint
```json
{
  "status": "healthy",
  "timestamp": "2024-02-06T15:30:45.123Z",
  "authenticated": false,
  "appUrlConfigured": true,
  "sessionSecretConfigured": true,
  "canonicalUrl": "https://ggvibe-chatgpt-ai.org"
}
```

#### MCP Endpoint
```json
{
  "name": "GGVIBE Chatbot",
  "version": "1.0.0",
  "description": "AI-powered chatbot application for OpenAI ChatGPT integration",
  "baseUrl": "https://ggvibe-chatgpt-ai.org",
  "endpoints": [
    {
      "name": "Health Check",
      "method": "GET",
      "path": "/api/health",
      "description": "Verify service health and configuration status"
    },
    {
      "name": "Chat Stream",
      "method": "STREAM",
      "path": "/api/v1/chat/stream",
      "description": "Server-Sent Events (SSE) streaming endpoint for real-time chat",
      "authentication": "Firebase ID Token (Authorization header)"
    },
    {
      "name": "User Authentication",
      "method": "GET",
      "path": "/api/auth/user",
      "description": "Get current authenticated user",
      "authentication": "Session cookie"
    },
    {
      "name": "Login",
      "method": "GET",
      "path": "/api/login",
      "description": "Initiate OAuth login flow"
    }
  ],
  "timestamp": "2024-02-06T15:30:45.123Z"
}
```

#### Chat Stream - Unauthorized (401)
```json
{
  "error": "unauthorized",
  "message": "Invalid or missing Firebase token",
  "requestId": "req_xyz123"
}
```

#### Chat Stream - Authorized (200)
```
data: {"type":"stream.start","timestamp":"2024-02-06T15:30:45.123Z","requestId":"req_xyz123"}

data: {"type":"stream.message","index":1,"text":"Message chunk 1 ","timestamp":"2024-02-06T15:30:45.323Z"}

data: {"type":"stream.message","index":2,"text":"Message chunk 2 ","timestamp":"2024-02-06T15:30:45.523Z"}

data: {"type":"stream.message","index":3,"text":"Message chunk 3 ","timestamp":"2024-02-06T15:30:45.723Z"}

data: {"type":"stream.complete","totalChunks":4,"timestamp":"2024-02-06T15:30:45.923Z","requestId":"req_xyz123"}
```

## CI Verification
- Smoke tests run on every PR and push to main
- All tests must pass before merge
- Test coverage includes:
  - Build success (Node 20+)
  - Challenge endpoint returns token
  - Health endpoint has required fields
  - MCP endpoint structure validation
  - Chat stream auth validation (401 without token)
  - No rewrites intercept protected paths

## Deployment Checklist
- [ ] All environment variables configured on Replit
- [ ] DATABASE_URL points to production Postgres
- [ ] SESSION_SECRET is strong (min 32 chars, cryptographically random)
- [ ] NEXT_PUBLIC_APP_URL set to https://ggvibe-chatgpt-ai.org
- [ ] OPENAI_API_KEY valid and funded
- [ ] Build succeeds with `npm run build`
- [ ] Start succeeds with `npm start`
- [ ] All verification tests pass
- [ ] Canonical domain resolves and serves app
- [ ] HTTPS certificate valid
- [ ] No console errors in production

## Troubleshooting

### Challenge Endpoint Returns 404
- [ ] Check file exists: `/ggvibe/public/.well-known/openai-apps-challenge`
- [ ] Verify no rewrites in `next.config.mjs` for this path
- [ ] Check middleware matcher excludes `/.well-known`
- [ ] Rebuild: `npm run build`

### Health Endpoint Missing Fields
- [ ] Check `/api/health/route.ts` includes all required fields
- [ ] Verify imports (getSession, getCanonicalUrl)
- [ ] Reset build: `rm -rf .next && npm run build`

### Chat Stream Not Streaming
- [ ] Verify Authorization header format: `Bearer <token>`
- [ ] Check ServerReadableStream implementation
- [ ] Monitor server logs for errors
- [ ] Test with curl first (before integration)

### OAuth Redirect Loop
- [ ] Check SESSION_COOKIE_DOMAIN not set in production
- [ ] Verify NEXT_PUBLIC_APP_URL matches canonical domain
- [ ] Check login redirect logic (should redirect to canonical in prod)
- [ ] Clear browser cookies/cache

