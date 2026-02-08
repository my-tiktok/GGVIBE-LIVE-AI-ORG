# GGVIBE LIVE AI

## Overview
GGVIBE LIVE AI is an AI-powered chat assistant built with Next.js 15 (App Router) and Replit Auth. The application is deployed on Replit.

**Domain**: https://ggvibe-chatgpt-ai.org
**App Directory**: /ggvibe

## Project Structure
```
ggvibe/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Public landing page (with auth)
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── login/page.tsx      # Login page with error handling
│   ├── auth/success/page.tsx  # Post-login success (mobile deep-link)
│   ├── privacy/page.tsx    # Privacy policy
│   ├── terms/page.tsx      # Terms of service
│   └── api/
│       ├── login/route.ts      # Replit Auth login
│       ├── logout/route.ts     # Replit Auth logout
│       ├── callback/route.ts   # Replit Auth callback
│       ├── auth/
│       │   ├── user/route.ts   # Get current user (legacy)
│       │   └── health/route.ts # Health check (legacy)
│       └── v1/                 # V1 API (frozen contract)
│           ├── health/route.ts # Health check
│           ├── auth/user/route.ts # Get current user
│           └── chat/route.ts   # Chat list/create
├── lib/                    # Shared libraries
│   ├── db.ts               # Database connection (Drizzle)
│   ├── schema.ts           # Database schema (users, sessions)
│   ├── session.ts          # Iron-session config
│   ├── env.ts              # Environment validation
│   ├── request-id.ts       # Request ID generation
│   └── url/base-url.ts     # Canonical URL resolution
├── docs/                   # Documentation
│   ├── REPLIT_DEPLOY.md    # Deployment guide
│   ├── AUTH_SESSION_LIFECYCLE.md
│   ├── API_VERSIONING.md   # V1 freeze policy
│   ├── CHAT_API_CONTRACT.md
│   └── PRODUCTION_CHECKLIST.md
├── scripts/
│   └── smoke-test.sh       # Production smoke test
├── hooks/                  # React hooks
│   └── use-auth.ts         # Auth hook for client
├── public/                 # Static assets
│   ├── robots.txt          # SEO robots file
│   └── google9f42a96e5d7ac88a.html  # Google Search Console verification
├── package.json            # Dependencies
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## MCP Endpoints
- `/mcp` - MCP server manifest (JSON)
- `/mcp/health` - MCP health check (JSON)
- `/mcp/version` - MCP version info (JSON)
- `/.well-known/openai-apps-challenge` - OpenAI domain verification

## Key Technical Decisions
- **Framework**: Next.js 15.5.12 (App Router only)
- **Authentication**: Replit Auth (OpenID Connect) with iron-session
- **Database**: PostgreSQL with Drizzle ORM
- **Port**: ${PORT:-5000} (dynamic with fallback, bound to 0.0.0.0)
- **Platform**: Replit (NOT Vercel)
- **Deployment**: autoscale (Replit Production Deployment)

## Running the Project
```bash
cd ggvibe
npm ci        # Clean install from lockfile
npm run dev   # Development
npm run build # Production build
npm run start # Production server
```

## Build Commands
- `npm run dev`: Development server on port 5000
- `npm run build`: Production build
- `npm run start`: Production server on port 5000

## Static Files
Place verification files (Google Search Console, etc.) in `ggvibe/public/`:
- Example: `ggvibe/public/google123abc.html`
- Accessible at: `https://ggvibe-chatgpt-ai.org/google123abc.html`

## Environment Variables Required
These are set as Replit Secrets:
- `SESSION_SECRET` or `NEXTAUTH_SECRET`: Random secret for session encryption (auto-provided)
- `DATABASE_URL`: PostgreSQL connection string (auto-provided)
- `REPL_ID`: Replit project ID (auto-provided)
- `OPENAI_API_KEY`: OpenAI API key for chat

## Authentication
Replit Auth is used for user authentication via OpenID Connect.
- Login: `/api/login` - Redirects to Replit for authentication
- Logout: `/api/logout` - Clears session and logs out
- User API: `/api/auth/user` - Returns current authenticated user

## User Preferences
- Deployment target: Replit ONLY (no Vercel)
- Node.js version: 20 LTS
- Package manager: npm

## Recent Changes
- 2026-02-08: CRITICAL FIX - Updated OpenAI verification token to correct value (neoIMNB3-...)
- 2026-02-08: FIX - /mcp/health always returns HTTP 200 (was 503 on missing env, blocking scanner)
- 2026-02-08: FIX - Env validation accepts NEXTAUTH_SECRET as SESSION_SECRET fallback
- 2026-02-08: CLEANUP - Removed unused deps: next-auth, passport, express-session, connect-pg-simple
- 2026-02-08: Added ggvibe/.gitignore (prevents .next from being committed)
- 2026-02-08: Created docs/OPERATIONS.md with deploy config, verification, and troubleshooting
- 2026-02-08: Production stabilization - installed missing dependencies, created database
- 2026-02-08: Fixed CSP frame-ancestors to allow Replit iframe preview
- 2026-02-08: Fixed allowedDevOrigins to include all Replit domains dynamically
- 2026-02-08: Replaced Firebase auth stub in chat stream with iron-session auth
- 2026-02-08: Fixed tsconfig.json duplicate baseUrl
- 2026-02-08: Added server-only package dependency
- 2026-02-08: Removed ISSUER_URL from required env vars (has fallback default)
- 2026-02-08: Updated MCP endpoint authentication description
- 2026-02-08: Configured deploy: autoscale with build from ggvibe/
- 2026-02-08: Verified: build passes, all MCP endpoints return JSON, .well-known accessible
- 2026-02-02: INCIDENT FIX - Canonical host enforcement for OAuth to fix login persistence
- 2026-02-02: INCIDENT FIX - Host-only cookies (no Domain attr) to prevent cross-domain issues
- 2026-02-02: INCIDENT FIX - SESSION_COOKIE_DOMAIN warning if set, recommend deletion
- 2026-02-02: INCIDENT FIX - Frontend auth hook uses cache: no-store
- 2026-02-02: INCIDENT FIX - /api/auth/user returns authenticated:true/false flag
- 2026-02-02: Added REPLIT_DEPLOY_RUNBOOK.md with exact secrets and verification steps
- 2026-02-02: V1 API namespace - /api/v1/health, /api/v1/auth/user, /api/v1/chat with frozen contract
- 2026-02-02: Mobile OAuth flow - /auth/success page with deep-link support (NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME)
- 2026-02-02: Login page - /login with error handling and user-friendly messages
- 2026-02-02: Env validation - lib/env.ts with fail-fast for missing required vars
- 2026-02-02: OAuth robustness - invalid_grant handled gracefully, requestId on all responses
- 2026-02-02: Smoke test script - scripts/smoke-test.sh for production validation
- 2026-02-02: Documentation - REPLIT_DEPLOY.md, API_VERSIONING.md, CHAT_API_CONTRACT.md
- 2026-02-02: Production hardening - added lib/http/result.ts for type-safe HTTP responses
- 2026-02-02: Production hardening - added lib/url/base-url.ts for centralized URL resolution
- 2026-02-02: Production hardening - added /api/auth/health endpoint
- 2026-02-02: Production hardening - removed all `as any` casts from callback route
- 2026-02-02: Production hardening - added requestId to all API responses
- 2026-02-02: Production hardening - added docs/ with PRODUCTION_CHECKLIST.md, AUTH_SESSION_LIFECYCLE.md, V1_ROADMAP.md
- 2026-02-02: Removed root package.json/lockfile to eliminate multi-lockfile warning
- 2026-02-02: Added outputFileTracingRoot to next.config.mjs for proper workspace detection
- 2026-02-02: Updated deployment to use npm ci for deterministic builds
- 2026-02-02: Added replit.app domain to production allowedDevOrigins
- 2026-02-02: Production hardening - fixed OAuth baseUrl detection using x-forwarded headers
- 2026-02-02: SEO hardening - canonical URLs, sitemap, robots.txt all point to .org domain
- 2026-02-02: Security update - allowedDevOrigins now environment-aware (no wildcards in prod)
- 2026-02-02: Updated hono 4.10.6 -> 4.11.4 (security fix)
- 2026-02-02: Added Replit Auth with iron-session for secure authentication
- 2026-02-02: Added PostgreSQL database with Drizzle ORM for users/sessions
- 2026-02-01: Production deployment config - $PORT fallback, autoscale deployment target, allowedDevOrigins
- 2026-02-01: Added Google Search Console verification file
- 2026-02-01: Security update - upgraded Next.js 15.1.4 -> 15.5.11, next-auth 4.24.11 -> 4.24.13
- 2026-01-31: Production audit and cleanup
- 2026-01-31: Fixed dependency versions (Next.js 15.1.4)
- 2026-01-31: Removed output:'standalone' (not needed for Replit)
- 2026-01-31: Added /public directory with robots.txt
- 2026-01-31: Added dynamic sitemap
- 2026-01-31: Removed legacy server/ and components/ directories
- 2026-01-31: Cleaned up local .env file (use Replit Secrets)
