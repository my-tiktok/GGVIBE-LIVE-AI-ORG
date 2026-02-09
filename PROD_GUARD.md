# Production Guardrails (GGVIBE)

## Invariants (Do Not Break)
- **No secrets in `NEXT_PUBLIC_*`**: server-only secrets must remain server-side.
- **Auth required for protected routes**: APIs under `/api/v1` and streaming endpoints require auth.
- **Replit build/run commands are fixed**:
  - Build: `cd ggvibe && npm ci --no-audit --no-fund && NODE_OPTIONS="--max-old-space-size=1536" npm run build`
  - Run: `cd ggvibe && npm run start`
- **No heavy install hooks**: avoid `preinstall`, `install`, `postinstall`, or `prepare` hooks that run builds or codegen.
- **Auto-install must stay low-memory**: keep `ggvibe/.npmrc` safeguards intact.

## Notes
- If behavior differs between local and Replit, update `replit.md` with the reason.
