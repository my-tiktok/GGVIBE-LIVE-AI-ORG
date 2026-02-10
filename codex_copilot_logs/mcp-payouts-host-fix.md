# MCP / Payouts / Host Hardening Log

## Changes
- Added Node.js runtime export to MCP route and kept tools metadata intact.
- Used x-forwarded-host to avoid 0.0.0.0 canonical host redirects in OAuth login/callback.
- Added private /payouts page with auth redirect and noindex controls.
- Added X-Robots-Tag for /payouts and robots.txt disallow.

## Notes
- No API response shapes changed (additive only).
- Auth/session behavior preserved; unauthenticated users are redirected to /api/login on /payouts.
