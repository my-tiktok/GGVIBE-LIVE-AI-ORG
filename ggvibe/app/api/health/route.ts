import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCanonicalUrl } from '@/lib/url/base-url';

const REQUIRED_FIREBASE_ENV = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

function firebaseEnvStatus() {
  const missing = REQUIRED_FIREBASE_ENV.filter((key) => !process.env[key]);
  return {
    configured: missing.length === 0,
    missing,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const sessionSecret = !!process.env.SESSION_SECRET;
    const firebase = firebaseEnvStatus();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      authenticated: !!session.isLoggedIn,
      appUrlConfigured: !!appUrl,
      sessionSecretConfigured: sessionSecret,
      firebaseConfigured: firebase.configured,
      missingFirebaseEnv: firebase.missing,
      canonicalUrl: getCanonicalUrl(),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    const firebase = firebaseEnvStatus();

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      authenticated: false,
      appUrlConfigured: !!process.env.NEXT_PUBLIC_APP_URL,
      sessionSecretConfigured: !!process.env.SESSION_SECRET,
      firebaseConfigured: firebase.configured,
      missingFirebaseEnv: firebase.missing,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}
