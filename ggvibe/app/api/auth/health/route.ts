import { NextResponse } from 'next/server';
import { generateRequestId } from '@/lib/http/result';

export async function GET() {
  const requestId = generateRequestId();

  const checks = {
    nextauth_secret: Boolean(process.env.NEXTAUTH_SECRET),
    nextauth_url: Boolean(process.env.NEXTAUTH_URL),
    google_provider: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github_provider: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    email_provider: Boolean(process.env.EMAIL_SERVER && process.env.EMAIL_FROM),
    firebase_admin: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
  };

  const healthy = checks.nextauth_secret && checks.nextauth_url;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      requestId,
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'X-Request-Id': requestId,
      },
    }
  );
}
