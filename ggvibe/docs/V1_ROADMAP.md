# V1 Roadmap

## Current Status: Auth Infrastructure Complete

### Completed ✓
- [x] Next.js 15 App Router setup
- [x] Replit OAuth integration (PKCE)
- [x] iron-session for secure sessions
- [x] PostgreSQL + Drizzle ORM
- [x] User persistence
- [x] Security headers
- [x] SEO (sitemap, robots.txt, canonical URLs)
- [x] Production deployment config

### Phase 1: AI Chat Foundation (Next)
- [ ] Chat API routes (`/api/chat/conversations`, `/api/chat/messages`)
- [ ] OpenAI integration (server-only)
- [ ] Streaming responses (SSE)
- [ ] Rate limiting (in-memory or Redis)
- [ ] Chat persistence in database

### Phase 2: Chat UI
- [ ] Chat interface component
- [ ] Message history display
- [ ] Streaming message rendering
- [ ] Loading and error states
- [ ] Mobile responsiveness

### Phase 3: Chat Features
- [ ] Conversation management
- [ ] Message search
- [ ] Export conversations
- [ ] System prompts / personas

### Phase 4: Production Hardening
- [ ] Rate limiting with Redis
- [ ] Usage analytics
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring

## API Contract Preview

### Conversations

```
GET /api/chat/conversations
Response: { conversations: [...], requestId: string }

POST /api/chat/conversations
Body: { title?: string }
Response: { id: string, title: string, createdAt: string }
```

### Messages

```
GET /api/chat/conversations/:id/messages
Response: { messages: [...], requestId: string }

POST /api/chat/conversations/:id/messages
Body: { content: string }
Response: { id: string, content: string, role: "user" | "assistant" }

POST /api/chat/conversations/:id/stream
Body: { content: string }
Response: SSE stream
```

## Environment Variables (Future)

```bash
# AI Chat
OPENAI_API_KEY=sk-...           # Required for chat
OPENAI_MODEL=gpt-4-turbo        # Optional, default: gpt-4-turbo
CHAT_MOCK_RESPONSE=true         # Optional, for testing

# Rate Limiting
RATE_LIMIT_REQUESTS=100         # Requests per window
RATE_LIMIT_WINDOW_MS=60000      # Window in milliseconds
```
