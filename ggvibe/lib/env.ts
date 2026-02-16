const REQUIRED_ENV_VARS = ['SESSION_SECRET'] as const;

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key] && !process.env.NEXTAUTH_SECRET) {
      missing.push(key);
    }
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    warnings.push('NEXT_PUBLIC_APP_URL is recommended for canonical redirects.');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getDeepLinkScheme(): string | undefined {
  return process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_SCHEME;
}
