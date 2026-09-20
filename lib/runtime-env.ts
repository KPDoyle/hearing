type HearingRuntimeEnv = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
};

/**
 * Environment values available to the standard Next.js runtime.
 *
 * Cloudflare object bindings are intentionally optional. When they are not
 * present (for example on Vercel), the client automatically opens the local
 * demonstration workspace instead of presenting a broken application.
 */
export const env: HearingRuntimeEnv = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
