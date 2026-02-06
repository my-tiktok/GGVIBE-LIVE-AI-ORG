import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCanonicalUrl } from '@/lib/url/base-url';

export async function GET() {
  try {
    const session = await getSession();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.REPLIT_DEPLOYMENT_URL;
    const sessionSecret = !!process.env.SESSION_SECRET;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      authenticated: !!session.isLoggedIn,
      appUrlConfigured: !!appUrl,
      sessionSecretConfigured: sessionSecret,
      canonicalUrl: getCanonicalUrl(),
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      authenticated: false,
      appUrlConfigured: !!process.env.NEXT_PUBLIC_APP_URL || !!process.env.REPLIT_DEPLOYMENT_URL,
      sessionSecretConfigured: !!process.env.SESSION_SECRET,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}
