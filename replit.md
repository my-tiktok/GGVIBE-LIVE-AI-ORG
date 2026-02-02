# GGVIBE LIVE AI

## Overview
GGVIBE LIVE AI is an AI-powered chat assistant built with Next.js 15 (App Router) and Replit Auth. The application is deployed on Replit.

**Domain**: https://ggvibe-chatgpt-ai.com
**App Directory**: /ggvibe

## Project Structure
```
ggvibe/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Public landing page (with auth)
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── privacy/page.tsx    # Privacy policy
│   ├── terms/page.tsx      # Terms of service
│   └── api/
│       ├── login/route.ts      # Replit Auth login
│       ├── logout/route.ts     # Replit Auth logout
│       ├── callback/route.ts   # Replit Auth callback
│       └── auth/user/route.ts  # Get current user
├── lib/                    # Shared libraries
│   ├── db.ts               # Database connection (Drizzle)
│   ├── schema.ts           # Database schema (users, sessions)
│   ├── session.ts          # Iron-session config
│   └── auth.ts             # Auth utilities
├── hooks/                  # React hooks
│   └── use-auth.ts         # Auth hook for client
├── public/                 # Static assets
│   ├── robots.txt          # SEO robots file
│   └── google9f42a96e5d7ac88a.html  # Google Search Console verification
├── package.json            # Dependencies
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Technical Decisions
- **Framework**: Next.js 15.5.11 (App Router only)
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
- Accessible at: `https://ggvibe-chatgpt-ai.com/google123abc.html`

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
