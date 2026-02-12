const REQUIRED_ENV_VARS = [
  "SESSION_SECRET",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const OPTIONAL_ENV_VARS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME",
  "OPENAI_API_KEY",
  "CHAT_MOCK_RESPONSE",
  "ALLOWED_CORS_ORIGINS",
] as const;

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    warnings.push(
      "NEXT_PUBLIC_APP_URL is not set. Canonical links and cookie domain derivation may fail in production."
    );
  }

  if (!process.env.OPENAI_API_KEY && process.env.CHAT_MOCK_RESPONSE !== "true") {
    warnings.push("OPENAI_API_KEY not set and CHAT_MOCK_RESPONSE is not 'true'. Chat will fail.");
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function requireEnv(): void {
  const result = validateEnv();
  if (!result.valid) {
    const message = `Missing required environment variables: ${result.missing.join(", ")}`;
    console.error(`[ENV] FATAL: ${message}`);
    throw new Error(message);
  }
  for (const warning of result.warnings) {
    console.warn(`[ENV] WARNING: ${warning}`);
  }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getDeepLinkScheme(): string | undefined {
  return process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME;
}

void OPTIONAL_ENV_VARS;
