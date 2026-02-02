# API Versioning Policy

## Version Namespace

All stable API endpoints live under `/api/v1/*`.

## V1 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check with env validation |
| GET | `/api/v1/auth/user` | Get authenticated user |
| GET | `/api/v1/chat` | List user chats |
| POST | `/api/v1/chat` | Create new chat |

## Freeze Policy

V1 is a **frozen** contract:

1. **No breaking changes** to response shapes
2. **No removal** of existing fields
3. **Optional fields only** may be added
4. **Breaking changes** require a new version (v2)

## Error Response Format

All V1 endpoints return errors in this format:

```json
{
  "error": "error_code",
  "message": "Human readable message",
  "requestId": "req_abc123_xyz789"
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Not authenticated |
| `forbidden` | 403 | Not authorized |
| `not_found` | 404 | Resource not found |
| `validation_error` | 400 | Invalid request body |
| `internal_error` | 500 | Server error |

## Request ID

Every response includes:
- `X-Request-Id` header
- `requestId` field in JSON body

Use this for debugging and support requests.

## Legacy Endpoints

The following endpoints are **not versioned** (auth flow):
- `/api/login` - Initiates OAuth
- `/api/callback` - OAuth callback
- `/api/logout` - Logout

These endpoints redirect rather than return JSON.

## Future Versions

When V2 is needed:
1. Create `/api/v2/*` namespace
2. Document breaking changes
3. Deprecation notice on V1 endpoints
4. Minimum 6-month support overlap
