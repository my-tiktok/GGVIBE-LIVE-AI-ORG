# GGVIBE LIVE AI

## Overview
GGVIBE LIVE AI is an AI-powered chat assistant built with Next.js 15 (App Router), NextAuth, and Google OAuth. The application is deployed on Replit.

**Domain**: https://ggvibe-chatgpt-ai.com
**App Directory**: /ggvibe

## Project Structure
```
ggvibe/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Public landing page
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── privacy/page.tsx    # Privacy policy
│   ├── terms/page.tsx      # Terms of service
│   └── api/auth/[...nextauth]/route.ts  # NextAuth API
├── public/                 # Static assets
│   └── robots.txt          # SEO robots file
├── package.json            # Dependencies
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Technical Decisions
- **Framework**: Next.js 15.5.11 (App Router only)
- **Runtime**: Node.js (not Edge) for NextAuth compatibility
- **Port**: 5000 (bound to 0.0.0.0)
- **Platform**: Replit (NOT Vercel)

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
- `NEXTAUTH_URL`: https://ggvibe-chatgpt-ai.com
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `OPENAI_API_KEY`: OpenAI API key for chat

## User Preferences
- Deployment target: Replit ONLY (no Vercel)
- Node.js version: 20 LTS
- Package manager: npm

## Recent Changes
- 2026-02-01: Security update - upgraded Next.js 15.1.4 -> 15.5.11, next-auth 4.24.11 -> 4.24.13
- 2026-01-31: Production audit and cleanup
- 2026-01-31: Fixed dependency versions (Next.js 15.1.4)
- 2026-01-31: Removed output:'standalone' (not needed for Replit)
- 2026-01-31: Added /public directory with robots.txt
- 2026-01-31: Added dynamic sitemap
- 2026-01-31: Removed legacy server/ and components/ directories
- 2026-01-31: Cleaned up local .env file (use Replit Secrets)
