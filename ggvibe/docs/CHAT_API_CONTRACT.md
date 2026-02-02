# Chat API Contract (V1)

## Authentication

All chat endpoints require authentication via session cookie.
Unauthenticated requests return `401 Unauthorized`.

## Endpoints

### List Chats

```
GET /api/v1/chat
```

**Response (200):**
```json
{
  "chats": [
    {
      "id": "chat_123",
      "title": "Chat Title",
      "createdAt": "2026-02-02T10:00:00.000Z",
      "updatedAt": "2026-02-02T10:00:00.000Z"
    }
  ],
  "requestId": "req_abc123"
}
```

### Create Chat

```
POST /api/v1/chat
Content-Type: application/json

{
  "title": "Optional title"
}
```

**Response (201):**
```json
{
  "chat": {
    "id": "chat_123",
    "title": "New Chat",
    "createdAt": "2026-02-02T10:00:00.000Z"
  },
  "requestId": "req_abc123"
}
```

### Get Chat (Future)

```
GET /api/v1/chat/:id
```

### Send Message (Future)

```
POST /api/v1/chat/:id/message
Content-Type: application/json

{
  "content": "User message"
}
```

### Stream Response (Future)

```
POST /api/v1/chat/:id/stream
Content-Type: application/json

{
  "content": "User message"
}
```

**Response:** Server-Sent Events stream

## Error Responses

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human readable description",
  "requestId": "req_abc123"
}
```

## Implementation Status

| Endpoint | Status |
|----------|--------|
| GET /api/v1/chat | Stub (returns empty array) |
| POST /api/v1/chat | Stub (returns mock chat) |
| GET /api/v1/chat/:id | Not implemented |
| POST /api/v1/chat/:id/message | Not implemented |
| POST /api/v1/chat/:id/stream | Not implemented |

## Notes

- Chat storage requires database schema (future)
- Streaming requires OPENAI_API_KEY
- Mock mode available via CHAT_MOCK_RESPONSE=true
