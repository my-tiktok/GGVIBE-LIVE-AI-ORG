import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/next-auth';
import { FIREBASE_SESSION_COOKIE_NAME, getFirebaseAdminAuth } from '@/lib/firebase-admin';
import { getRequestMeta, logError, logRequest } from '@/lib/observability/logger';

export const runtime = 'nodejs';

type AuthenticatedUser = {
  uid: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
};

async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const session = await getAuthSession();
  if (session?.user?.email) {
    return {
      uid: session.user.id || session.user.email,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    };
  }

  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  const adminAuth = getFirebaseAdminAuth();

  if (bearer) {
    try {
      const decoded = await adminAuth.verifyIdToken(bearer, true);
      return {
        uid: decoded.uid,
        email: decoded.email ?? null,
      };
    } catch {
      return null;
    }
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(FIREBASE_SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const meta = getRequestMeta(request);

  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: 'unauthorized', requestId: meta.requestId },
        { status: 401, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': meta.requestId } }
      );
    }

    logRequest({ event: 'api_request', type: 'INFO', requestId: meta.requestId, method: meta.method, path: meta.path, status: 200, durationMs: Date.now() - startedAt, ip: meta.ip, userAgent: meta.userAgent, userId: user.uid });
    return NextResponse.json({ authenticated: true, user, requestId: meta.requestId }, { headers: { 'Cache-Control': 'no-store', 'X-Request-Id': meta.requestId } });
  } catch (error) {
    logError({ type: 'AUTH_ERROR', requestId: meta.requestId, method: meta.method, path: meta.path, status: 401, durationMs: Date.now() - startedAt, ip: meta.ip, userAgent: meta.userAgent, error });
    return NextResponse.json(
      { authenticated: false, error: 'unauthorized', requestId: meta.requestId },
      { status: 401, headers: { 'Cache-Control': 'no-store', 'X-Request-Id': meta.requestId } }
    );
  }
}
