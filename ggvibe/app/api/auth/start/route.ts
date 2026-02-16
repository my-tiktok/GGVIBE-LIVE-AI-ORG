import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const redirectTo = new URL('/api/auth/signin', request.url);
  return NextResponse.redirect(redirectTo, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
