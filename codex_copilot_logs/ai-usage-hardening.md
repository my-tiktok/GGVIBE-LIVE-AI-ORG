# AI Usage Hardening Log

## Findings
- Streaming chat endpoint did not enforce per-user rate limits or token caps.
- Streaming handler did not close promptly on client aborts, which can leak resources.
- No metadata-only logging around AI stream lifecycle.

## Changes
- Added per-IP and per-user rate limits for chat streaming.
- Enforced a maxTokens upper bound to prevent runaway token usage.
- Added abort handling and stream cancellation cleanup.
- Added metadata-only logging (requestId, userId, content length) with no prompt/output logging.

## Notes
- No model selection or prompt behavior changes were introduced.
- All changes are server-side and preserve API shape.
