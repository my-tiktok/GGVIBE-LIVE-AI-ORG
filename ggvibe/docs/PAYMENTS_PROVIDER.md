# Payments Provider (Stripe Only)

GGVIBE is Stripe-only. Paystack is not supported or referenced in this codebase.

## Environment Variables
- `STRIPE_SECRET_KEY` (required for server-side Stripe operations)
- `STRIPE_WEBHOOK_SECRET` (required if webhooks are enabled)
- `STRIPE_PRICE_ID` (optional, if using predefined pricing)

## Notes
- Secrets must remain server-only (never use `NEXT_PUBLIC_*`).
- Do not add alternate payment providers without explicit approval.
