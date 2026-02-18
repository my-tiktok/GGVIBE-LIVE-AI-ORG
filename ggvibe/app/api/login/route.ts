import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { FIREBASE_SESSION_COOKIE_NAME, getFirebaseAdminAuth } from '@/lib/firebase-admin';
import { getFailedLoginLimit, recordFailedLoginAttempt } from '@/lib/security/failed-login-rate-limit';
import { getRequestMeta, logError, logRequest, maskEmail } from '@/lib/observability/logger';

export const runtime = 'nodejs';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function baseHeaders(requestId: string): HeadersInit {
  return {
    'Cache-Control': 'no-store',
    'X-Request-Id': requestId,
  };
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const meta = getRequestMeta(request);
  const location = new URL('/api/auth/signin', request.url).toString();
  logRequest({
    event: 'api_request',
    type: 'INFO',
    requestId: meta.requestId,
    method: meta.method,
    path: meta.path,
    status: 307,
    durationMs: Date.now() - startedAt,
    ip: meta.ip,
    userAgent: meta.userAgent,
    details: { redirect: '/api/auth/signin' },
  });

  return NextResponse.redirect(location, {
    status: 307,
    headers: baseHeaders(meta.requestId),
  });
}

export async function OPTIONS(request: Request) {
  const meta = getRequestMeta(request);
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...baseHeaders(meta.requestId),
      Allow: 'GET, POST, OPTIONS',
    },
  });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const meta = getRequestMeta(request);

  let body: { idToken?: string; email?: string };
  try {
    body = (await request.json()) as { idToken?: string; email?: string };
  } catch (error) {
    logError({ type: 'VALIDATION_ERROR', requestId: meta.requestId, method: meta.method, path: meta.path, status: 400, durationMs: Date.now() - startedAt, ip: meta.ip, userAgent: meta.userAgent, error });
    return NextResponse.json({ error: 'invalid_request', requestId: meta.requestId }, { status: 400, headers: baseHeaders(meta.requestId) });
  }

  const idToken = body.idToken?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!idToken) {
    return NextResponse.json({ error: 'invalid_request', requestId: meta.requestId }, { status: 400, headers: baseHeaders(meta.requestId) });
  }

  // Check rate limit BEFORE attempting auth operations
  try {
    const limit = await getFailedLoginLimit(request, email);
    if (limit.limited) {
      return NextResponse.json(
        { error: 'rate_limited', requestId: meta.requestId },
        {
          status: 429,
          headers: {
            ...baseHeaders(meta.requestId),
            'Retry-After': String(limit.retryAfterSeconds ?? 60),
          },
        }
      );
    }
  } catch (limiterError) {
    logError({ type: 'SYSTEM_ERROR', requestId: meta.requestId, method: meta.method, path: meta.path, status: 503, durationMs: Date.now() - startedAt, ip: meta.ip, userAgent: meta.userAgent, error: limiterError });
    return NextResponse.json({ error: 'service_unavailable', requestId: meta.requestId }, { status: 503, headers: baseHeaders(meta.requestId) });
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });

    const cookieStore = await cookies();
    cookieStore.set(FIREBASE_SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_MS / 1000,
    });

    return NextResponse.json({ authenticated: true, uid: decoded.uid, requestId: meta.requestId }, { status: 200, headers: baseHeaders(meta.requestId) });
  } catch (error) {
    // Record the failed attempt (best effort - don't fail the auth response if limiter fails)
    try {
      await recordFailedLoginAttempt(request, email, { requestId: meta.requestId, path: meta.path });
    } catch (limiterError) {
      logError({ type: 'SYSTEM_ERROR', requestId: meta.requestId, method: meta.method, path: meta.path, status: 500, durationMs: Date.now() - startedAt, ip: meta.ip, userAgent: meta.userAgent, error: limiterError });
    }

    logError({
      type: 'AUTH_ERROR',
      requestId: meta.requestId,
      method: meta.method,
      path: meta.path,
      status: 401,
      durationMs: Date.now() - startedAt,
      ip: meta.ip,
      userAgent: meta.userAgent,
      error,
      details: { email: maskEmail(email) },
    });

    return NextResponse.json({ error: 'unauthorized', requestId: meta.requestId }, { status: 401, headers: baseHeaders(meta.requestId) });
  }
}
