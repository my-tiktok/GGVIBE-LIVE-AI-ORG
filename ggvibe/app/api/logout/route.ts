import { NextResponse } from 'next/server';
import { FIREBASE_SESSION_COOKIE_NAME } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const redirectTo = new URL('/api/auth/signout', request.url);
  const response = NextResponse.redirect(redirectTo, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store',
    },
  });

  // Clear the Firebase session cookie (used by phone OTP authentication)
  response.cookies.set(FIREBASE_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
