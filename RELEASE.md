# Release Checklist

## Build & Validation
- [ ] `cd ggvibe && npm ci`
- [ ] `npm run build`

## Environment
- [ ] `REPL_ID`, `ISSUER_URL`, `DATABASE_URL`, `SESSION_SECRET` configured in runtime env
- [ ] `MCP_ALLOWED_ORIGINS` set if MCP should be restricted beyond defaults

## Release Tagging
- Use semantic version tags: `vMAJOR.MINOR.PATCH`
- Tag after CI passes on `main`
