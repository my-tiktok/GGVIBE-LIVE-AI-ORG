# Replit Deployment Guide

## Prerequisites

1. Replit account with Deployments access
2. Custom domain configured (optional)

## Required Secrets

Set these in Replit Secrets (padlock icon):

| Secret | Required | Description |
|--------|----------|-------------|
| `SESSION_SECRET` | Yes | Min 32 chars, random string for session encryption |
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-provided by Replit DB) |
| `REPL_ID` | Yes | Replit project ID (auto-provided) |
| `OPENAI_API_KEY` | For chat | OpenAI API key for AI responses |
| `OPENAI_APPS_CHALLENGE_TOKEN` | For OpenAI Apps | Token for OpenAI Apps domain verification |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical URL (e.g., `https://ggvibe-chatgpt-ai.org`) |
| `NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME` | Optional | Mobile app deep link (e.g., `ggvibe://`) |

### Generate SESSION_SECRET

```bash
openssl rand -base64 32
```

## Replit Auth Configuration

Configure these settings in your Replit project:

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

**Important:** Do NOT include preview URLs in production OAuth config.

## Deployment Steps

### 1. Build & Test Locally

Deployment runs from the **repo root**, which delegates to `/ggvibe`:

```bash
# From repo root
npm run build   # Runs: cd ggvibe && npm ci && npm run build
npm start       # Runs: cd ggvibe && npm run start
```

Or directly in ggvibe:

```bash
cd ggvibe
npm ci
npm run build
```

### 2. Verify Secrets

Ensure all required secrets are set in Replit Secrets tab.

### 3. Deploy

1. Click "Deploy" button in Replit
2. Select "Autoscale" deployment type
3. Confirm deployment

### 4. Post-Deployment Verification

Run smoke test:

```bash
# Health check
curl -s https://ggvibe-chatgpt-ai.org/api/health | jq

# V1 Health check
curl -s https://ggvibe-chatgpt-ai.org/api/v1/health | jq

# OpenAI Apps challenge (should return 200, text/plain, token only)
curl -i https://ggvibe-chatgpt-ai.org/.well-known/openai-apps-challenge

# MCP endpoint
curl -s https://ggvibe-chatgpt-ai.org/mcp | jq

# Auth user (should return 401)
curl -sI https://ggvibe-chatgpt-ai.org/api/v1/auth/user

# Login redirect (should return 307)
curl -sI https://ggvibe-chatgpt-ai.org/api/login | grep -E "^(HTTP|Location)"
```

## Dual Domain Support

Both domains work identically:
- **Canonical:** `https://ggvibe-chatgpt-ai.org`
- **Secondary:** `https://ggvibe-live-ai-1.replit.app`

OAuth is configured to accept callbacks from both domains.

## Troubleshooting

### OAuth "invalid_callback" Error

1. Check Authorized Redirect URIs in Replit Auth settings
2. Verify `NEXT_PUBLIC_APP_URL` matches your domain
3. Clear cookies and try again

### Session Not Persisting

1. Verify `SESSION_SECRET` is set and at least 32 characters
2. Check browser accepts cookies from the domain
3. Ensure `secure` cookies work (HTTPS required in production)

### Health Check Shows "degraded"

1. Check all required secrets are set
2. Verify DATABASE_URL is valid
3. Review warning messages in deployment logs

## Production Checklist

- [ ] SESSION_SECRET set (32+ chars)
- [ ] DATABASE_URL configured
- [ ] NEXT_PUBLIC_APP_URL set to canonical domain
- [ ] OPENAI_APPS_CHALLENGE_TOKEN set (for OpenAI Apps verification)
- [ ] Replit Auth origins include both domains
- [ ] Replit Auth redirect URIs include both domains
- [ ] Health endpoint returns "healthy"
- [ ] OpenAI Apps challenge returns 200 + text/plain + token
- [ ] MCP endpoint returns 200 + JSON
- [ ] Login flow works end-to-end
- [ ] Security headers present (check with curl -I)
