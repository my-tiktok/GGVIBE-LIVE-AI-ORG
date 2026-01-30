# GGVIBE LIVE AI

## Overview
GGVIBE LIVE AI is an AI-powered chat assistant built with Next.js 16 (App Router), NextAuth, Firebase, and Google OAuth. The application is deployed on Replit.

**Domain**: https://ggvibe-chatgpt-ai.com
**App Directory**: /ggvibe

## Project Structure
```
ggvibe/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Public landing page
│   ├── privacy/page.tsx    # Privacy policy
│   ├── terms/page.tsx      # Terms of service
│   └── api/auth/[...nextauth]/route.ts  # NextAuth API
├── components/             # React components (future)
├── server/                 # Fastify backend (legacy)
├── package.json            # Dependencies
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Technical Decisions
- **Router**: App Router ONLY (no Pages Router)
- **Runtime**: Node.js (not Edge) for NextAuth compatibility
- **Port**: 5000 (bound to 0.0.0.0)
- **Output**: Standalone build for Replit deployment

## Running the Project
```bash
cd ggvibe
npm install
npm run dev   # Development
npm run build # Production build
npm run start # Production server
```

## Recent Changes
- 2026-01-30: Converted from Pages Router to App Router
- 2026-01-30: Created public landing page with GGVIBE LIVE AI branding
- 2026-01-30: Added /privacy and /terms pages
- 2026-01-30: Set up NextAuth with Node.js runtime
- 2026-01-30: Removed all Vercel-specific configuration

## Environment Variables Required
- `NEXTAUTH_URL`: Full URL of the app
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `OPENAI_API_KEY`: OpenAI API key for chat

## User Preferences
- Deployment target: Replit ONLY (no Vercel)
- Node.js version: 20 LTS
- Package manager: npm
