# 401 Public Routes Remediation

## Root Cause
- Middleware matcher was broad enough to run on public routes.
- In production, this increased the blast radius for upstream auth gating behavior.

## Fix
- Restricted `ggvibe/middleware.ts` matcher to `/payouts/:path*` only.
- Preserved middleware implementation (`NextResponse.next()`) and existing auth flows.

## Public Route Guarantees
- `/`, `/robots.txt`, `/sitemap.xml`, `/mcp` are no longer matched by middleware.
- `/payouts` remains private via page-level auth redirect.
