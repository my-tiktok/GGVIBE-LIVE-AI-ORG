# Operations

## Health and status checks

```bash
curl -i https://<domain>/
curl -i https://<domain>/mcp
curl -i https://<domain>/mcp/health
curl -i https://<domain>/mcp/version
```

## Auth flow

The login and callback routes enforce canonical-host redirects in production.
