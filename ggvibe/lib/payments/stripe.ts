import "server-only";

export type StripeConfig = {
  secretKey?: string;
  webhookSecret?: string;
  priceId?: string;
};

/**
 * Stripe-only provider config. Keep secrets server-side.
 * This module is intentionally minimal to avoid new runtime behavior.
 */
export function getStripeConfig(): StripeConfig {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceId: process.env.STRIPE_PRICE_ID,
  };
}

export function assertStripeConfigured(): void {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe operations.");
  }
}
