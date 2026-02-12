# Release Checklist

## Pre-release
- [ ] Branch is up-to-date with `main`
- [ ] `cd ggvibe && npm ci`
- [ ] `cd ggvibe && npm run lint`
- [ ] `cd ggvibe && npm run test`
- [ ] `cd ggvibe && npm run build`

## Runtime verification
- [ ] Start app: `cd ggvibe && npm run start`
- [ ] `curl -i http://localhost:3000/` returns `200`
- [ ] `curl -i http://localhost:3000/robots.txt` returns `200` and includes `Disallow: /payouts`
- [ ] `curl -i http://localhost:3000/mcp` returns `200` and JSON includes top-level `tools` + `endpoints`
- [ ] `curl -i http://localhost:3000/payouts` returns `401` with `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`
- [ ] `curl -i http://localhost:3000/payouts.txt` returns `404`

## Deployment
- [ ] Vercel Root Directory is `ggvibe`
- [ ] Environment variables configured per `ggvibe/ENVIRONMENT.md`
