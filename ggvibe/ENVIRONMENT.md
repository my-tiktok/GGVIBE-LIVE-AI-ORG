# Environment Variables (Canonical Spec)

## Required for Vercel deployment

| Variable | Required | Example |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | `AIza...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | `project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | `project.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | `1234567890` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | `1:1234567890:web:abc123` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional | `G-XXXXXXXXXX` |
| `SESSION_SECRET` | Yes | `32+ random chars` |
| `KV_REST_API_URL` | Optional | `https://...upstash.io` | Recommended in production for shared login rate-limit store. |
| `KV_REST_API_TOKEN` | Optional | `...` | Token for KV REST API. |
| `UPSTASH_REDIS_REST_URL` | Optional | `https://...upstash.io` | Alternative alias for KV URL. |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | `...` | Alternative alias for KV token. |

## App configuration

| Variable | Required | Example | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes (prod) | `https://your-domain.vercel.app` | Canonical URL for links and callbacks. |
| `CHAT_MOCK_RESPONSE` | No | `false` | Deterministic mock chat mode in non-prod. |
| `ALLOWED_CORS_ORIGINS` | No | `https://chatgpt.com` | Comma-separated allowlist additions. |

## Firebase Auth providers to enable
- Email/Password
- Google
- GitHub
- Phone

## Firestore collections used
- `users/{uid}`
- `sellers/{uid}`
- `payoutRequests/{requestId}`
- `listings/{listingId}`

## Firestore security rules
Use `ggvibe/firestore.rules` and publish them from Firebase Console or CLI.
