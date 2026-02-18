const CANONICAL_NEXTAUTH_URL = 'https://www.ggvibe-chatgpt-ai.org';

type RequiredEnvName =
  | 'NEXTAUTH_URL'
  | 'NEXTAUTH_SECRET'
  | 'GOOGLE_CLIENT_ID'
  | 'GOOGLE_CLIENT_SECRET'
  | 'FIREBASE_SERVICE_ACCOUNT_KEY';

export type HealthReport = {
  status: 'ok' | 'unhealthy';
  code?: 'missing_env';
  missingEnv: RequiredEnvName[];
  configuredServices: {
    nextAuth: boolean;
    googleOAuth: boolean;
    githubOAuth: boolean;
    firebaseClient: boolean;
    firebaseAdmin: boolean;
    emailProvider: boolean;
    rateLimiter: boolean;
  };
  timestamp: string;
};

function hasFirebaseServiceAccount(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
}

function isAllowedNextAuthUrl(nextAuthUrl: string): boolean {
  if (process.env.NODE_ENV === 'production') {
    return nextAuthUrl === CANONICAL_NEXTAUTH_URL;
  }

  try {
    const parsed = new URL(nextAuthUrl);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function getHealthReport(): HealthReport {
  const missingEnv: RequiredEnvName[] = [];

  if (!process.env.NEXTAUTH_URL || !isAllowedNextAuthUrl(process.env.NEXTAUTH_URL)) {
    missingEnv.push('NEXTAUTH_URL');
  }
  if (!process.env.NEXTAUTH_SECRET) {
    missingEnv.push('NEXTAUTH_SECRET');
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    missingEnv.push('GOOGLE_CLIENT_ID');
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    missingEnv.push('GOOGLE_CLIENT_SECRET');
  }
  if (!hasFirebaseServiceAccount()) {
    missingEnv.push('FIREBASE_SERVICE_ACCOUNT_KEY');
  }

  const healthy = missingEnv.length === 0;

  return {
    status: healthy ? 'ok' : 'unhealthy',
    ...(healthy ? {} : { code: 'missing_env' as const }),
    missingEnv,
    configuredServices: {
      nextAuth: Boolean(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL),
      googleOAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      githubOAuth: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      firebaseClient: Boolean(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
          process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      ),
      firebaseAdmin: hasFirebaseServiceAccount(),
      emailProvider: Boolean(
        process.env.NEXTAUTH_ENABLE_EMAIL === 'true' &&
          process.env.EMAIL_SERVER &&
          process.env.EMAIL_FROM
      ),
      rateLimiter: Boolean(
        process.env.UPSTASH_REDIS_KV_REST_API_URL && process.env.UPSTASH_REDIS_KV_REST_API_TOKEN
      ),
    },
    timestamp: new Date().toISOString(),
  };
}
