const REQUIRED_ENV_VARS = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
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
    if (!process.env[key]) missing.push(key);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    warnings.push("Google OAuth vars missing: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET.");
  }
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    warnings.push("GitHub OAuth vars missing: GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET.");
  }
  if (!process.env.EMAIL_SERVER || !process.env.EMAIL_FROM) {
    warnings.push("Email magic-link vars missing: EMAIL_SERVER/EMAIL_FROM.");
  }

  return { valid: missing.length === 0, missing, warnings };
}

export function requireEnv(): void {
  const result = validateEnv();
  if (!result.valid) {
    const message = `Missing required environment variables: ${result.missing.join(", ")}`;
    throw new Error(message);
  }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
