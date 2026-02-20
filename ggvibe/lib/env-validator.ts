
import "server-only";

const REQUIRED_ENV_VARS = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "DATABASE_URL",
  "OPENAI_API_KEY",
  "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64",
] as const;

const CANONICAL_PRODUCTION_URL = "https://www.ggvibe-chatgpt-ai.org";

export function validateEnvironment() {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXTAUTH_URL !== CANONICAL_PRODUCTION_URL
  ) {
    throw new Error(
      `Invalid NEXTAUTH_URL for production. Must be ${CANONICAL_PRODUCTION_URL}.`
    );
  }

  try {
    const decoded = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64!,
      "base64"
    ).toString("utf-8");
    JSON.parse(decoded);
  } catch (error) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is not a valid Base64-encoded JSON string.");
  }
}
