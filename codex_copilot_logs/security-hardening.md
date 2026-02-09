# Security Hardening Log

## Issues Identified
- **CORS overly permissive (medium):** `buildCorsHeaders` reflected any Origin without validation, allowing cross-origin requests from arbitrary domains.
- **Missing HSTS in production (low):** HTTPS strict transport not enforced in global headers.

## Changes Applied
- Restricted CORS to an explicit allowlist derived from canonical + Replit domains and configured app URLs.
- Added `Strict-Transport-Security` in production responses to enforce HTTPS.

## Notes
- No auth flows or API contracts were changed.
- CORS allowlist only affects MCP endpoints that use `buildCorsHeaders`.
